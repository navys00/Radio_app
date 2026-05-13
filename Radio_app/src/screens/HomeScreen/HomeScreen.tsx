import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DialGeometry, FrequencyScale } from '@/src/components/FrequencyScale';
import { TubeLamp } from '@/src/components/TubeLamp';
import { TuningKnob } from '@/src/components/TuningKnob';
import { TuningPointer } from '@/src/components/TuningPointer';
import { VintageRadioBody } from '@/src/components/VintageRadioBody';
import { VolumeKnob } from '@/src/components/VolumeKnob';
import { useRadio } from '@/src/context/RadioContext';
import { BROADCAST_BLOC_OPTIONS, FREQUENCY_RANGE, YEARS } from '@/src/data/radioData';
import { styles } from './HomeScreen.module';

const POINTER_W = 28;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const isLandscape = winW > winH;

  const { frequency, volume, year, bloc, visibleStations, setFrequency, setVolume, setYear, setBloc } =
    useRadio();
  const displayFreq = useSharedValue(frequency);
  const displayVol = useSharedValue(volume);
  const [dialGeo, setDialGeometry] = useState<DialGeometry | null>(null);
  const [warmupDone, setWarmupDone] = useState(false);

  const padH = useMemo(() => Math.max(10, insets.left, insets.right, 12), [insets.left, insets.right]);

  const tuneSize = useMemo(
    () => Math.round(Math.min(142, Math.max(92, Math.min(winW, winH) * 0.23))),
    [winW, winH],
  );
  const volSize = useMemo(() => Math.round(tuneSize * 0.84), [tuneSize]);

  const onDialGeometry = useCallback((g: DialGeometry) => {
    setDialGeometry((prev) => {
      if (
        prev &&
        prev.trackWidth === g.trackWidth &&
        Math.abs(prev.pointerLiftFromBottom - g.pointerLiftFromBottom) < 0.5
      ) {
        return prev;
      }
      return g;
    });
  }, []);

  useEffect(() => {
    displayFreq.value = frequency;
  }, [frequency, displayFreq]);

  useEffect(() => {
    displayVol.value = volume;
  }, [volume, displayVol]);

  const onFreqCommit = useCallback(
    (f: number) => {
      void setFrequency(f);
    },
    [setFrequency],
  );

  const onVolCommit = useCallback(
    (v: number) => {
      void setVolume(v);
    },
    [setVolume],
  );

  const yearRow = (
    <View style={[styles.yearRow, { paddingHorizontal: padH }]} accessibilityRole="tablist">
      {YEARS.map((y) => {
        const active = y === year;
        return (
          <Pressable
            key={y}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Год эфира ${y}`}
            onPress={() => void setYear(y)}
            style={({ pressed }) => [
              styles.yearChip,
              active && styles.yearChipActive,
              pressed && styles.yearChipPressed,
            ]}
          >
            <Text style={[styles.yearChipText, active && styles.yearChipTextActive]}>{y}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const blocRow = (
    <View style={[styles.blocRow, { paddingHorizontal: padH }]} accessibilityRole="tablist">
      {BROADCAST_BLOC_OPTIONS.map(({ id, label }) => {
        const active = id === bloc;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Блок эфира: ${label}`}
            onPress={() => void setBloc(id)}
            style={({ pressed }) => [
              styles.yearChip,
              active && styles.yearChipActive,
              pressed && styles.yearChipPressed,
            ]}
          >
            <Text style={[styles.yearChipText, active && styles.yearChipTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const scaleBlock = (
    <View style={styles.scaleWrap}>
      <FrequencyScale scaleStations={visibleStations} onDialGeometry={onDialGeometry} />
      {dialGeo && dialGeo.trackWidth > 0 ? (
        <View
          style={[styles.pointerOverlay, { paddingBottom: dialGeo.pointerLiftFromBottom }]}
          pointerEvents="none"
        >
          <TuningPointer
            displayFrequency={displayFreq}
            trackWidth={dialGeo.trackWidth}
            minF={FREQUENCY_RANGE.min}
            maxF={FREQUENCY_RANGE.max}
            pointerWidth={POINTER_W}
          />
        </View>
      ) : null}
    </View>
  );

  const knobs = (
    <View style={[styles.knobRow, isLandscape && styles.knobRowLandscape, { paddingHorizontal: padH }]}>
      <TuningKnob
        displayFrequency={displayFreq}
        lockedFrequency={frequency}
        size={tuneSize}
        onCommit={onFreqCommit}
      />
      <View style={[styles.knobGap, isLandscape && styles.knobGapLandscape]} />
      <VolumeKnob displayVolume={displayVol} lockedVolume={volume} size={volSize} onCommit={onVolCommit} />
    </View>
  );

  const portraitBody = (
    <>
      <View style={[styles.topRow, { paddingHorizontal: padH }]}>
        <View style={styles.topSpacer} />
        <TubeLamp warmupComplete={warmupDone} />
      </View>
      {blocRow}
      {yearRow}
      {scaleBlock}
      {knobs}
    </>
  );

  const landscapeBody = (
    <View style={styles.landscapeRow}>
      <View style={[styles.landscapeMain, { paddingLeft: padH }]}>
        {blocRow}
        {yearRow}
        {scaleBlock}
      </View>
      <View style={[styles.landscapeSide, { paddingRight: padH }]}>
        <TubeLamp warmupComplete={warmupDone} />
        {knobs}
      </View>
    </View>
  );

  return (
    <VintageRadioBody warmupComplete={warmupDone} onWarmupComplete={() => setWarmupDone(true)}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 4,
            paddingBottom: insets.bottom + 16,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.root}>{isLandscape ? landscapeBody : portraitBody}</View>
      </ScrollView>
    </VintageRadioBody>
  );
}
