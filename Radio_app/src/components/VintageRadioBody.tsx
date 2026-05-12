import { ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  warmupComplete: boolean;
  onWarmupComplete: () => void;
};

export function VintageRadioBody({ children, warmupComplete, onWarmupComplete }: Props) {
  const dim = useSharedValue(warmupComplete ? 0 : 1);

  useEffect(() => {
    if (warmupComplete) {
      dim.value = 0;
      return;
    }
    dim.value = 1;
    dim.value = withTiming(0, { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [warmupComplete, dim]);

  useEffect(() => {
    if (warmupComplete) return;
    const t = setTimeout(() => onWarmupComplete(), 1650);
    return () => clearTimeout(t);
  }, [warmupComplete, onWarmupComplete]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: dim.value * 0.88,
  }));

  return (
    <View style={styles.bg}>
      <View style={styles.woodBase} />
      <View style={styles.woodPanelLeft} />
      <View style={styles.woodPanelRight} />
      <View style={styles.brassTop} />
      <View style={styles.brassBottom} />
      <View style={styles.brassCornerTL} />
      <View style={styles.brassCornerTR} />
      <View style={styles.grille} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
      <Animated.View style={[styles.warmupOverlay, overlayStyle]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#1a0f08',
  },
  woodBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#3d2817',
  },
  woodPanelLeft: {
    position: 'absolute',
    left: 0,
    top: '6%',
    bottom: '6%',
    width: '14%',
    backgroundColor: '#352010',
    borderRightWidth: 2,
    borderRightColor: 'rgba(180, 140, 70, 0.35)',
  },
  woodPanelRight: {
    position: 'absolute',
    right: 0,
    top: '6%',
    bottom: '6%',
    width: '14%',
    backgroundColor: '#352010',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(180, 140, 70, 0.35)',
  },
  brassTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 10,
    backgroundColor: 'rgba(201, 162, 82, 0.45)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(90, 70, 40, 0.6)',
  },
  brassBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 10,
    backgroundColor: 'rgba(201, 162, 82, 0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(90, 70, 40, 0.55)',
  },
  brassCornerTL: {
    position: 'absolute',
    left: 10,
    top: 14,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'rgba(212, 175, 95, 0.55)',
    borderRadius: 2,
  },
  brassCornerTR: {
    position: 'absolute',
    right: 10,
    top: 14,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: 'rgba(212, 175, 95, 0.55)',
    borderRadius: 2,
  },
  grille: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: '8%',
    marginVertical: '18%',
    borderWidth: 2,
    borderColor: 'rgba(90, 70, 45, 0.45)',
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  warmupOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: '#0a0604',
  },
});
