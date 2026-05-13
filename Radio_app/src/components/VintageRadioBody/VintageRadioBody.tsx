import { ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { styles } from './VintageRadioBody.module';

type Props = {
  children: ReactNode;
  warmupComplete: boolean;
  onWarmupComplete: () => void;
};

export function VintageRadioBody({ children, warmupComplete, onWarmupComplete }: Props) {
  const dim = useSharedValue(warmupComplete ? 0 : 1);

  useEffect(() => {
    if (warmupComplete) {
      dim.value = 0;
      return;
    }
    dim.value = 1;
    dim.value = withTiming(0, { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [warmupComplete, dim]);

  useEffect(() => {
    if (warmupComplete) return;
    const t = setTimeout(() => onWarmupComplete(), 1650);
    return () => clearTimeout(t);
  }, [warmupComplete, onWarmupComplete]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: dim.value * 0.88,
  }));

  return (
    <View style={styles.bg}>
      <View style={styles.bgDots} pointerEvents="none" />
      <View style={styles.stage}>
        <View style={styles.radioBody}>
          <View style={styles.radioBodyInner} pointerEvents="none" />
          <View style={styles.content}>{children}</View>
        </View>
      </View>
      <Animated.View style={[styles.warmupOverlay, overlayStyle]} pointerEvents="none" />
    </View>
  );
}
