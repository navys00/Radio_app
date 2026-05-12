import stationsJson from '@/src/assets/stations.json';
import type { OffStationSlot, RadioYear, Station, StationTrack, StationsConfig } from '@/src/types/radio';

export const YEARS: RadioYear[] = ['1941', '1942', '1943', '1944', '1945'];

export const DEFAULT_RADIO_YEAR: RadioYear = '1943';

const config = stationsJson as StationsConfig;

export const stations: Station[] = config.stations;

export const offStationSlots: OffStationSlot[] = [...(config.offStationSlots ?? [])].sort((a, b) =>
  a.minKhz !== b.minKhz ? a.minKhz - b.minKhz : a.id.localeCompare(b.id),
);

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

/** Базовый гистерезис для слотов вне станций; фактическая зона ограничивается ближайшими станциями. */
export const OFF_STATION_HYSTERESIS_KHZ = 12;

export const stationById = new Map<string, Station>(stations.map((station) => [station.id, station]));

export function clampFrequencyKhz(value: number): number {
  const n = Math.round(value);
  return Math.max(FREQUENCY_RANGE.min, Math.min(FREQUENCY_RANGE.max, n));
}

/** Все треки станции по всем годам (например для валидации контента). */
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

export function filterTrackForStationContext(track: StationTrack, station: Station): boolean {
  if (track.forbiddenStationIds?.includes(station.id)) {
    return false;
  }
  if (track.allowedStationIds?.length && !track.allowedStationIds.includes(station.id)) {
    return false;
  }
  if (track.allowedCountryCodes?.length) {
    if (!station.countryCode || !track.allowedCountryCodes.includes(station.countryCode)) {
      return false;
    }
  }
  return true;
}

export function getTracksForStationYear(station: Station, year: RadioYear): StationTrack[] {
  const raw = station.years[year] ?? [];
  return raw.filter((t) => filterTrackForStationContext(t, station));
}

export function getTracksForOffSlotYear(slot: OffStationSlot, year: RadioYear): StationTrack[] {
  return [...(slot.years[year] ?? [])];
}

/** Ближайшая станция в пределах `STATION_CAPTURE_KHZ`, иначе `undefined`. */
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

function pickOffSlotAtFrequency(frequencyKhz: number): OffStationSlot | null {
  const f = clampFrequencyKhz(frequencyKhz);
  for (const s of offStationSlots) {
    if (f < s.minKhz || f > s.maxKhz) continue;
    if (s.overridesStationCapture !== false) return s;
    if (!resolveStationForFrequency(f)) return s;
  }
  return null;
}

function nearestStationAbove(minExclusive: number): Station | undefined {
  let best: Station | undefined;
  let bestF = Infinity;
  for (const s of stations) {
    if (s.frequency > minExclusive && s.frequency < bestF) {
      bestF = s.frequency;
      best = s;
    }
  }
  return best;
}

function nearestStationBelow(maxExclusive: number): Station | undefined {
  let best: Station | undefined;
  let bestF = -Infinity;
  for (const s of stations) {
    if (s.frequency < maxExclusive && s.frequency > bestF) {
      bestF = s.frequency;
      best = s;
    }
  }
  return best;
}

/** Допустимый гистерезис снаружи слота, чтобы не залезать в зону уверенного захвата соседней станции. */
export function effectiveOffSlotHysteresisKhz(slot: OffStationSlot): { down: number; up: number } {
  let up = OFF_STATION_HYSTERESIS_KHZ;
  let down = OFF_STATION_HYSTERESIS_KHZ;
  const above = nearestStationAbove(slot.maxKhz);
  if (above) {
    const edge = above.frequency - STATION_CAPTURE_KHZ;
    const gap = edge - slot.maxKhz;
    up = Math.max(0, Math.min(up, gap > 0 ? gap - 1 : 0));
  }
  const below = nearestStationBelow(slot.minKhz);
  if (below) {
    const edge = below.frequency + STATION_CAPTURE_KHZ;
    const gap = slot.minKhz - edge;
    down = Math.max(0, Math.min(down, gap > 0 ? gap - 1 : 0));
  }
  return { down, up };
}

export type TunedSource =
  | { kind: 'station'; station: Station }
  | { kind: 'off'; slot: OffStationSlot }
  | { kind: 'noise' };

export type OffSlotHysteresisState = { slotId: string | null };

/**
 * Разрешает источник эфира: слот вне станций (с приоритетом overridesStationCapture),
 * затем захват станции, иначе шум.
 */
export function resolveTunedSource(
  frequencyKhz: number,
  offState: OffSlotHysteresisState,
): { source: TunedSource; nextOffState: OffSlotHysteresisState } {
  const f = clampFrequencyKhz(frequencyKhz);
  const slot = pickOffSlotAtFrequency(f);
  if (slot) {
    return { source: { kind: 'off', slot }, nextOffState: { slotId: slot.id } };
  }

  const station = resolveStationForFrequency(frequencyKhz);
  if (station) {
    return { source: { kind: 'station', station }, nextOffState: { slotId: null } };
  }

  if (offState.slotId) {
    const prev = offStationSlots.find((s) => s.id === offState.slotId);
    if (prev) {
      const { down, up } = effectiveOffSlotHysteresisKhz(prev);
      const lo = prev.minKhz - down;
      const hi = prev.maxKhz + up;
      if (f >= lo && f <= hi) {
        return { source: { kind: 'off', slot: prev }, nextOffState: { slotId: prev.id } };
      }
    }
  }

  return { source: { kind: 'noise' }, nextOffState: { slotId: null } };
}

export function getStationById(stationId: string): Station | undefined {
  return stationById.get(stationId);
}

export function parseRadioYear(value: string | null | undefined): RadioYear | null {
  if (!value) return null;
  return YEARS.includes(value as RadioYear) ? (value as RadioYear) : null;
}
