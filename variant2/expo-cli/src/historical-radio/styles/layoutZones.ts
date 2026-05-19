import { StyleSheet } from 'react-native';

export const layoutZoneStyles = StyleSheet.create({
  layoutColumn: {
    flex: 1,
  },
  zoneHeader: {
    flexShrink: 0,
  },
  zoneScale: {
    flex: 1,
    minHeight: 48,
  },
  zonePanels: {
    flexShrink: 0,
  },
  zoneStations: {
    flex: 1,
    minHeight: 64,
  },
  zonePlaylist: {
    flexShrink: 0,
  },
  zoneControls: {
    flex: 1,
    minHeight: 72,
    justifyContent: 'center',
  },
});
