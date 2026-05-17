import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

export function RadioBodyChrome({
  dialGlow,
  children,
}: {
  dialGlow: number;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.radioBody}>
      <LinearGradient
        colors={['rgba(255,180,90,0.08)', 'rgba(0,0,0,0)']}
        style={[styles.bodyRadialLike, { opacity: dialGlow }]}
        pointerEvents="none"
      />
      <LinearGradient colors={['#4e3928', '#241b15']} style={styles.bodyFill} pointerEvents="none" />
      <View style={styles.bodyNoise} pointerEvents="none" />
      <View style={styles.bodyInsetShadow} pointerEvents="none" />
      <View style={styles.bodyTopBevel} pointerEvents="none" />
      <View style={styles.bodyBottomVignette} pointerEvents="none" />
      <View style={styles.innerPad}>{children}</View>
    </View>
  );
}
