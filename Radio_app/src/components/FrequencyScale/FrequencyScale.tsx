import { useCallback, useMemo, useRef, useState } from 'react';
import type { DimensionValue } from 'react-native';
import { LayoutChangeEvent, Platform, Text, useWindowDimensions, View } from 'react-native';
import {
  FREQUENCY_RANGE,
  INFORMATION_FIELD_BANDS,
  stationsInInformationBand,
} from '@/src/data/radioData';
import type { Station } from '@/src/types/radio';
import { DIAL_INK, styles } from './FrequencyScale.module';

/** Минимальный отступ слота от края контента (px) — сужается на очень узких шкалах. */
const EDGE_INSET_DEFAULT = 4;
const EDGE_INSET_NARROW = 2;

function pctAlong(f: number): DimensionValue {
  const { min, max } = FREQUENCY_RANGE;
  const t = (f - min) / Math.max(1e-6, max - min);
  const p = Math.max(0, Math.min(100, t * 100));
  return `${p}%` as DimensionValue;
}

/** Пока нет измерения ширины — слегка втянуть к центру, чтобы крайние подписи не упирались в рамку. */
function pctAlongInset(f: number): DimensionValue {
  const { min, max } = FREQUENCY_RANGE;
  const t = (f - min) / Math.max(1e-6, max - min);
  const inset = 4.5;
  const p = inset + t * (100 - 2 * inset);
  return `${Math.max(0, Math.min(100, p))}%` as DimensionValue;
}

const SLOT_GAP_PX = 2;

/** Линейная позиция центра подписи по частоте (px от левого края контента шкалы). */
function linearCenterX(freqKhz: number, rowWidthPx: number): number {
  const { min, max } = FREQUENCY_RANGE;
  return ((freqKhz - min) / Math.max(1e-6, max - min)) * rowWidthPx;
}

/**
 * Подбирает ширину слота и позиции left[], чтобы слоты не пересекались и оставались в поле.
 * Частоты в массиве должны быть отсортированы по возрастанию.
 */
function fitSlottedLabels(
  sortedFreqsKhz: number[],
  rowWidthPx: number,
  preferredSlotWidth: number,
  minSlotWidth: number,
  edgeInset: number,
): { slotWidth: number; lefts: number[] } {
  const n = sortedFreqsKhz.length;
  if (n === 0) {
    return { slotWidth: preferredSlotWidth, lefts: [] };
  }
  if (rowWidthPx <= 0) {
    return { slotWidth: preferredSlotWidth, lefts: sortedFreqsKhz.map(() => 0) };
  }

  const centers = sortedFreqsKhz.map((f) => linearCenterX(f, rowWidthPx));
  const maxRowSlot = rowWidthPx - 2 * edgeInset;
  const pairGaps =
    n < 2
      ? [maxRowSlot]
      : Array.from({ length: n - 1 }, (_, i) => centers[i + 1]! - centers[i]! - SLOT_GAP_PX);
  const minPairGap = Math.min(...pairGaps);
  const safeMinGap = Math.max(0, minPairGap);
  const upperW = Math.max(8, Math.floor(Math.min(preferredSlotWidth, safeMinGap, maxRowSlot)));
  let lowerW = Math.max(8, Math.min(minSlotWidth, Math.floor(safeMinGap)));
  lowerW = Math.min(lowerW, upperW);

  const tryLayout = (w: number): number[] | null => {
    const left = centers.map((c) => c - w / 2);
    for (let i = 1; i < n; i++) {
      left[i] = Math.max(left[i]!, left[i - 1]! + w + SLOT_GAP_PX);
    }
    for (let i = n - 2; i >= 0; i--) {
      left[i] = Math.min(left[i]!, left[i + 1]! - w - SLOT_GAP_PX);
    }
    for (let k = 0; k < 6; k++) {
      let changed = false;
      for (let i = 1; i < n; i++) {
        if (left[i]! < left[i - 1]! + w + SLOT_GAP_PX) {
          left[i] = left[i - 1]! + w + SLOT_GAP_PX;
          changed = true;
        }
      }
      for (let i = n - 2; i >= 0; i--) {
        if (left[i]! > left[i + 1]! - w - SLOT_GAP_PX) {
          left[i] = left[i + 1]! - w - SLOT_GAP_PX;
          changed = true;
        }
      }
      if (!changed) break;
    }
    const ok = left.every(
      (l) => l >= edgeInset - 0.5 && l + w <= rowWidthPx - edgeInset + 0.5,
    );
    return ok ? left : null;
  };

  let bestW = lowerW;
  let bestLeft: number[] | null = null;
  for (let w = upperW; w >= lowerW; w--) {
    const L = tryLayout(w);
    if (L) {
      bestW = w;
      bestLeft = L;
      break;
    }
  }
  if (!bestLeft) {
    const w = Math.max(8, Math.min(upperW, Math.floor(safeMinGap)));
    const L = centers.map((c) => c - w / 2);
    for (let i = 1; i < n; i++) {
      L[i] = Math.max(L[i]!, L[i - 1]! + w + SLOT_GAP_PX);
    }
    for (let i = n - 2; i >= 0; i--) {
      L[i] = Math.min(L[i]!, L[i + 1]! - w - SLOT_GAP_PX);
    }
    for (let i = 0; i < n; i++) {
      L[i] = Math.max(edgeInset, Math.min(rowWidthPx - w - edgeInset, L[i]!));
    }
    return { slotWidth: w, lefts: L };
  }

  return { slotWidth: bestW, lefts: bestLeft };
}

export type DialGeometry = {
  /** Ширина окна градуировки для расчёта X стрелки */
  trackWidth: number;
  /** Отступ снизу слоя стрелки до нижнего края контейнера шкалы (см. ТЗ `docs/tz-information-field.md`) */
  pointerLiftFromBottom: number;
};

type Props = {
  onDialGeometry?: (geometry: DialGeometry) => void;
  /** Станции, отображаемые на шкале (после фильтра блока и года). */
  scaleStations: Station[];
};

/**
 * Информационное поле: три полосы по диапазонам частот (станции + своя строка кГц),
 * окно градуировки, стиль гражданских приёмников 1930-х. Сообщает геометрию для стрелки.
 */
export function FrequencyScale({ onDialGeometry, scaleStations }: Props) {
  const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
  const { height: windowH, width: windowW } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(0);

  const mountRef = useRef({ h: 0 });
  const dialRef = useRef({ y: 0 });
  const dialContentInDialY = useRef(0);
  const swRef = useRef({ y: 0, h: 0, w: 0 });
  const lastSent = useRef<DialGeometry | null>(null);

  const layoutMetrics = useMemo(() => {
    const approxContent = contentWidth > 0 ? contentWidth : Math.max(260, Math.min(windowW - 48, 400));
    const cityW = Math.min(90, Math.max(52, Math.round(approxContent / 6.2)));
    const freqW = Math.min(46, Math.max(30, Math.round(approxContent / 10.5)));
    const dialMin = Math.min(340, Math.max(208, Math.round(windowH * 0.265)));
    const compact = windowH < 700;
    const edgeInset = approxContent < 340 ? EDGE_INSET_NARROW : EDGE_INSET_DEFAULT;
    return { cityW, freqW, dialMin, compact, edgeInset };
  }, [contentWidth, windowH, windowW]);

  const publishDialGeometry = useCallback(() => {
    const mh = mountRef.current.h;
    const dy = dialRef.current.y;
    const sy = swRef.current.y;
    const sh = swRef.current.h;
    const sw = swRef.current.w;
    if (!mh || !sw) return;
    const scaleTopFromMount = dy + dialContentInDialY.current + sy;
    const pointerLiftFromBottom = Math.max(0, mh - (scaleTopFromMount + sh));
    const next: DialGeometry = { trackWidth: sw, pointerLiftFromBottom };
    const prev = lastSent.current;
    if (
      prev &&
      prev.trackWidth === next.trackWidth &&
      Math.abs(prev.pointerLiftFromBottom - next.pointerLiftFromBottom) < 0.5
    ) {
      return;
    }
    lastSent.current = next;
    onDialGeometry?.(next);
  }, [onDialGeometry]);

  const onMountLayout = (e: LayoutChangeEvent) => {
    mountRef.current.h = e.nativeEvent.layout.height;
    publishDialGeometry();
  };

  const onDialCardLayout = (e: LayoutChangeEvent) => {
    dialRef.current.y = e.nativeEvent.layout.y;
    publishDialGeometry();
  };

  const onDialContentLayout = (e: LayoutChangeEvent) => {
    dialContentInDialY.current = e.nativeEvent.layout.y;
    setContentWidth(e.nativeEvent.layout.width);
    publishDialGeometry();
  };

  const onScaleWindowLayout = (e: LayoutChangeEvent) => {
    const { y, height, width } = e.nativeEvent.layout;
    swRef.current = { y, h: height, w: width };
    publishDialGeometry();
  };

  const minors: number[] = [];
  for (let f = FREQUENCY_RANGE.min; f <= FREQUENCY_RANGE.max; f += 10) {
    minors.push(f);
  }

  const sortedStations = useMemo(
    () => [...scaleStations].sort((a, b) => a.frequency - b.frequency),
    [scaleStations],
  );

  const { cityW, freqW, dialMin, compact, edgeInset } = layoutMetrics;

  const bandCityLayouts = useMemo(() => {
    if (contentWidth <= 0) return null;
    return INFORMATION_FIELD_BANDS.map((_, bandIndex) => {
      const list = stationsInInformationBand(bandIndex, scaleStations);
      const freqs = list.map((s) => s.frequency);
      const { slotWidth, lefts } = fitSlottedLabels(freqs, contentWidth, cityW, 34, edgeInset);
      const byId: Record<string, number> = {};
      list.forEach((s, i) => {
        byId[s.id] = lefts[i] ?? 0;
      });
      return { slotWidth, byId };
    });
  }, [contentWidth, cityW, edgeInset, scaleStations]);

  const bandFreqLayouts = useMemo(() => {
    if (contentWidth <= 0) return null;
    return INFORMATION_FIELD_BANDS.map((band) => {
      const labels = [...band.axisLabelsKhz] as number[];
      const { slotWidth, lefts } = fitSlottedLabels(labels, contentWidth, freqW, 22, edgeInset);
      const byFreq: Record<number, number> = {};
      labels.forEach((f, i) => {
        byFreq[f] = lefts[i] ?? 0;
      });
      return { slotWidth, byFreq };
    });
  }, [contentWidth, freqW, edgeInset]);

  const citySlotStyleFallback = (freq: number) =>
    ({
      left: pctAlongInset(freq),
      marginLeft: -cityW / 2,
      width: cityW,
    }) as const;

  const freqLabelStyleFallback = (freq: number) =>
    ({
      left: pctAlongInset(freq),
      marginLeft: -freqW / 2,
      width: freqW,
    }) as const;

  const c = compact;

  return (
    <View style={[styles.mount, c && styles.mountCompact]} onLayout={onMountLayout}>
      <View style={styles.mountRim} />
      <View style={[styles.dialCard, { minHeight: dialMin }]} onLayout={onDialCardLayout}>
        <View style={styles.dialArcShade} />
        <View style={styles.dialContent} onLayout={onDialContentLayout}>
          <Text style={[styles.dialCaption, c && styles.dialCaptionCompact, { fontFamily: serif }]}>
            СРЕДНИЕ ВОЛНЫ · кГц
          </Text>

          {INFORMATION_FIELD_BANDS.map((band, bandIndex) => (
            <View key={band.id} style={[styles.cityRowBand, c && styles.cityRowBandCompact]}>
              {stationsInInformationBand(bandIndex, scaleStations).map((s) => {
                const layout = bandCityLayouts?.[bandIndex];
                const slotPos =
                  contentWidth > 0 && layout
                    ? ({ left: layout.byId[s.id], width: layout.slotWidth, marginLeft: 0 } as const)
                    : citySlotStyleFallback(s.frequency);
                return (
                  <View key={s.id} style={[styles.citySlot, slotPos]}>
                  <Text
                    style={[styles.cityLabel, c && styles.cityLabelCompact, { fontFamily: serif }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.68}
                  >
                    {s.city}
                  </Text>
                  <View style={[styles.hairlineToScale, c && styles.hairlineToScaleCompact]} />
                </View>
                );
              })}
            </View>
          ))}

          <View style={[styles.scaleWindow, c && styles.scaleWindowCompact]} onLayout={onScaleWindowLayout}>
            <View style={styles.scaleWindowInner} />
            <View style={[styles.scaleGraduation, c && styles.scaleGraduationCompact]} />
            {minors.map((f) => {
              const isMajor = f % 100 === 0;
              const isMid = f % 50 === 0 && !isMajor;
              const h = isMajor ? (c ? 16 : 20) : isMid ? (c ? 11 : 13) : c ? 7 : 9;
              const opacity = isMajor ? 0.95 : isMid ? 0.55 : 0.35;
              return (
                <View
                  key={f}
                  style={[
                    styles.tick,
                    { left: pctAlong(f), height: h, opacity, backgroundColor: isMajor ? DIAL_INK : '#4a4036' },
                  ]}
                />
              );
            })}
            {sortedStations.map((s) => (
              <View key={`pin-${s.id}`} style={[styles.stationPin, { left: pctAlong(s.frequency) }]} />
            ))}
          </View>

          <View style={[styles.freqRows, c && styles.freqRowsCompact]}>
            {INFORMATION_FIELD_BANDS.map((band, rowIdx) => (
              <View key={`freq-${band.id}`} style={[styles.freqRow, c && styles.freqRowCompact, rowIdx === 0 && styles.freqRowFirst]}>
                {band.axisLabelsKhz.map((f) => {
                  const layout = bandFreqLayouts?.[rowIdx];
                  const labelPos =
                    contentWidth > 0 && layout
                      ? ({ left: layout.byFreq[f], width: layout.slotWidth, marginLeft: 0 } as const)
                      : freqLabelStyleFallback(f);
                  return (
                    <Text
                      key={`${band.id}-${f}`}
                      style={[styles.freqLabel, c && styles.freqLabelCompact, labelPos, { fontFamily: serif }]}
                    >
                      {f}
                    </Text>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
