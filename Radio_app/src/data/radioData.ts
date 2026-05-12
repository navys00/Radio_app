import stationsJson from '@/src/assets/stations.json';
import type { RadioYear, Station, StationTrack, StationsConfig } from '@/src/types/radio';

export const YEARS: RadioYear[] = ['1941', '1942', '1943', '1944', '1945'];

const config = stationsJson as StationsConfig;

export const stations: Station[] = config.stations;
export const emptyFrequencies: number[] = config.emptyFrequencies;

export const allFrequencies = [...new Set([...stations.map((s) => s.frequency), ...emptyFrequencies])].sort(
  (a, b) => a - b,
);

export const FREQUENCY_RANGE = {
  min: Math.min(...allFrequencies),
  max: Math.max(...allFrequencies),
} as const;

export const stationByFrequency = new Map<number, Station>(stations.map((station) => [station.frequency, station]));
export const stationById = new Map<string, Station>(stations.map((station) => [station.id, station]));

export function getAllTracksForStation(station: Station): StationTrack[] {
  const out: StationTrack[] = [];
  for (const y of YEARS) {
    const chunk = station.years[y];
    if (chunk?.length) {
      out.push(...chunk);
    }
  }
  return out;
}

export function getStationByFrequency(frequency: number): Station | undefined {
  return stationByFrequency.get(frequency);
}

export function getStationById(stationId: string): Station | undefined {
  return stationById.get(stationId);
}

export function snapToNearestFrequency(value: number, frequencies: number[]): number {
  if (frequencies.length === 0) return value;
  let best = frequencies[0];
  let bestD = Math.abs(value - best);
  for (let i = 1; i < frequencies.length; i++) {
    const f = frequencies[i];
    const d = Math.abs(value - f);
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best;
}
