import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RadioYear } from '@/src/types/radio';

const FREQUENCY_KEY = 'radio_frequency';
const YEAR_KEY = 'radio_year';

export async function saveFrequency(frequency: number): Promise<void> {
  await AsyncStorage.setItem(FREQUENCY_KEY, String(frequency));
}

export async function saveYear(year: RadioYear): Promise<void> {
  await AsyncStorage.setItem(YEAR_KEY, year);
}

export async function loadRadioState(defaultFrequency: number, defaultYear: RadioYear): Promise<{
  frequency: number;
  year: RadioYear;
}> {
  const [savedFrequency, savedYear] = await Promise.all([
    AsyncStorage.getItem(FREQUENCY_KEY),
    AsyncStorage.getItem(YEAR_KEY),
  ]);

  const parsedFrequency = Number(savedFrequency);
  const frequency = Number.isFinite(parsedFrequency) ? parsedFrequency : defaultFrequency;
  const year = (savedYear ?? defaultYear) as RadioYear;

  return { frequency, year };
}
