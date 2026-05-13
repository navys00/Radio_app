import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  pointer: {
    position: 'absolute',
    left: 0,
    bottom: 4,
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderBottomColor: '#e63b2a',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    shadowColor: '#ff4a3a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  stem: {
    marginTop: -1,
    backgroundColor: '#c42e22',
    borderRadius: 2,
    shadowColor: '#ff2a1a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 4,
  },
});
