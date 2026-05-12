import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RadioYear } from '@/src/types/radio';

type Props = {
  years: RadioYear[];
  selectedYear: RadioYear;
  onSelectYear: (year: RadioYear) => void;
};

export function YearSelector({ years, selectedYear, onSelectYear }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Год</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {years.map((year) => {
          const active = year === selectedYear;
          return (
            <Pressable
              key={year}
              onPress={() => onSelectYear(year)}
              style={[styles.yearChip, active && styles.yearChipActive]}>
              <Text style={[styles.yearText, active && styles.yearTextActive]}>{year}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 8 },
  label: { color: '#f7ead5', fontSize: 18, fontWeight: '600' },
  scrollContent: { gap: 10, paddingVertical: 4 },
  yearChip: {
    borderWidth: 1,
    borderColor: '#7d6c4b',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  yearChipActive: {
    backgroundColor: '#f1d6a2',
    borderColor: '#f1d6a2',
  },
  yearText: { color: '#f7ead5', fontWeight: '600' },
  yearTextActive: { color: '#2e2316' },
});
