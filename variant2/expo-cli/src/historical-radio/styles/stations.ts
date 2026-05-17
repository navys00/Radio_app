import { StyleSheet } from 'react-native';

export const stationStyles = StyleSheet.create({
  stationsWrap: {
    gap: 10,
    marginBottom: 18,
  },
  stationCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(141,107,71,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  stationCardActive: {
    borderColor: 'rgba(255, 170, 80, 0.75)',
    borderWidth: 2,
    shadowColor: '#ff7a14',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  stationLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  stationCity: {
    color: '#f2dfc2',
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  stationBlock: {
    color: '#8e775b',
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  stationFreq: {
    color: '#d8c3a5',
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    letterSpacing: 0.8,
  },
  stationCityActive: {
    color: '#ffe8c4',
  },
  stationFreqActive: {
    color: '#ffc978',
  },
  emptyStationsWrap: {
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(141,107,71,0.25)',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyStationsText: {
    color: '#8e775b',
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
