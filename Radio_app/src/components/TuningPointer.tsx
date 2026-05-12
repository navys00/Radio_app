import { StyleSheet, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

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

const styles = StyleSheet.create({
  pointer: {
    position: 'absolute',
    left: 0,
    bottom: 4,
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderBottomColor: '#e63b2a',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: '#ff4a3a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  stem: {
    marginTop: -1,
    backgroundColor: '#c42e22',
    borderRadius: 2,
    shadowColor: '#ff2a1a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 4,
  },
});
