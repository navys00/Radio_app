import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { DialGeometry, FrequencyScale } from '@/src/components/FrequencyScale';
import { TubeLamp } from '@/src/components/TubeLamp';
import { TuningKnob } from '@/src/components/TuningKnob';
import { TuningPointer } from '@/src/components/TuningPointer';
import { VintageRadioBody } from '@/src/components/VintageRadioBody';
import { VolumeKnob } from '@/src/components/VolumeKnob';
import { useRadio } from '@/src/context/RadioContext';
import { FREQUENCY_RANGE } from '@/src/data/radioData';

const POINTER_W = 28;
const TUNE_KNOB = 128;
const VOL_KNOB = 108;

export function HomeScreen() {
  const { frequency, volume, setFrequency, setVolume } = useRadio();
  const displayFreq = useSharedValue(frequency);
  const displayVol = useSharedValue(volume);
  const [dialGeo, setDialGeometry] = useState<DialGeometry | null>(null);
  const [warmupDone, setWarmupDone] = useState(false);

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

  return (
    <VintageRadioBody warmupComplete={warmupDone} onWarmupComplete={() => setWarmupDone(true)}>
      <View style={styles.root}>
        <View style={styles.topRow}>
          <View style={styles.topSpacer} />
          <TubeLamp warmupComplete={warmupDone} />
        </View>

        <View style={styles.scaleWrap}>
          <FrequencyScale onDialGeometry={onDialGeometry} />
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

        <View style={styles.knobRow}>
          <TuningKnob
            displayFrequency={displayFreq}
            lockedFrequency={frequency}
            size={TUNE_KNOB}
            onCommit={onFreqCommit}
          />
          <View style={styles.knobGap} />
          <VolumeKnob
            displayVolume={displayVol}
            lockedVolume={volume}
            size={VOL_KNOB}
            onCommit={onVolCommit}
          />
        </View>
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
    paddingHorizontal: 12,
    minHeight: 300,
  },
  pointerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  knobRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 12,
  },
  knobGap: { width: 28 },
});
