import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, PanResponder, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLayoutMetrics } from '../context/ResponsiveLayoutContext';
import { KNOB_ROT_MAX, KNOB_ROT_MIN } from '../constants';
import { styles } from '../styles';
import { clamp } from '../tuning';

function shortAngleDeltaDeg(fromDeg: number, toDeg: number): number {
  let d = toDeg - fromDeg;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function pointerAngleDeg(locationX: number, locationY: number, width: number, height: number): number {
  const cx = width / 2;
  const cy = height / 2;
  return (Math.atan2(locationY - cy, locationX - cx) * 180) / Math.PI;
}

export function Knob({
  rotation,
  onRotate,
  disabled = false,
  accessibilityLabel,
  size: sizeProp,
}: {
  rotation: number;
  onRotate: (deg: number) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  size?: number;
}) {
  const { knobSize: defaultKnobSize } = useLayoutMetrics();
  const size = sizeProp ?? defaultKnobSize;

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const lastPointerAngleRef = useRef<number | null>(null);
  const accumulatedRotationRef = useRef(rotation);
  const rotationPropRef = useRef(rotation);
  const draggingRef = useRef(false);
  const animatedRotation = useRef(new Animated.Value(rotation)).current;

  const knobMetrics = useMemo(() => {
    const rim = Math.round(size * 0.09);
    const inner = Math.round(size * 0.16);
    const core = Math.round(size * 0.2);
    const indicatorH = Math.round(size * 0.35);
    return { rim, inner, core, indicatorH };
  }, [size]);

  const outerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  useEffect(() => {
    rotationPropRef.current = rotation;
    if (!draggingRef.current) {
      accumulatedRotationRef.current = rotation;
    }
  }, [rotation]);

  useEffect(() => {
    Animated.timing(animatedRotation, {
      toValue: rotation,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [animatedRotation, rotation]);

  const onKnobLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setLayout({ width, height });
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onStartShouldSetPanResponderCapture: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponderCapture: () => !disabled,
        onPanResponderGrant: (evt) => {
          if (disabled || layout.width <= 0) return;
          draggingRef.current = true;
          const { locationX, locationY } = evt.nativeEvent;
          const a = pointerAngleDeg(locationX, locationY, layout.width, layout.height);
          lastPointerAngleRef.current = a;
          accumulatedRotationRef.current = rotationPropRef.current;
        },
        onPanResponderMove: (evt) => {
          if (disabled || layout.width <= 0 || lastPointerAngleRef.current === null) return;
          const { locationX, locationY } = evt.nativeEvent;
          const a = pointerAngleDeg(locationX, locationY, layout.width, layout.height);
          const delta = shortAngleDeltaDeg(lastPointerAngleRef.current, a);
          lastPointerAngleRef.current = a;
          const next = clamp(accumulatedRotationRef.current + delta, KNOB_ROT_MIN, KNOB_ROT_MAX);
          accumulatedRotationRef.current = next;
          onRotate(next);
        },
        onPanResponderRelease: () => {
          draggingRef.current = false;
          lastPointerAngleRef.current = null;
        },
        onPanResponderTerminate: () => {
          draggingRef.current = false;
          lastPointerAngleRef.current = null;
        },
      }),
    [disabled, layout.width, layout.height, onRotate]
  );

  const indicatorRotation = animatedRotation.interpolate({
    inputRange: [-140, 140],
    outputRange: ['-140deg', '140deg'],
  });

  return (
    <View
      onLayout={onKnobLayout}
      {...(disabled ? {} : panResponder.panHandlers)}
      style={[styles.knobOuter, outerStyle, disabled ? styles.knobOuterDisabled : null]}
      pointerEvents={disabled ? 'none' : 'auto'}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <LinearGradient
        colors={['#806246', '#3d2f23', '#16110e']}
        locations={[0, 0.4, 1]}
        style={styles.knobGradient}
      />

      <View
        style={[
          styles.knobRim,
          { left: knobMetrics.rim, right: knobMetrics.rim, top: knobMetrics.rim, bottom: knobMetrics.rim },
        ]}
      />
      <View
        style={[
          styles.knobInnerRing,
          {
            left: knobMetrics.inner,
            right: knobMetrics.inner,
            top: knobMetrics.inner,
            bottom: knobMetrics.inner,
          },
        ]}
      />
      <LinearGradient
        colors={['#9d7a56', '#2c221a']}
        style={[
          styles.knobCore,
          {
            left: knobMetrics.core,
            right: knobMetrics.core,
            top: knobMetrics.core,
            bottom: knobMetrics.core,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.knobIndicatorWrap,
          {
            top: knobMetrics.rim,
            bottom: knobMetrics.rim,
            left: knobMetrics.rim,
            right: knobMetrics.rim,
            transform: [{ rotate: indicatorRotation }],
          },
        ]}
      >
        <LinearGradient
          colors={['#ffe2aa', '#ff9c3a']}
          style={[styles.knobIndicator, { height: knobMetrics.indicatorH }]}
        />
      </Animated.View>
    </View>
  );
}
