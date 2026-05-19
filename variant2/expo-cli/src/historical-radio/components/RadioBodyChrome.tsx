import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

export function RadioBodyChrome({
  dialGlow,
  cardWidth,
  children,
}: {
  dialGlow: number;
  cardWidth: number;
  children: React.ReactNode;
}) {
  const bodyStyle: StyleProp<ViewStyle> = [styles.radioBody, { maxWidth: cardWidth }];

  return (
    <View style={bodyStyle}>
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
