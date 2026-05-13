import { StyleSheet } from 'react-native';

const DIAL_FACE = '#e8dcc8';
const DIAL_FACE_DEEP = '#dccfbb';
const BRASS = '#9a7a48';
const BRASS_LIGHT = '#c4a86a';
const FRAME_OUTER = '#14100c';
const FRAME_INNER = '#3a2e24';

/** Цвет штрихов шкалы (экспорт для подписей тиков в JSX). */
export const DIAL_INK = '#2a2218';

export const styles = StyleSheet.create({
  mount: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: FRAME_OUTER,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0a0806',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 6,
  },
  mountCompact: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  mountRim: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRASS_LIGHT,
    opacity: 0.35,
  },
  dialCard: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: FRAME_INNER,
    backgroundColor: DIAL_FACE,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  dialContent: {
    paddingHorizontal: 10,
    paddingTop: 2,
    overflow: 'hidden',
  },
  dialArcShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 48,
    backgroundColor: DIAL_FACE_DEEP,
    opacity: 0.55,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,48,36,0.2)',
  },
  dialCaption: {
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 2.4,
    fontWeight: '600',
    color: DIAL_INK,
    opacity: 0.88,
  },
  dialCaptionCompact: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  cityRowBand: {
    position: 'relative',
    width: '100%',
    minHeight: 40,
    marginTop: 4,
  },
  cityRowBandCompact: {
    minHeight: 34,
    marginTop: 2,
  },
  citySlot: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  cityLabel: {
    width: '100%',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    color: DIAL_INK,
    letterSpacing: 0.2,
  },
  cityLabelCompact: {
    fontSize: 9.5,
    lineHeight: 12,
  },
  hairlineToScale: {
    marginTop: 3,
    width: 1,
    height: 11,
    backgroundColor: 'rgba(42,34,24,0.38)',
  },
  hairlineToScaleCompact: {
    marginTop: 2,
    height: 9,
  },
  scaleWindow: {
    marginHorizontal: '1.5%',
    marginTop: 8,
    height: 56,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BRASS,
    backgroundColor: '#d4c4ae',
    position: 'relative',
    overflow: 'hidden',
  },
  scaleWindowCompact: {
    marginTop: 6,
    height: 48,
  },
  scaleWindowInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 235, 200, 0.35)',
  },
  scaleGraduation: {
    position: 'absolute',
    left: '1%',
    right: '1%',
    top: 12,
    height: 26,
    borderTopWidth: 1,
    borderTopColor: 'rgba(42,34,24,0.15)',
  },
  scaleGraduationCompact: {
    top: 10,
    height: 22,
  },
  tick: {
    position: 'absolute',
    bottom: 8,
    width: 1,
    marginLeft: -0.5,
  },
  stationPin: {
    position: 'absolute',
    bottom: 6,
    width: 3,
    height: 14,
    marginLeft: -1.5,
    backgroundColor: '#8b2a1a',
    borderRadius: 1,
    borderWidth: 0.5,
    borderColor: '#5a1808',
  },
  freqRows: {
    marginTop: 10,
    paddingHorizontal: 0,
  },
  freqRowsCompact: {
    marginTop: 6,
  },
  freqRow: {
    position: 'relative',
    width: '100%',
    height: 22,
    marginTop: 4,
  },
  freqRowCompact: {
    height: 19,
    marginTop: 2,
  },
  freqRowFirst: {
    marginTop: 0,
  },
  freqLabel: {
    position: 'absolute',
    top: 0,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: DIAL_INK,
    fontVariant: ['tabular-nums'],
  },
  freqLabelCompact: {
    fontSize: 10,
  },
});
