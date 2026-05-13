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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  topSpacer: { flex: 1 },
  blocRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
  },
  yearRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
  },
  yearChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(62, 48, 32, 0.45)',
    backgroundColor: 'rgba(245, 236, 216, 0.35)',
  },
  yearChipActive: {
    backgroundColor: 'rgba(62, 48, 32, 0.88)',
    borderColor: 'rgba(62, 48, 32, 0.88)',
  },
  yearChipPressed: {
    opacity: 0.85,
  },
  yearChipText: {
    fontFamily: 'Georgia',
    fontSize: 14,
    letterSpacing: 0.5,
    color: 'rgba(62, 48, 32, 0.92)',
  },
  yearChipTextActive: {
    color: '#f5ecd8',
  },
  scaleWrap: {
    position: 'relative',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  pointerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
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
