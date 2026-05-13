import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BroadcastBloc, RadioYear, VolumeLevel } from '@/src/types/radio';
import {
  clampFrequencyKhz,
  DEFAULT_BROADCAST_BLOC,
  DEFAULT_RADIO_YEAR,
  parseBroadcastBloc,
  parseRadioYear,
} from '@/src/data/radioData';

const FREQUENCY_KEY = 'radio_frequency';
const VOLUME_KEY = 'radio_volume';
const YEAR_KEY = 'radio_year';
const BLOC_KEY = 'radio_bloc';

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

export async function saveBroadcastBloc(bloc: BroadcastBloc): Promise<void> {
  await AsyncStorage.setItem(BLOC_KEY, bloc);
}

export async function loadRadioState(
  defaultFrequency: number,
  defaultVolume: VolumeLevel,
  defaultYear: RadioYear = DEFAULT_RADIO_YEAR,
  defaultBloc: BroadcastBloc = DEFAULT_BROADCAST_BLOC,
): Promise<{ frequency: number; volume: VolumeLevel; year: RadioYear; bloc: BroadcastBloc }> {
  const [savedFrequency, savedVolume, savedYear, savedBloc] = await Promise.all([
    AsyncStorage.getItem(FREQUENCY_KEY),
    AsyncStorage.getItem(VOLUME_KEY),
    AsyncStorage.getItem(YEAR_KEY),
    AsyncStorage.getItem(BLOC_KEY),
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
  const bloc = parseBroadcastBloc(savedBloc) ?? defaultBloc;

  return { frequency, volume, year, bloc };
}
