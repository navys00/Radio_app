import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { styles } from './TubeLamp.module';

type Props = {
  /** После прогрева — обычная пульсация */
  warmupComplete: boolean;
};

export function TubeLamp({ warmupComplete }: Props) {
  const pulse = useSharedValue(0.85);

  useEffect(() => {
    if (!warmupComplete) {
      pulse.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pulse is a stable SharedValue ref
  }, [warmupComplete]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const bulbGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.45,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.glowOuter, glowStyle]} />
      <Animated.View style={[styles.bulbGlow, bulbGlowStyle]} />
      <View style={styles.base}>
        <View style={styles.baseMetal} />
      </View>
      <View style={styles.glass}>
        <View style={styles.filament} />
        <View style={styles.filamentCore} />
      </View>
    </View>
  );
}
