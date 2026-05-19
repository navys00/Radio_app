import type { Station } from './types';

export function stationDisplayCity(station: Station, selectedYear: string): string {
  return station.cityByYear?.[selectedYear] ?? station.city;
}
