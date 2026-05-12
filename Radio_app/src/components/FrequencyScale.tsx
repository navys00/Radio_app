import type { DimensionValue } from 'react-native';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { FREQUENCY_RANGE, stations } from '@/src/data/radioData';

const SCALE_MAJORS = [530, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];

function pctAlong(f: number): DimensionValue {
  const { min, max } = FREQUENCY_RANGE;
  const t = (f - min) / Math.max(1e-6, max - min);
  const p = Math.max(0, Math.min(100, t * 100));
  return `${p}%` as DimensionValue;
}

type Props = {
  onTrackLayout?: (width: number, height: number) => void;
};

export function FrequencyScale({ onTrackLayout }: Props) {
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    onTrackLayout?.(width, height);
  };

  return (
    <View style={styles.frame} onLayout={onLayout}>
      <View style={styles.frameInnerGlow} />
      <View style={styles.track}>
        <View style={styles.glowBand} />
        {SCALE_MAJORS.map((f) => (
          <View key={f} style={[styles.tickMajor, { left: pctAlong(f) }]} />
        ))}
        {SCALE_MAJORS.map((f) => (
          <Text key={`n-${f}`} style={[styles.freqLabel, { left: pctAlong(f) }]} numberOfLines={1}>
            {f}
          </Text>
        ))}
        {stations.map((s) => (
          <Text key={s.id} style={[styles.cityLabel, { left: pctAlong(s.frequency) }]} numberOfLines={1}>
            {s.city}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    minHeight: 96,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(180, 130, 60, 0.65)',
    backgroundColor: '#120a06',
    shadowColor: '#ff9a3c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  frameInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    margin: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 90, 0.15)',
  },
  track: {
    flex: 1,
    minHeight: 78,
    position: 'relative',
    marginTop: 4,
  },
  glowBand: {
    position: 'absolute',
    left: '2%',
    right: '2%',
    top: 22,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 160, 70, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 190, 120, 0.2)',
  },
  tickMajor: {
    position: 'absolute',
    top: 18,
    width: 2,
    height: 12,
    marginLeft: -1,
    backgroundColor: 'rgba(255, 210, 150, 0.85)',
  },
  freqLabel: {
    position: 'absolute',
    top: 34,
    marginLeft: -14,
    width: 36,
    textAlign: 'center',
    fontSize: 9,
    color: 'rgba(255, 220, 170, 0.88)',
    fontVariant: ['tabular-nums'],
  },
  cityLabel: {
    position: 'absolute',
    top: 2,
    marginLeft: -36,
    width: 72,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 200, 130, 0.95)',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
