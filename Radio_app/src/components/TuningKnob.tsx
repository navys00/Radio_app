import { useCallback, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import {
  allFrequencies,
  FREQUENCY_RANGE,
  snapToNearestFrequency,
} from '@/src/data/radioData';

/** Высота жеста (px), соответствующая полному диапазону частот */
const DRAG_PX_FOR_FULL_RANGE = 240;
const TURNS_VISUAL = 2.25;

type Props = {
  displayFrequency: SharedValue<number>;
  lockedFrequency: number;
  size: number;
  onCommit: (f: number) => void;
  onInteractionStart?: () => void;
};

export function TuningKnob({ displayFrequency, lockedFrequency, size, onCommit, onInteractionStart }: Props) {
  const startFreqOnPan = useSharedValue(0);
  const span = FREQUENCY_RANGE.max - FREQUENCY_RANGE.min;
  const r = size / 2;

  const applySnapFromWorklet = useCallback(
    (rawFreq: number) => {
      const snapped = snapToNearestFrequency(rawFreq, allFrequencies);
      displayFrequency.value = snapped;
      onCommit(snapped);
    },
    [displayFrequency, onCommit],
  );

  useEffect(() => {
    displayFrequency.value = lockedFrequency;
  }, [lockedFrequency, displayFrequency]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      if (onInteractionStart) {
        runOnJS(onInteractionStart)();
      }
      startFreqOnPan.value = displayFrequency.value;
    })
    .onUpdate((e) => {
      const deltaFreq = (-e.translationY / DRAG_PX_FOR_FULL_RANGE) * span;
      let f = startFreqOnPan.value + deltaFreq;
      f = Math.max(FREQUENCY_RANGE.min, Math.min(FREQUENCY_RANGE.max, f));
      displayFrequency.value = f;
    })
    .onEnd(() => {
      runOnJS(applySnapFromWorklet)(displayFrequency.value);
    });

  const knobSpin = useAnimatedStyle(() => {
    const f = displayFrequency.value;
    const t = (f - FREQUENCY_RANGE.min) / Math.max(1e-6, span);
    const deg = t * TURNS_VISUAL * 360;
    return {
      transform: [{ rotate: `${deg}deg` }],
    };
  });

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 5,
    },
    default: { elevation: 8 },
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.hit, { width: size, height: size }]}>
        <Animated.View style={[styles.knobOuter, { width: size, height: size, borderRadius: r }, shadowStyle, knobSpin]}>
          <View style={[styles.knobRim, { width: size - 6, height: size - 6, borderRadius: r - 3 }]} />
          <View style={[styles.knobFace, { width: size - 18, height: size - 18, borderRadius: r - 9 }]} />
          <View style={styles.marker} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#9a7a3a',
    backgroundColor: '#2a1a0e',
  },
  knobRim: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 95, 0.55)',
    backgroundColor: 'transparent',
  },
  knobFace: {
    position: 'absolute',
    backgroundColor: '#3d2818',
    borderWidth: 1,
    borderColor: 'rgba(60, 40, 25, 0.9)',
  },
  marker: {
    position: 'absolute',
    top: 10,
    width: 4,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#e8c56a',
    borderWidth: 1,
    borderColor: 'rgba(90, 60, 30, 0.8)',
  },
});
