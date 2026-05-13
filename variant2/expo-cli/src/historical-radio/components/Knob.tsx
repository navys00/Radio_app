import React, { useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function degreesFromCenter(centerX: number, centerY: number, x: number, y: number) {
  return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
}

export function Knob({
  rotation,
  onRotate,
}: {
  rotation: number;
  onRotate: (deg: number) => void;
}) {
  const knobRef = useRef<View>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          knobRef.current?.measureInWindow((x, y, w, h) => {
            centerRef.current = { x: x + w / 2, y: y + h / 2 };
          });
        },
        onPanResponderMove: (_evt, gesture) => {
          const center = centerRef.current;
          if (!center) return;

          const angle = degreesFromCenter(center.x, center.y, gesture.moveX, gesture.moveY);
          const normalized = clamp(angle + 90, -140, 140);
          onRotate(normalized);
        },
      }),
    [onRotate]
  );

  return (
    <View ref={knobRef} {...panResponder.panHandlers} style={styles.knobOuter}>
      <LinearGradient
        colors={['#806246', '#3d2f23', '#16110e']}
        locations={[0, 0.4, 1]}
        style={styles.knobGradient}
      />

      <View style={styles.knobRim} />
      <View style={styles.knobInnerRing} />
      <LinearGradient colors={['#9d7a56', '#2c221a']} style={styles.knobCore} />

      <View style={[styles.knobIndicatorWrap, { transform: [{ rotate: `${rotation}deg` }] }]}>
        <LinearGradient colors={['#ffe2aa', '#ff9c3a']} style={styles.knobIndicator} />
      </View>
    </View>
  );
}

