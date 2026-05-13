import type { Station } from './types';

export const SCALE_MIN_KHZ = 150;
export const SCALE_MAX_KHZ = 1400;

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

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
