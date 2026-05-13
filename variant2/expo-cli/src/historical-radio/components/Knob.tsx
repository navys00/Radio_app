import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function degreesFromCenter(centerX: number, centerY: number, x: number, y: number) {
  return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
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
  const knobRef = useRef<View>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const animatedRotation = useRef(new Animated.Value(rotation)).current;

  useEffect(() => {
    Animated.timing(animatedRotation, {
      toValue: rotation,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [animatedRotation, rotation]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: () => {
          if (disabled) return;
          knobRef.current?.measureInWindow((x, y, w, h) => {
            centerRef.current = { x: x + w / 2, y: y + h / 2 };
          });
        },
        onPanResponderMove: (_evt, gesture) => {
          if (disabled) return;
          const center = centerRef.current;
          if (!center) return;

          const angle = degreesFromCenter(center.x, center.y, gesture.moveX, gesture.moveY);
          const normalized = clamp(angle + 90, -140, 140);
          onRotate(normalized);
        },
      }),
    [disabled, onRotate]
  );

  const indicatorRotation = animatedRotation.interpolate({
    inputRange: [-140, 140],
    outputRange: ['-140deg', '140deg'],
  });

  return (
    <View
      ref={knobRef}
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

