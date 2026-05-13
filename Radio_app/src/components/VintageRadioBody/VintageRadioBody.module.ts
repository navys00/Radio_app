import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#15120f',
  },
  bgDots: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  radioBody: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 32,
    padding: 18,
    borderWidth: 2,
    borderColor: '#7f6243',
    backgroundColor: '#241b15',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  radioBodyInner: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
    backgroundColor: '#2b211a',
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
