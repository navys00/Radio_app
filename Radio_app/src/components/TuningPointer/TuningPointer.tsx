import { View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { styles } from './TuningPointer.module';

type Props = {
  displayFrequency: SharedValue<number>;
  trackWidth: number;
  minF: number;
  maxF: number;
  pointerWidth: number;
};

export function TuningPointer({ displayFrequency, trackWidth, minF, maxF, pointerWidth }: Props) {
  const range = Math.max(1e-6, maxF - minF);
  const usable = Math.max(0, trackWidth - pointerWidth);

  const style = useAnimatedStyle(() => {
    const f = displayFrequency.value;
    const t = (f - minF) / range;
    const x = t * usable;
    return {
      transform: [{ translateX: x }],
    };
  });

  const h = pointerWidth * 1.35;
  const aw = Math.max(5, pointerWidth * 0.26);

  return (
    <Animated.View
      style={[
        styles.pointer,
        {
          width: pointerWidth,
          height: h,
          marginLeft: -pointerWidth * 0.15,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.arrow,
          {
            borderLeftWidth: aw,
            borderRightWidth: aw,
            borderBottomWidth: pointerWidth * 0.52,
          },
        ]}
      />
      <View style={[styles.stem, { width: Math.max(3, pointerWidth * 0.22), height: h * 0.55 }]} />
    </Animated.View>
  );
}
