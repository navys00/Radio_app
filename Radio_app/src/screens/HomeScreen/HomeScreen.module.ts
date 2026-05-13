import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  root: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 14,
  },
  title: {
    color: '#d8c3a5',
    fontSize: 26,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  subtitle: {
    color: '#b89b78',
    fontSize: 14,
    letterSpacing: 4.2,
    marginTop: 6,
    textAlign: 'center',
  },
  landscapeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  landscapeMain: {
    flex: 1.35,
    minWidth: 0,
    paddingRight: 6,
  },
  landscapeSide: {
    flex: 0.88,
    minWidth: 140,
    alignItems: 'center',
    paddingTop: 4,
    gap: 12,
  },
  blocRow: {
    flexDirection: 'row',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1e1712',
    borderWidth: 1,
    borderColor: 'rgba(133,101,67,0.65)',
    marginTop: 6,
  },
  yearRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  blocButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blocButtonText: {
    color: '#b89b78',
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  blocButtonActiveUssr: {
    backgroundColor: '#3b0b08',
  },
  blocButtonTextActiveUssr: {
    color: '#ffd9a0',
  },
  blocButtonActiveAxis: {
    backgroundColor: '#1f1f1f',
  },
  blocButtonTextActiveAxis: {
    color: '#f3e4c5',
  },
  blocButtonActiveAllies: {
    backgroundColor: '#0d2238',
  },
  blocButtonTextActiveAllies: {
    color: '#d8e7ff',
  },
  yearButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1712',
    borderWidth: 1,
    borderColor: 'rgba(133,101,67,0.55)',
  },
  yearButtonActive: {
    backgroundColor: '#c79852',
    borderColor: 'rgba(0,0,0,0.25)',
  },
  yearButtonText: {
    color: '#b89b78',
    fontSize: 16,
    fontFamily: 'Georgia',
    letterSpacing: 0.4,
  },
  yearButtonTextActive: {
    color: '#1d140e',
  },
  scaleWrap: {
    position: 'relative',
    marginTop: 16,
    paddingHorizontal: 6,
  },
  pointerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  stationList: {
    marginTop: 14,
    gap: 10,
  },
  stationCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18,14,11,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(141,107,71,0.35)',
  },
  stationLeft: {
    minWidth: 0,
    flexShrink: 1,
  },
  stationCity: {
    color: '#f2dfc2',
    fontSize: 18,
    fontFamily: 'Georgia',
  },
  stationBloc: {
    color: '#8e775b',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  stationFreq: {
    color: '#d8c3a5',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    marginLeft: 10,
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
  },
  knobRowLandscape: {
    flexDirection: 'column',
    paddingTop: 8,
    paddingBottom: 8,
  },
  knobGap: { width: 28 },
  knobGapLandscape: {
    width: 0,
    height: 16,
  },
});
