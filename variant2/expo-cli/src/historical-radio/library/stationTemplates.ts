import { STATIONS_BY_BLOCK } from '../data/stationsData';
import type { MilitaryBlock, Station } from '../types';

/** Шаблоны станций без плейлиста — для ручного режима (те же частоты и города). */
export function getStationTemplatesForBlockYear(
  block: MilitaryBlock,
  selectedYear: string
): Station[] {
  const all = STATIONS_BY_BLOCK[block] ?? [];
  return all
    .filter((s) => s.years.includes(selectedYear) && !s.secret)
    .sort((a, b) => a.khz - b.khz)
    .slice(0, 3)
    .map(
      ({ city, cityByYear, freq, khz, years }): Station => ({
        city,
        cityByYear,
        freq,
        khz,
        years,
        playlist: [],
      })
    );
}
