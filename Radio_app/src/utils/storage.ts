import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RadioYear, VolumeLevel } from '@/src/types/radio';
import { clampFrequencyKhz, DEFAULT_RADIO_YEAR, parseRadioYear } from '@/src/data/radioData';

const FREQUENCY_KEY = 'radio_frequency';
const VOLUME_KEY = 'radio_volume';
const YEAR_KEY = 'radio_year';

export async function saveFrequency(frequency: number): Promise<void> {
  await AsyncStorage.setItem(FREQUENCY_KEY, String(clampFrequencyKhz(frequency)));
}

export async function saveVolume(volume: VolumeLevel): Promise<void> {
  const v = Math.max(0, Math.min(100, Math.round(volume)));
  await AsyncStorage.setItem(VOLUME_KEY, String(v));
}

export async function saveRadioYear(year: RadioYear): Promise<void> {
  await AsyncStorage.setItem(YEAR_KEY, year);
}

export async function loadRadioState(
  defaultFrequency: number,
  defaultVolume: VolumeLevel,
  defaultYear: RadioYear = DEFAULT_RADIO_YEAR,
): Promise<{ frequency: number; volume: VolumeLevel; year: RadioYear }> {
  const [savedFrequency, savedVolume, savedYear] = await Promise.all([
    AsyncStorage.getItem(FREQUENCY_KEY),
    AsyncStorage.getItem(VOLUME_KEY),
    AsyncStorage.getItem(YEAR_KEY),
  ]);

  const parsedFrequency = Number(savedFrequency);
  const frequency = Number.isFinite(parsedFrequency)
    ? clampFrequencyKhz(parsedFrequency)
    : clampFrequencyKhz(defaultFrequency);

  const parsedVolume = Number(savedVolume);
  const volume = Number.isFinite(parsedVolume)
    ? Math.max(0, Math.min(100, Math.round(parsedVolume)))
    : Math.max(0, Math.min(100, Math.round(defaultVolume)));

  const year = parseRadioYear(savedYear) ?? defaultYear;

  return { frequency, volume, year };
}
