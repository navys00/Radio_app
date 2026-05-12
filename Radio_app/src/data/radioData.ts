import stationsJson from '@/src/assets/stations.json';
import type { RadioYear, Station, StationTrack, StationsConfig } from '@/src/types/radio';

export const YEARS: RadioYear[] = ['1941', '1942', '1943', '1944', '1945'];

const config = stationsJson as StationsConfig;

export const stations: Station[] = config.stations;

/** Полосы информационного поля (кГц): непересекающиеся диапазоны для строк станций и подписей оси. */
export const INFORMATION_FIELD_BANDS = [
  {
    id: 'mw_low',
    title: '520–879 кГц',
    minKhz: 520,
    maxKhz: 879,
    axisLabelsKhz: [520, 600, 700, 800] as const,
  },
  {
    id: 'mw_mid',
    title: '880–1239 кГц',
    minKhz: 880,
    maxKhz: 1239,
    axisLabelsKhz: [880, 960, 1040, 1120, 1200] as const,
  },
  {
    id: 'mw_high',
    title: '1240–1600 кГц',
    minKhz: 1240,
    maxKhz: 1600,
    axisLabelsKhz: [1240, 1320, 1400, 1480, 1600] as const,
  },
] as const;

export type InformationFieldBand = (typeof INFORMATION_FIELD_BANDS)[number];

/** Станции, попадающие в полосу информационного поля (включительно по min/max кГц), по возрастанию частоты. */
export function stationsInInformationBand(bandIndex: number): Station[] {
  const b = INFORMATION_FIELD_BANDS[bandIndex];
  if (!b) return [];
  return stations
    .filter((s) => s.frequency >= b.minKhz && s.frequency <= b.maxKhz)
    .sort((a, b) => a.frequency - b.frequency);
}

export const FREQUENCY_RANGE = { min: 520, max: 1600 } as const;

/** Радиус захвата станции (кГц): ближайшая станция, если расстояние не больше этого значения. */
export const STATION_CAPTURE_KHZ = 35;

export const stationById = new Map<string, Station>(stations.map((station) => [station.id, station]));

export function clampFrequencyKhz(value: number): number {
  const n = Math.round(value);
  return Math.max(FREQUENCY_RANGE.min, Math.min(FREQUENCY_RANGE.max, n));
}

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

/** Ближайшая станция в пределах `STATION_CAPTURE_KHZ`, иначе `undefined` (шум). */
export function resolveStationForFrequency(frequencyKhz: number): Station | undefined {
  if (stations.length === 0) return undefined;
  const f = clampFrequencyKhz(frequencyKhz);
  let best: Station = stations[0];
  let bestD = Math.abs(f - best.frequency);
  for (let i = 1; i < stations.length; i++) {
    const s = stations[i];
    const d = Math.abs(f - s.frequency);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return bestD <= STATION_CAPTURE_KHZ ? best : undefined;
}

export function getStationById(stationId: string): Station | undefined {
  return stationById.get(stationId);
}
