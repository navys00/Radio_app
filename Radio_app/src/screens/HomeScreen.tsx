import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { FrequencyScale } from '@/src/components/FrequencyScale';
import { TubeLamp } from '@/src/components/TubeLamp';
import { TuningKnob } from '@/src/components/TuningKnob';
import { TuningPointer } from '@/src/components/TuningPointer';
import { VintageRadioBody } from '@/src/components/VintageRadioBody';
import { useRadio } from '@/src/context/RadioContext';
import { FREQUENCY_RANGE } from '@/src/data/radioData';

const POINTER_W = 28;
const KNOB_SIZE = 132;

export function HomeScreen() {
  const { frequency, setFrequency } = useRadio();
  const displayFreq = useSharedValue(frequency);
  const [trackW, setTrackW] = useState(0);
  const [warmupDone, setWarmupDone] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    displayFreq.value = frequency;
  }, [frequency, displayFreq]);

  const onCommit = useCallback(
    (f: number) => {
      void setFrequency(f);
    },
    [setFrequency],
  );

  const dismissHint = useCallback(() => setHintVisible(false), []);

  return (
    <VintageRadioBody warmupComplete={warmupDone} onWarmupComplete={() => setWarmupDone(true)}>
      <View style={styles.root}>
        <View style={styles.topRow}>
          <View style={styles.topSpacer} />
          <TubeLamp warmupComplete={warmupDone} />
        </View>

        <View
          style={styles.scaleWrap}
          onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
        >
          <FrequencyScale />
          {trackW > 0 ? (
            <View style={styles.pointerOverlay} pointerEvents="none">
              <TuningPointer
                displayFrequency={displayFreq}
                trackWidth={trackW}
                minF={FREQUENCY_RANGE.min}
                maxF={FREQUENCY_RANGE.max}
                pointerWidth={POINTER_W}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.knobRow}>
          <TuningKnob
            displayFrequency={displayFreq}
            lockedFrequency={frequency}
            size={KNOB_SIZE}
            onCommit={onCommit}
            onInteractionStart={dismissHint}
          />
        </View>

        {hintVisible ? (
          <View style={styles.hint} pointerEvents="none">
            <Text style={styles.hintText}>Вращайте ручку настройки</Text>
          </View>
        ) : null}
      </View>
    </VintageRadioBody>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  topSpacer: { flex: 1 },
  scaleWrap: {
    position: 'relative',
    marginTop: 20,
    paddingHorizontal: 14,
    minHeight: 100,
  },
  pointerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  knobRow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 36,
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255, 220, 180, 0.92)',
    fontSize: 15,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
