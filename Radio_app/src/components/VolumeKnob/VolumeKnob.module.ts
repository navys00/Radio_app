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
    borderColor: '#7a6a4a',
    backgroundColor: '#1e1810',
  },
  knobRim: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(160, 150, 120, 0.5)',
    backgroundColor: 'transparent',
  },
  knobFace: {
    position: 'absolute',
    backgroundColor: '#2a2620',
    borderWidth: 1,
    borderColor: 'rgba(50, 48, 44, 0.95)',
  },
  marker: {
    position: 'absolute',
    top: 9,
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#c9b896',
    borderWidth: 1,
    borderColor: 'rgba(40, 38, 35, 0.85)',
  },
});
