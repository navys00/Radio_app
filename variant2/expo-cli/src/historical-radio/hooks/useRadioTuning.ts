import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, type LayoutChangeEvent } from 'react-native';
import { DEFAULT_VOLUME_ROTATION, DEFAULT_WAVE_ROTATION } from '../constants';
import { tuningPercentFromWaveRotation } from '../tuning';

export function useRadioTuning() {
  const [waveRotation, setWaveRotation] = useState(DEFAULT_WAVE_ROTATION);
  const [volumeRotation, setVolumeRotation] = useState(DEFAULT_VOLUME_ROTATION);
  const [frequencyPosition, setFrequencyPosition] = useState(() =>
    tuningPercentFromWaveRotation(DEFAULT_WAVE_ROTATION)
  );
  const [scaleWidth, setScaleWidth] = useState(0);
  const animatedFrequency = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.timing(animatedFrequency, {
      toValue: frequencyPosition,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animatedFrequency, frequencyPosition]);

  const sliderTranslateX = animatedFrequency.interpolate({
    inputRange: [0, 100],
    outputRange: [0, Math.max(scaleWidth - 3, 0)],
  });

  const onScaleLayout = useCallback((event: LayoutChangeEvent) => {
    setScaleWidth(event.nativeEvent.layout.width);
  }, []);

  const onWaveRotate = useCallback((deg: number) => {
    setWaveRotation(deg);
    setFrequencyPosition(tuningPercentFromWaveRotation(deg));
  }, []);

  return {
    waveRotation,
    volumeRotation,
    setVolumeRotation,
    frequencyPosition,
    scaleWidth,
    sliderTranslateX,
    onScaleLayout,
    onWaveRotate,
  };
}
