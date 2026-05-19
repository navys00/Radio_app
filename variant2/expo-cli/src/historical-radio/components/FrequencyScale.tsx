import React from 'react';
import { Animated, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SCALE_MARK_KHZ } from '../constants';
import { styles } from '../styles';
import { tuningPercentFromKhz } from '../tuning';

type FrequencyScaleProps = {
  isRadioOn: boolean;
  dialGlow: number;
  scaleWidth: number;
  sliderTranslateX: Animated.AnimatedInterpolation<number>;
  onScaleLayout: (event: LayoutChangeEvent) => void;
};

export function FrequencyScale({
  isRadioOn,
  dialGlow,
  scaleWidth,
  sliderTranslateX,
  onScaleLayout,
}: FrequencyScaleProps) {
  return (
    <View style={styles.scale}>
      <LinearGradient
        colors={['#120f0d', '#241b14', '#100d0b']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.scaleInnerShadow} pointerEvents="none" />

      <View style={styles.scaleTopRow}>
        <Text style={[styles.scaleBand, !isRadioOn ? styles.scaleTextDim : null]}>LW</Text>
        <Text style={[styles.scaleBand, !isRadioOn ? styles.scaleTextDim : null]}>MW</Text>
        <Text style={[styles.scaleBand, !isRadioOn ? styles.scaleTextDim : null]}>SW</Text>
      </View>

      <View style={styles.scaleTicksWrap} onLayout={onScaleLayout}>
        <View style={styles.ticksRow}>
          {Array.from({ length: 32 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.tick,
                i % 4 === 0 ? styles.tickMajor : styles.tickMinor,
                { opacity: isRadioOn ? 1 : 0.38 },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.slider,
            {
              transform: [{ translateX: sliderTranslateX }],
              opacity: (scaleWidth > 0 ? 1 : 0) * dialGlow,
            },
          ]}
        />

        <View style={styles.scaleBottomRow}>
          {SCALE_MARK_KHZ.map((khz) => {
            const pct = tuningPercentFromKhz(khz);
            return (
              <View key={khz} style={[styles.scaleMarkAnchor, { left: `${pct}%` }]}>
                <Text style={[styles.scaleNumber, !isRadioOn ? styles.scaleTextDim : null]}>
                  {khz}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <LinearGradient
        colors={['rgba(255,244,210,0.22)', 'rgba(255,244,210,0.02)', 'rgba(0,0,0,0)']}
        locations={[0, 0.42, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[styles.scaleGlassSheen, { opacity: 0.95 * dialGlow }]}
        pointerEvents="none"
      />
      <View style={[styles.scaleGlassMist, { opacity: isRadioOn ? 1 : 0.12 }]} pointerEvents="none" />
    </View>
  );
}
