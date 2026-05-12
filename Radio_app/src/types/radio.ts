export type RadioYear = '1941' | '1942' | '1943' | '1944' | '1945';

export type StationTrack = {
  file: string;
  title: string;
};

export type Station = {
  id: string;
  city: string;
  frequency: number;
  years: Record<RadioYear, StationTrack[]>;
};

export type StationsConfig = {
  stations: Station[];
  emptyFrequencies: number[];
};
