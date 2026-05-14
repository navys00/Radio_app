import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, PanResponder, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const ROT_MIN = -140;
const ROT_MAX = 140;

/** Кратчайшая разница углов в градусах (для непрерывного вращения без скачка ±180). */
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
}: {
  rotation: number;
  onRotate: (deg: number) => void;
  /** Без жестов и с приглушённым видом (радио выключено). */
  disabled?: boolean;
}) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const lastPointerAngleRef = useRef<number | null>(null);
  const accumulatedRotationRef = useRef(rotation);
  const rotationPropRef = useRef(rotation);
  const draggingRef = useRef(false);
  const animatedRotation = useRef(new Animated.Value(rotation)).current;

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
          const next = clamp(accumulatedRotationRef.current + delta, ROT_MIN, ROT_MAX);
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
      style={[styles.knobOuter, disabled ? styles.knobOuterDisabled : null]}
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      <LinearGradient
        colors={['#806246', '#3d2f23', '#16110e']}
        locations={[0, 0.4, 1]}
        style={styles.knobGradient}
      />

      <View style={styles.knobRim} />
      <View style={styles.knobInnerRing} />
      <LinearGradient colors={['#9d7a56', '#2c221a']} style={styles.knobCore} />

      <Animated.View
        style={[styles.knobIndicatorWrap, { transform: [{ rotate: indicatorRotation }] }]}
      >
        <LinearGradient colors={['#ffe2aa', '#ff9c3a']} style={styles.knobIndicator} />
      </Animated.View>
    </View>
  );
}

