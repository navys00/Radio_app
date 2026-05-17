import { StyleSheet } from 'react-native';

export const stationStyles = StyleSheet.create({
  stationsWrap: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 4,
  },
  stationCard: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(141,107,71,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    minHeight: 28,
  },
  stationCardActive: {
    borderColor: 'rgba(255, 170, 80, 0.75)',
    borderWidth: 2,
    shadowColor: '#ff7a14',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  stationLeft: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 6,
  },
  stationCity: {
    color: '#f2dfc2',
    fontFamily: 'Oswald_600SemiBold',
    letterSpacing: 0.3,
  },
  stationBlock: {
    color: '#8e775b',
    fontFamily: 'Oswald_400Regular',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  stationFreq: {
    color: '#d8c3a5',
    fontFamily: 'Oswald_400Regular',
    letterSpacing: 0.5,
  },
  stationCityActive: {
    color: '#ffe8c4',
  },
  stationFreqActive: {
    color: '#ffc978',
  },
  emptyStationsWrap: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(141,107,71,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  emptyStationsText: {
    color: '#8e775b',
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
