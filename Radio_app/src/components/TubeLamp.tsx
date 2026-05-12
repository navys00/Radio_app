import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  /** После прогрева — обычная пульсация */
  warmupComplete: boolean;
};

const BULB = 44;

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

const styles = StyleSheet.create({
  wrap: {
    width: BULB + 28,
    height: BULB + 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  glowOuter: {
    position: 'absolute',
    top: 4,
    width: BULB + 32,
    height: BULB + 32,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 140, 60, 0.35)',
  },
  bulbGlow: {
    position: 'absolute',
    top: 14,
    width: BULB - 4,
    height: BULB - 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 190, 100, 0.55)',
  },
  glass: {
    width: BULB,
    height: BULB,
    borderRadius: BULB / 2,
    backgroundColor: 'rgba(40, 28, 20, 0.35)',
    borderWidth: 2,
    borderColor: 'rgba(180, 170, 160, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  filament: {
    position: 'absolute',
    width: 22,
    height: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 160, 80, 0.75)',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 120, 40, 0.15)',
  },
  filamentCore: {
    width: 6,
    height: 20,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 200, 120, 0.95)',
    shadowColor: '#ff8c00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  base: {
    marginTop: -6,
    width: 36,
    height: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  baseMetal: {
    width: 36,
    height: 12,
    backgroundColor: 'rgba(120, 100, 75, 0.85)',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(60, 50, 40, 0.9)',
  },
});
