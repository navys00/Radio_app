/** Год в данных станции — только для группировки треков в JSON; в UI не выбирается. */
export type RadioYear = '1941' | '1942' | '1943' | '1944' | '1945';

/** Уровень громкости UI / хранилища: 0–100. */
export type VolumeLevel = number;

export type StationTrack = {
  file: string;
  title: string;
};

export type Station = {
  id: string;
  city: string;
  frequency: number;
  /** Треки по годам в источнике; воспроизведение объединяет все годы подряд. */
  years: Record<RadioYear, StationTrack[]>;
};

export type StationsConfig = {
  stations: Station[];
};
