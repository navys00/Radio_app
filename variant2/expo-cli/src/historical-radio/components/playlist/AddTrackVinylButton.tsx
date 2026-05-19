import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  size?: number;
};

/** Граммофонная пластинка с жёлтым лейблом и «+» в центре. */
export function AddTrackVinylButton({ size = 80 }: Props) {
  const labelSize = Math.round(size * 0.42);
  const plusSize = Math.round(size * 0.32);

  return (
    <View
      style={[
        styles.disc,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.grooveOuter,
          {
            width: size - 10,
            height: size - 10,
            borderRadius: (size - 10) / 2,
          },
        ]}
      />
      <View
        style={[
          styles.grooveInner,
          {
            width: size - 22,
            height: size - 22,
            borderRadius: (size - 22) / 2,
          },
        ]}
      />
      <LinearGradient
        colors={['#f3be73', '#e0a84a', '#b87a2f']}
        style={[
          styles.label,
          {
            width: labelSize,
            height: labelSize,
            borderRadius: labelSize / 2,
          },
        ]}
      >
        <Text style={[styles.plus, { fontSize: plusSize, lineHeight: plusSize + 2 }]}>+</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  grooveOuter: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  grooveInner: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 180, 0.35)',
  },
  plus: {
    color: '#24150a',
    fontFamily: 'Oswald_600SemiBold',
    marginTop: -2,
  },
});
