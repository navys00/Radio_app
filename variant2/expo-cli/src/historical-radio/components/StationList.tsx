import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';
import type { MilitaryBlock, Station } from '../types';
import { stationKey } from '../tuning';

type StationListProps = {
  stations: Station[];
  selectedBlock: MilitaryBlock;
  selectedYear: string;
  isRadioOn: boolean;
  nearestStation: Station | null;
};

export function StationList({
  stations,
  selectedBlock,
  selectedYear,
  isRadioOn,
  nearestStation,
}: StationListProps) {
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
        const isTuned =
          isRadioOn && nearestStation !== null && stationKey(s) === stationKey(nearestStation);
        return (
          <View
            key={`${selectedBlock}-${selectedYear}-${s.city}-${s.khz}`}
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
              <Text style={[styles.stationCity, isTuned ? styles.stationCityActive : null]}>
                {s.city}
              </Text>
              <Text style={styles.stationBlock}>{selectedBlock}</Text>
            </View>
            <Text style={[styles.stationFreq, isTuned ? styles.stationFreqActive : null]}>
              {s.freq}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
