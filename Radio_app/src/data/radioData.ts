import stationsJson from '@/src/assets/stations.json';
import type { RadioYear, Station, StationsConfig } from '@/src/types/radio';

export const YEARS: RadioYear[] = ['1941', '1942', '1943', '1944', '1945'];

const config = stationsJson as StationsConfig;

export const stations: Station[] = config.stations;
export const emptyFrequencies: number[] = config.emptyFrequencies;

export const allFrequencies = [...new Set([...stations.map((s) => s.frequency), ...emptyFrequencies])].sort(
  (a, b) => a - b,
);

export const stationByFrequency = new Map<number, Station>(stations.map((station) => [station.frequency, station]));
export const stationById = new Map<string, Station>(stations.map((station) => [station.id, station]));

export function getStationByFrequency(frequency: number): Station | undefined {
  return stationByFrequency.get(frequency);
}

export function getStationById(stationId: string): Station | undefined {
  return stationById.get(stationId);
}
