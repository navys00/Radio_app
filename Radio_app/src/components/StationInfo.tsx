import { StyleSheet, Text, View } from 'react-native';
import type { RadioYear } from '@/src/types/radio';

type Props = {
  frequency: number;
  stationName: string;
  year: RadioYear;
};

export function StationInfo({ frequency, stationName, year }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Радио ЭФИР</Text>
      <Text style={styles.line}>{frequency} кГц</Text>
      <Text style={styles.line}>{stationName}</Text>
      <Text style={styles.year}>Год: {year}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#665338',
    padding: 16,
    backgroundColor: '#2e2316',
    gap: 6,
  },
  title: { color: '#f1d6a2', fontSize: 20, fontWeight: '700' },
  line: { color: '#f7ead5', fontSize: 18, fontWeight: '500' },
  year: { color: '#c6b08b', fontSize: 15 },
});
