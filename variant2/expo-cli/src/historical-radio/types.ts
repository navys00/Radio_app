export type MilitaryBlock = 'СССР' | 'ОСЬ' | 'Союзники';

export type Station = {
  city: string;
  /** Подпись на карточке для выбранного года (исторический контекст). */
  cityByYear?: Partial<Record<string, string>>;
  freq: string;
  /** Числовая частота для привязки ручки «Волна» к шкале 150–1400 кГц */
  khz: number;
  /** Годы, в которые станция «в эфире» для текущего сценария */
  years: string[];
  /**
   * Порядок id из `audioCatalog.json`: первый трек, подходящий под выбранный год
   * (речь — только в год выхода, музыка — с года выпуска по 1945), играет в эфире.
   */
  playlist: string[];
  /** Скрытая станция: не в списке карточек, без отметки на шкале; эфир из `secret/`. */
  secret?: boolean;
};

export type StationsByBlock = Record<MilitaryBlock, Station[]>;

export type AppMode = 'festival' | 'manual';

export type AudioTrackKind = 'speech' | 'music';

/** Пользовательский трек (локальный файл + метаданные для эфира). */
export type UserTrack = {
  id: string;
  title: string;
  block: MilitaryBlock;
  /** Годы сценария, в которые трек доступен в эфире */
  years: string[];
  kind: AudioTrackKind;
  releaseYear: number;
  fileUri: string;
  createdAt: number;
};

export const USER_TRACK_ID_PREFIX = 'user:';

export function toUserPlaybackId(trackId: string): string {
  return `${USER_TRACK_ID_PREFIX}${trackId}`;
}

export function parseUserPlaybackId(playbackId: string): string | null {
  return playbackId.startsWith(USER_TRACK_ID_PREFIX)
    ? playbackId.slice(USER_TRACK_ID_PREFIX.length)
    : null;
}

