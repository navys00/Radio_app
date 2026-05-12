import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FrequencySlider } from '@/src/components/FrequencySlider';
import { StationInfo } from '@/src/components/StationInfo';
import { YearSelector } from '@/src/components/YearSelector';
import { useRadio } from '@/src/context/RadioContext';
import { allFrequencies, YEARS } from '@/src/data/radioData';

export function HomeScreen() {
  const { frequency, year, station, isPlaying, setFrequency, setYear, onTogglePlay, onStop } = useRadio();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <StationInfo frequency={frequency} stationName={station?.city ?? 'Пусто'} year={year} />
        <FrequencySlider frequencies={allFrequencies} frequency={frequency} onChange={(value) => void setFrequency(value)} />
        <YearSelector years={YEARS} selectedYear={year} onSelectYear={(value) => void setYear(value)} />
        <View style={styles.controls}>
          <Pressable style={styles.button} onPress={() => void onTogglePlay()}>
            <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => void onStop()}>
            <Text style={styles.buttonText}>Stop</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1b140d' },
  container: { flex: 1, paddingHorizontal: 18, paddingVertical: 24, gap: 20 },
  controls: { flexDirection: 'row', gap: 12 },
  button: {
    borderWidth: 1,
    borderColor: '#8a734d',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: { color: '#f7ead5', fontWeight: '600' },
});
