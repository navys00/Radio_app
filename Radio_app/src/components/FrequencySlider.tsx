import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  frequencies: number[];
  frequency: number;
  onChange: (frequency: number) => void;
};

export function FrequencySlider({ frequencies, frequency, onChange }: Props) {
  const index = Math.max(0, frequencies.indexOf(frequency));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Частота: {frequency} кГц</Text>
      <Slider
        minimumValue={0}
        maximumValue={Math.max(0, frequencies.length - 1)}
        step={1}
        value={index}
        minimumTrackTintColor="#c79d42"
        maximumTrackTintColor="#5a4e3c"
        thumbTintColor="#f1d6a2"
        onValueChange={(value) => {
          const target = frequencies[Math.round(value)];
          if (typeof target === 'number') onChange(target);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 8 },
  label: { color: '#f7ead5', fontSize: 18, fontWeight: '600' },
});
