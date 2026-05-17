import { useMemo } from 'react';
import { STATIONS_BY_BLOCK } from '../data/stationsData';
import type { MilitaryBlock } from '../types';
import { findNearestStationIfCaptured, khzFromTuningPercent } from '../tuning';

export function useStationCatalog(
  selectedBlock: MilitaryBlock,
  selectedYear: string,
  frequencyPosition: number
) {
  const stationsAll = STATIONS_BY_BLOCK[selectedBlock] ?? [];

  const stations = useMemo(
    () =>
      stationsAll
        .filter((s) => s.years.includes(selectedYear))
        .sort((a, b) => a.khz - b.khz),
    [stationsAll, selectedYear]
  );

  const stationsVisible = useMemo(
    () => stations.filter((s) => !s.secret).slice(0, 3),
    [stations]
  );

  const tuningKhz = useMemo(() => khzFromTuningPercent(frequencyPosition), [frequencyPosition]);

  const nearestStation = useMemo(
    () => findNearestStationIfCaptured(stations, tuningKhz),
    [stations, tuningKhz]
  );

  return {
    stations,
    stationsVisible,
    tuningKhz,
    nearestStation,
  };
}
