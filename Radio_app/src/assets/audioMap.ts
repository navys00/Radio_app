import stationsData from '@/src/assets/stations.json';

export const STATIC_NOISE_FILE = 'static';

type StationData = {
  stations: {
    id: string;
    years: Record<string, { file: string; title: string }[]>;
  }[];
};

const knownAudioIds = new Set<string>([STATIC_NOISE_FILE]);

for (const station of (stationsData as StationData).stations) {
  Object.values(station.years).forEach((tracks) => {
    tracks.forEach((track) => knownAudioIds.add(track.file));
  });
}

export function resolveAndroidRawResource(fileId: string): string {
  return `android.resource://com.radio_app/raw/${fileId}`;
}

export function validateAudioMap(): void {
  // Contract check to fail fast in dev if stations.json includes invalid ids.
  const data = stationsData as StationData;
  for (const station of data.stations) {
    for (const tracks of Object.values(station.years)) {
      for (const track of tracks) {
        if (!knownAudioIds.has(track.file)) {
          throw new Error(`Unknown audio id "${track.file}" in stations.json`);
        }
      }
    }
  }
}
