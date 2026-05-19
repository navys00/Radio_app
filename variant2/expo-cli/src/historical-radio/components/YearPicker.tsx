import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GAME_YEARS } from '../constants';
import { useLayoutMetrics } from '../context/ResponsiveLayoutContext';
import { styles } from '../styles';

type YearPickerProps = {
  selectedYear: string;
  onSelectYear: (year: string) => void;
};

export function YearPicker({ selectedYear, onSelectYear }: YearPickerProps) {
  const { yearBtnHeight } = useLayoutMetrics();

  return (
    <View style={styles.panel}>
      <LinearGradient colors={['#32271f', '#1e1712']} style={StyleSheet.absoluteFill} />
      <View style={styles.panelBevel} pointerEvents="none" />
      <View style={styles.rowBetween}>
        {GAME_YEARS.map((year) => {
          const isActive = selectedYear === year;
          return (
            <Pressable
              key={year}
              disabled={isActive}
              onPress={() => onSelectYear(year)}
              style={({ pressed }) => [
                styles.yearBtn,
                { height: yearBtnHeight },
                isActive ? styles.yearActive : styles.yearIdle,
                isActive ? styles.controlDisabled : null,
                pressed ? styles.controlPressed : null,
              ]}
            >
              <Text style={[styles.yearText, isActive ? styles.yearTextActive : null]}>{year}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
