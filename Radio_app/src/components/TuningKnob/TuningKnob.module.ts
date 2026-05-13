import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#9a7a3a',
    backgroundColor: '#2a1a0e',
  },
  knobRim: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 95, 0.55)',
    backgroundColor: 'transparent',
  },
  knobFace: {
    position: 'absolute',
    backgroundColor: '#3d2818',
    borderWidth: 1,
    borderColor: 'rgba(60, 40, 25, 0.9)',
  },
  marker: {
    position: 'absolute',
    top: 10,
    width: 4,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#e8c56a',
    borderWidth: 1,
    borderColor: 'rgba(90, 60, 30, 0.8)',
  },
});
