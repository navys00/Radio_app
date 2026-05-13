import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type XY = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function angleFromPoint(p: XY, center: XY) {
  const angle = Math.atan2(p.y - center.y, p.x - center.x) * (180 / Math.PI);
  return angle;
}

function normalizedKnob(angleDeg: number) {
  return clamp(angleDeg + 90, -140, 140);
}

function percentFromNormalized(normalized: number) {
  return ((normalized + 140) / 280) * 100;
}

function useKnobPan(
  getCenter: () => XY | null,
  onRotation: (normalizedDeg: number) => void,
) {
  return useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          const center = getCenter();
          if (!center) return;
          const pt = { x: g.moveX, y: g.moveY };
          const normalized = normalizedKnob(angleFromPoint(pt, center));
          onRotation(normalized);
        },
      }),
    [getCenter, onRotation],
  );
}

export default function App() {
  const [waveRotation, setWaveRotation] = useState(-40);
  const [volumeRotation, setVolumeRotation] = useState(30);
  const [frequencyPosition, setFrequencyPosition] = useState(50);

  const [selectedBlock, setSelectedBlock] = useState<'СССР' | 'ОСЬ' | 'Союзники'>('СССР');
  const [selectedYear, setSelectedYear] = useState<'1941' | '1942' | '1943' | '1944' | '1945'>('1943');

  const militaryBlocks = useMemo(() => ['СССР', 'ОСЬ', 'Союзники'] as const, []);
  const years = useMemo(() => ['1941', '1942', '1943', '1944', '1945'] as const, []);

  const stations = useMemo(
    () => [
      { city: 'Москва', freq: '612 кГц' },
      { city: 'Ленинград', freq: '720 кГц' },
      { city: 'Берлин', freq: '810 кГц' },
      { city: 'Лондон', freq: '940 кГц' },
      { city: 'Вашингтон', freq: '1050 кГц' },
    ],
    [],
  );

  const waveCenter = useRef<XY | null>(null);
  const volCenter = useRef<XY | null>(null);

  const onWaveLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    // layout is relative to parent; PanResponder uses screen coords (moveX/moveY),
    // so we approximate center using page coords via measure. We'll refine using measure below.
    // Keep fallback local center to avoid nulls before measure.
    waveCenter.current = { x: x + width / 2, y: y + height / 2 };
  };

  const onVolLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    volCenter.current = { x: x + width / 2, y: y + height / 2 };
  };

  const waveMeasureRef = useRef<View | null>(null);
  const volMeasureRef = useRef<View | null>(null);

  const refreshWaveCenter = () => {
    waveMeasureRef.current?.measureInWindow?.((x, y, w, h) => {
      waveCenter.current = { x: x + w / 2, y: y + h / 2 };
    });
  };

  const refreshVolCenter = () => {
    volMeasureRef.current?.measureInWindow?.((x, y, w, h) => {
      volCenter.current = { x: x + w / 2, y: y + h / 2 };
    });
  };

  const wavePan = useKnobPan(
    () => waveCenter.current,
    (normalized) => {
      setWaveRotation(normalized);
      setFrequencyPosition(percentFromNormalized(normalized));
    },
  );

  const volPan = useKnobPan(() => volCenter.current, (normalized) => setVolumeRotation(normalized));

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.stage}>
        <View style={styles.radioBody}>
          <View style={styles.radioBodyDots} pointerEvents="none" />

          {/* TITLE */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Историческое Радио</Text>
            <Text style={styles.subtitle}>1941–1945</Text>
            <Text style={styles.microHint}>{`Год: ${selectedYear}`}</Text>
          </View>

          {/* SCALE */}
          <View style={styles.radioScale}>
            <View style={styles.bandRow}>
              <Text style={styles.bandLabel}>LW</Text>
              <Text style={styles.bandLabel}>MW</Text>
              <Text style={styles.bandLabel}>SW</Text>
            </View>

            <View style={styles.scaleTrack}>
              <View style={styles.ticksRow} pointerEvents="none">
                {Array.from({ length: 32 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tick,
                      i % 4 === 0 ? styles.tickMajor : styles.tickMinor,
                    ]}
                  />
                ))}
              </View>

              <View style={[styles.radioSlider, { left: `${frequencyPosition}%` }]} />

              <View style={styles.scaleNumbers}>
                {['150', '300', '600', '1000', '1400'].map((n) => (
                  <Text key={n} style={styles.scaleNumber}>
                    {n}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* BLOCKS */}
          <View style={styles.metalPanel}>
            <View style={styles.blocksRow}>
              {militaryBlocks.map((block) => {
                const active = selectedBlock === block;
                const activeStyle =
                  block === 'СССР'
                    ? styles.activeUssr
                    : block === 'ОСЬ'
                      ? styles.activeAxis
                      : styles.activeAllies;
                const activeTextStyle =
                  block === 'СССР'
                    ? styles.activeUssrText
                    : block === 'ОСЬ'
                      ? styles.activeAxisText
                      : styles.activeAlliesText;

                return (
                  <Pressable
                    key={block}
                    onPress={() => setSelectedBlock(block)}
                    style={({ pressed }) => [
                      styles.blockButton,
                      active && activeStyle,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.blockButtonText, active && activeTextStyle]}>{block}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* YEARS */}
          <View style={[styles.metalPanel, styles.yearsPanel]}>
            <View style={styles.yearsRow}>
              {years.map((y) => {
                const active = selectedYear === y;
                return (
                  <Pressable
                    key={y}
                    onPress={() => setSelectedYear(y)}
                    style={({ pressed }) => [
                      styles.yearButton,
                      active && styles.yearButtonActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.yearText, active && styles.yearTextActive]}>{y}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* STATIONS */}
          <View style={styles.stationList}>
            {stations.map((s) => (
              <View key={s.city} style={styles.stationCard}>
                <View style={styles.stationLeft}>
                  <Text style={styles.stationCity}>{s.city}</Text>
                  <Text style={styles.stationBlock}>{selectedBlock}</Text>
                </View>
                <Text style={styles.stationFreq}>{s.freq}</Text>
              </View>
            ))}
          </View>

          {/* KNOBS */}
          <View style={styles.knobsRow}>
            {/* WAVE */}
            <View style={styles.knobCol}>
              <View
                ref={(node) => {
                  waveMeasureRef.current = node;
                }}
                onLayout={(e) => {
                  onWaveLayout(e);
                  refreshWaveCenter();
                }}
                {...wavePan.panHandlers}
                style={styles.radioKnob}
              >
                <View
                  style={[
                    styles.knobIndicator,
                    { transform: [{ translateX: -2 }, { rotate: `${waveRotation}deg` }] },
                  ]}
                />
              </View>
              <Text style={styles.knobCaption}>Волна</Text>
            </View>

            {/* VOLUME */}
            <View style={styles.knobCol}>
              <View
                ref={(node) => {
                  volMeasureRef.current = node;
                }}
                onLayout={(e) => {
                  onVolLayout(e);
                  refreshVolCenter();
                }}
                {...volPan.panHandlers}
                style={styles.radioKnob}
              >
                <View
                  style={[
                    styles.knobIndicator,
                    { transform: [{ translateX: -2 }, { rotate: `${volumeRotation}deg` }] },
                  ]}
                />
              </View>
              <Text style={styles.knobCaption}>Громкость</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#15120f',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  radioBody: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 32,
    padding: 18,
    borderWidth: 2,
    borderColor: '#7f6243',
    backgroundColor: '#241b15',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 14,
    overflow: 'hidden',
  },
  radioBodyDots: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#d8c3a5',
    fontSize: 26,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  subtitle: {
    color: '#b89b78',
    fontSize: 16,
    marginTop: 6,
    letterSpacing: 4.2,
  },
  microHint: {
    marginTop: 8,
    color: 'rgba(184,155,120,0.75)',
    fontSize: 12,
  },
  radioScale: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#120f0d',
    borderWidth: 1,
    borderColor: '#8d6b47',
  },
  bandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bandLabel: {
    color: '#d5b78d',
    fontSize: 12,
    letterSpacing: 1,
  },
  scaleTrack: {
    position: 'relative',
    height: 80,
    justifyContent: 'flex-end',
  },
  ticksRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tick: {
    borderRadius: 999,
  },
  tickMajor: {
    height: 40,
    width: 2,
    backgroundColor: '#e6d1b2',
  },
  tickMinor: {
    height: 18,
    width: 1,
    backgroundColor: '#b89b78',
  },
  radioSlider: {
    position: 'absolute',
    top: 0,
    bottom: 18,
    width: 3,
    borderRadius: 999,
    backgroundColor: '#ff9830',
  },
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  scaleNumber: {
    color: '#d8c3a5',
    fontSize: 12,
  },
  metalPanel: {
    borderRadius: 18,
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#1e1712',
    borderWidth: 1,
    borderColor: '#856543',
  },
  blocksRow: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 14,
  },
  blockButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  blockButtonText: {
    color: '#b89b78',
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  activeUssr: { backgroundColor: '#3b0b08' },
  activeAxis: { backgroundColor: '#1f1f1f' },
  activeAllies: { backgroundColor: '#0d2238' },
  activeUssrText: { color: '#ffd9a0' },
  activeAxisText: { color: '#f3e4c5' },
  activeAlliesText: { color: '#d8e7ff' },
  yearsPanel: {
    padding: 10,
  },
  yearsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  yearButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1e1712',
    borderWidth: 1,
    borderColor: 'rgba(141,107,71,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButtonActive: {
    backgroundColor: '#c79852',
    borderColor: 'rgba(0,0,0,0.25)',
  },
  yearText: {
    color: '#b89b78',
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  yearTextActive: {
    color: '#1d140e',
  },
  stationList: {
    gap: 10,
    marginBottom: 16,
  },
  stationCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18,14,11,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(141,107,71,0.35)',
  },
  stationLeft: {
    minWidth: 0,
    flexShrink: 1,
  },
  stationCity: {
    color: '#f2dfc2',
    fontSize: 18,
    fontFamily: 'Georgia',
  },
  stationBlock: {
    color: '#8e775b',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  stationFreq: {
    color: '#d8c3a5',
    fontSize: 14,
    marginLeft: 10,
  },
  knobsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  knobCol: {
    alignItems: 'center',
    gap: 10,
  },
  radioKnob: {
    width: 112,
    height: 112,
    borderRadius: 999,
    backgroundColor: '#3d2f23',
    borderWidth: 4,
    borderColor: '#8b6b48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobIndicator: {
    position: 'absolute',
    top: 18,
    left: '50%',
    width: 4,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#ff9c3a',
    transformOrigin: 'bottom',
  },
  knobCaption: {
    color: '#d8c3a5',
    fontSize: 12,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.86,
  },
});
