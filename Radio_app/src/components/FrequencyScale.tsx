import { useCallback, useMemo, useRef, useState } from 'react';
import type { DimensionValue } from 'react-native';
import { LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import {
  FREQUENCY_RANGE,
  INFORMATION_FIELD_BANDS,
  stations,
  stationsInInformationBand,
} from '@/src/data/radioData';

/** Ширина слота города (px): подпись + отступы, не выходит за край при clamp. */
const CITY_SLOT_WIDTH = 88;
/** Ширина блока цифры кГц (px). */
const FREQ_LABEL_WIDTH = 46;
/** Минимальный отступ слота от края контента (px). */
const EDGE_INSET_PX = 4;

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

function clampedCenterX(freqKhz: number, rowWidthPx: number): number {
  const { min, max } = FREQUENCY_RANGE;
  const t = (freqKhz - min) / Math.max(1e-6, max - min);
  return t * rowWidthPx;
}

/** Левая координата (px) для блока фиксированной ширины, центр на частоте, без выхода за края. */
function slotLeftPx(freqKhz: number, rowWidthPx: number, slotWidthPx: number): number {
  if (rowWidthPx <= slotWidthPx) return 0;
  const half = slotWidthPx / 2;
  let center = clampedCenterX(freqKhz, rowWidthPx);
  center = Math.max(half + EDGE_INSET_PX, Math.min(rowWidthPx - half - EDGE_INSET_PX, center));
  return center - half;
}

const DIAL_INK = '#2a2218';
const DIAL_FACE = '#e8dcc8';
const DIAL_FACE_DEEP = '#dccfbb';
const BRASS = '#9a7a48';
const BRASS_LIGHT = '#c4a86a';
const FRAME_OUTER = '#14100c';
const FRAME_INNER = '#3a2e24';

export type DialGeometry = {
  /** Ширина окна градуировки для расчёта X стрелки */
  trackWidth: number;
  /** Отступ снизу слоя стрелки до нижнего края контейнера шкалы (см. ТЗ `docs/tz-information-field.md`) */
  pointerLiftFromBottom: number;
};

type Props = {
  onDialGeometry?: (geometry: DialGeometry) => void;
};

/**
 * Информационное поле: три полосы по диапазонам частот (станции + своя строка кГц),
 * окно градуировки, стиль гражданских приёмников 1930-х. Сообщает геометрию для стрелки.
 */
export function FrequencyScale({ onDialGeometry }: Props) {
  const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
  const [contentWidth, setContentWidth] = useState(0);

  const mountRef = useRef({ h: 0 });
  const dialRef = useRef({ y: 0 });
  const dialContentInDialY = useRef(0);
  const swRef = useRef({ y: 0, h: 0, w: 0 });
  const lastSent = useRef<DialGeometry | null>(null);

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
    () => [...stations].sort((a, b) => a.frequency - b.frequency),
    [],
  );

  const citySlotStyle = (freq: number) => {
    if (contentWidth > 0) {
      return {
        left: slotLeftPx(freq, contentWidth, CITY_SLOT_WIDTH),
        marginLeft: 0,
        width: CITY_SLOT_WIDTH,
      } as const;
    }
    return {
      left: pctAlongInset(freq),
      marginLeft: -CITY_SLOT_WIDTH / 2,
      width: CITY_SLOT_WIDTH,
    } as const;
  };

  const freqLabelStyle = (freq: number) => {
    if (contentWidth > 0) {
      return {
        left: slotLeftPx(freq, contentWidth, FREQ_LABEL_WIDTH),
        marginLeft: 0,
        width: FREQ_LABEL_WIDTH,
      } as const;
    }
    return {
      left: pctAlongInset(freq),
      marginLeft: -FREQ_LABEL_WIDTH / 2,
      width: FREQ_LABEL_WIDTH,
    } as const;
  };

  return (
    <View style={styles.mount} onLayout={onMountLayout}>
      <View style={styles.mountRim} />
      <View style={styles.dialCard} onLayout={onDialCardLayout}>
        <View style={styles.dialArcShade} />
        <View style={styles.dialContent} onLayout={onDialContentLayout}>
          <Text style={[styles.dialCaption, { fontFamily: serif }]}>СРЕДНИЕ ВОЛНЫ · кГц</Text>

          {INFORMATION_FIELD_BANDS.map((band, bandIndex) => (
            <View key={band.id} style={styles.cityRowBand}>
              {stationsInInformationBand(bandIndex).map((s) => (
                <View key={s.id} style={[styles.citySlot, citySlotStyle(s.frequency)]}>
                  <Text
                    style={[styles.cityLabel, { fontFamily: serif }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    {s.city}
                  </Text>
                  <View style={styles.hairlineToScale} />
                </View>
              ))}
            </View>
          ))}

          <View style={styles.scaleWindow} onLayout={onScaleWindowLayout}>
            <View style={styles.scaleWindowInner} />
            <View style={styles.scaleGraduation} />
            {minors.map((f) => {
              const isMajor = f % 100 === 0;
              const isMid = f % 50 === 0 && !isMajor;
              const h = isMajor ? 20 : isMid ? 13 : 9;
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

          <View style={styles.freqRows}>
            {INFORMATION_FIELD_BANDS.map((band, rowIdx) => (
              <View key={`freq-${band.id}`} style={[styles.freqRow, rowIdx === 0 && styles.freqRowFirst]}>
                {band.axisLabelsKhz.map((f) => (
                  <Text
                    key={`${band.id}-${f}`}
                    style={[styles.freqLabel, freqLabelStyle(f), { fontFamily: serif }]}
                  >
                    {f}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mount: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: FRAME_OUTER,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0a0806',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 6,
  },
  mountRim: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRASS_LIGHT,
    opacity: 0.35,
  },
  dialCard: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: FRAME_INNER,
    backgroundColor: DIAL_FACE,
    overflow: 'hidden',
    minHeight: 286,
    paddingBottom: 8,
  },
  dialContent: {
    paddingHorizontal: 10,
    paddingTop: 2,
    overflow: 'hidden',
  },
  dialArcShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 48,
    backgroundColor: DIAL_FACE_DEEP,
    opacity: 0.55,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,48,36,0.2)',
  },
  dialCaption: {
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 2.4,
    fontWeight: '600',
    color: DIAL_INK,
    opacity: 0.88,
  },
  cityRowBand: {
    position: 'relative',
    width: '100%',
    minHeight: 40,
    marginTop: 4,
  },
  citySlot: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  cityLabel: {
    width: '100%',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    color: DIAL_INK,
    letterSpacing: 0.2,
  },
  hairlineToScale: {
    marginTop: 3,
    width: 1,
    height: 11,
    backgroundColor: 'rgba(42,34,24,0.38)',
  },
  scaleWindow: {
    marginHorizontal: '1.5%',
    marginTop: 8,
    height: 56,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BRASS,
    backgroundColor: '#d4c4ae',
    position: 'relative',
    overflow: 'hidden',
  },
  scaleWindowInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 235, 200, 0.35)',
  },
  scaleGraduation: {
    position: 'absolute',
    left: '1%',
    right: '1%',
    top: 12,
    height: 26,
    borderTopWidth: 1,
    borderTopColor: 'rgba(42,34,24,0.15)',
  },
  tick: {
    position: 'absolute',
    bottom: 8,
    width: 1,
    marginLeft: -0.5,
  },
  stationPin: {
    position: 'absolute',
    bottom: 6,
    width: 3,
    height: 14,
    marginLeft: -1.5,
    backgroundColor: '#8b2a1a',
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: '#5a1808',
  },
  freqRows: {
    marginTop: 10,
    paddingHorizontal: 0,
  },
  freqRow: {
    position: 'relative',
    width: '100%',
    height: 22,
    marginTop: 4,
  },
  freqRowFirst: {
    marginTop: 0,
  },
  freqLabel: {
    position: 'absolute',
    top: 0,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: DIAL_INK,
    fontVariant: ['tabular-nums'],
  },
});
