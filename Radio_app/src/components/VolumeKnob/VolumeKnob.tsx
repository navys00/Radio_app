import { useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { styles } from './VolumeKnob.module';

const DRAG_PX_FOR_FULL_RANGE = 220;

type Props = {
  displayVolume: SharedValue<number>;
  lockedVolume: number;
  size: number;
  onCommit: (volume0to100: number) => void;
  onInteractionStart?: () => void;
};

export function VolumeKnob({ displayVolume, lockedVolume, size, onCommit, onInteractionStart }: Props) {
  const startVol = useSharedValue(0);
  const r = size / 2;

  const applyFromWorklet = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(v)));
      displayVolume.value = clamped;
      onCommit(clamped);
    },
    [displayVolume, onCommit],
  );

  useEffect(() => {
    displayVolume.value = lockedVolume;
  }, [lockedVolume, displayVolume]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      if (onInteractionStart) {
        runOnJS(onInteractionStart)();
      }
      startVol.value = displayVolume.value;
    })
    .onUpdate((e) => {
      const delta = (-e.translationY / DRAG_PX_FOR_FULL_RANGE) * 100;
      let v = startVol.value + delta;
      v = Math.max(0, Math.min(100, v));
      displayVolume.value = v;
    })
    .onEnd(() => {
      runOnJS(applyFromWorklet)(displayVolume.value);
    });

  const knobSpin = useAnimatedStyle(() => {
    const t = displayVolume.value / 100;
    const deg = t * 270 - 135;
    return {
      transform: [{ rotate: `${deg}deg` }],
    };
  });

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
    },
    default: { elevation: 6 },
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.hit, { width: size, height: size }]}
        accessibilityRole="adjustable"
        accessibilityLabel="Громкость"
      >
        <Animated.View style={[styles.knobOuter, { width: size, height: size, borderRadius: r }, shadowStyle, knobSpin]}>
          <View style={[styles.knobRim, { width: size - 6, height: size - 6, borderRadius: r - 3 }]} />
          <View style={[styles.knobFace, { width: size - 18, height: size - 18, borderRadius: r - 9 }]} />
          <View style={styles.marker} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
