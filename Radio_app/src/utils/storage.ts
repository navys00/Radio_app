import AsyncStorage from '@react-native-async-storage/async-storage';

const FREQUENCY_KEY = 'radio_frequency';

export async function saveFrequency(frequency: number): Promise<void> {
  await AsyncStorage.setItem(FREQUENCY_KEY, String(frequency));
}

export async function loadRadioState(defaultFrequency: number): Promise<{ frequency: number }> {
  const savedFrequency = await AsyncStorage.getItem(FREQUENCY_KEY);
  const parsedFrequency = Number(savedFrequency);
  const frequency = Number.isFinite(parsedFrequency) ? parsedFrequency : defaultFrequency;
  return { frequency };
}
