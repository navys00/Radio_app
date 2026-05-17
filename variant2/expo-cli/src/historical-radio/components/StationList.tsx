import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLayoutMetrics } from '../context/ResponsiveLayoutContext';
import { styles } from '../styles';
import type { Station } from '../types';
import { stationDisplayCity } from '../stationDisplay';
import { stationKey } from '../tuning';

type StationListProps = {
  stations: Station[];
  selectedYear: string;
  isRadioOn: boolean;
  nearestStation: Station | null;
};

export function StationList({
  stations,
  selectedYear,
  isRadioOn,
  nearestStation,
}: StationListProps) {
  const { stationFontSize } = useLayoutMetrics();
  const freqFontSize = Math.max(10, stationFontSize - 1);

  if (stations.length === 0) {
    return (
      <View style={styles.emptyStationsWrap}>
        <Text style={styles.emptyStationsText}>
          На выбранный год в этом блоке нет станций в списке.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.stationsWrap}>
      {stations.map((s) => {
        const label = stationDisplayCity(s, selectedYear);
        const isTuned =
          isRadioOn && nearestStation !== null && stationKey(s) === stationKey(nearestStation);
        return (
          <View
            key={`${selectedYear}-${s.khz}`}
            style={[styles.stationCard, isTuned ? styles.stationCardActive : null]}
          >
            <LinearGradient
              colors={
                isTuned
                  ? ['rgba(62,44,28,0.98)', 'rgba(26,18,12,0.98)']
                  : ['rgba(36,27,20,0.95)', 'rgba(18,14,11,0.95)']
              }
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.stationLeft}>
              <Text
                style={[
                  styles.stationCity,
                  { fontSize: stationFontSize },
                  isTuned ? styles.stationCityActive : null,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {label}
              </Text>
            </View>
            <Text
              style={[
                styles.stationFreq,
                { fontSize: freqFontSize },
                isTuned ? styles.stationFreqActive : null,
              ]}
            >
              {s.freq}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
