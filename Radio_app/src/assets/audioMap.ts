import { Image, Platform } from 'react-native';
import stationsData from '@/src/assets/stations.json';
import type { StationsConfig } from '@/src/types/radio';

export const STATIC_NOISE_FILE = 'static';

const silenceWavModule = require('../../assets/audio/silence.wav') as number;

const knownAudioIds = new Set<string>([STATIC_NOISE_FILE]);

function walkTrackFiles(visit: (fileId: string) => void): void {
  const data = stationsData as StationsConfig;
  for (const station of data.stations) {
    for (const tracks of Object.values(station.years)) {
      for (const track of tracks) {
        visit(track.file);
      }
    }
  }
  for (const slot of data.offStationSlots ?? []) {
    for (const tracks of Object.values(slot.years)) {
      if (!tracks) continue;
      for (const track of tracks) {
        visit(track.file);
      }
    }
  }
}

walkTrackFiles((id) => knownAudioIds.add(id));

function resolveIosBundledUri(): string {
  const resolved = Image.resolveAssetSource(silenceWavModule);
  const uri = resolved?.uri;
  if (!uri) {
    throw new Error('Bundled assets/audio/silence.wav is missing or could not be resolved');
  }
  return uri;
}

/** URL для react-native-track-player: Android raw, iOS — bundled WAV (пока общий для всех id без отдельных файлов). */
export function resolvePlaybackUrl(fileId: string): string {
  if (Platform.OS === 'web') {
    return '';
  }
  if (Platform.OS === 'android') {
    return `android.resource://com.radio_app/raw/${fileId}`;
  }
  return resolveIosBundledUri();
}

export function isNativeAudioPlaybackSupported(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

export function validateAudioMap(): void {
  walkTrackFiles((fileId) => {
    if (!knownAudioIds.has(fileId)) {
      throw new Error(`Unknown audio id "${fileId}" in stations.json`);
    }
  });
}
