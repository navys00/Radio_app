import type { Station, StationsByBlock } from '../types';
import stationsRaw from './stations.json';

export const STATIONS_BY_BLOCK = stationsRaw as StationsByBlock;

export const ALL_STATIONS_FLAT: Station[] = [
  ...STATIONS_BY_BLOCK['СССР'],
  ...STATIONS_BY_BLOCK['ОСЬ'],
  ...STATIONS_BY_BLOCK['Союзники'],
];
