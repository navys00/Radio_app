import type { Station } from './types';

export const SCALE_MIN_KHZ = 150;
export const SCALE_MAX_KHZ = 1400;

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Громкость 0…1 по углу ручки (KNOB_ROT_MIN … KNOB_ROT_MAX). */
export function volumeFromKnobDeg(deg: number, rotMin: number, rotMax: number): number {
  return Math.max(0, Math.min(1, (deg - rotMin) / (rotMax - rotMin)));
}

/** Шкала на UI: 0–100% соответствует 150–1400 кГц (линейно). */
export function khzFromTuningPercent(percent: number): number {
  const t = clamp(percent, 0, 100) / 100;
  return Math.round(SCALE_MIN_KHZ + (SCALE_MAX_KHZ - SCALE_MIN_KHZ) * t);
}

export function tuningPercentFromKhz(khz: number): number {
  const k = clamp(khz, SCALE_MIN_KHZ, SCALE_MAX_KHZ);
  return ((k - SCALE_MIN_KHZ) / (SCALE_MAX_KHZ - SCALE_MIN_KHZ)) * 100;
}

export function waveRotationFromTuningPercent(percent: number): number {
  return (clamp(percent, 0, 100) / 100) * 280 - 140;
}

export function tuningPercentFromWaveRotation(deg: number): number {
  return ((clamp(deg, -140, 140) + 140) / 280) * 100;
}

export function stationKey(s: Station): string {
  return `${s.city}:${s.khz}`;
}

export function findNearestStation(stations: Station[], targetKhz: number): Station | null {
  if (stations.length === 0) return null;
  let best = stations[0];
  let bestDist = Math.abs(best.khz - targetKhz);
  for (let i = 1; i < stations.length; i++) {
    const s = stations[i];
    const d = Math.abs(s.khz - targetKhz);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

/** Максимум отклонения по шкале (кГц), при котором станция считается «пойманной» для эфира и плеера. */
export const STATION_CAPTURE_MAX_DELTA_KHZ = 55;

/**
 * Ближайшая станция только если расстояние по частоте не превышает порог;
 * иначе «между станциями» (шум, без эфира).
 */
export function findNearestStationIfCaptured(
  stations: Station[],
  targetKhz: number,
  maxDeltaKhz: number = STATION_CAPTURE_MAX_DELTA_KHZ
): Station | null {
  const nearest = findNearestStation(stations, targetKhz);
  if (!nearest) return null;
  return Math.abs(nearest.khz - targetKhz) <= maxDeltaKhz ? nearest : null;
}
