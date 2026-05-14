import catalogJson from '../data/audioCatalog.json';

export type AudioTrackKind = 'speech' | 'music';

export type AudioCatalogEntry = {
  id: string;
  kind: AudioTrackKind;
  releaseYear: number;
};

type AudioCatalogFile = { tracks: AudioCatalogEntry[] };

const GAME_YEAR_MIN = 1941;
const GAME_YEAR_MAX = 1945;

const catalog = catalogJson as AudioCatalogFile;

const byId = new Map<string, AudioCatalogEntry>(
  catalog.tracks.map((t) => [t.id, t])
);

export function getCatalogEntry(id: string): AudioCatalogEntry | undefined {
  return byId.get(id);
}

/**
 * Речь — только в releaseYear.
 * Музыка — с года выпуска по 1945 (включительно).
 */
export function isTrackValidForGameYear(entry: AudioCatalogEntry, gameYear: number): boolean {
  if (gameYear < GAME_YEAR_MIN || gameYear > GAME_YEAR_MAX) return false;
  if (entry.kind === 'speech') {
    return entry.releaseYear === gameYear;
  }
  return gameYear >= entry.releaseYear && gameYear <= GAME_YEAR_MAX;
}

/**
 * Первый трек из плейлиста станции, подходящий под выбранный год сценария.
 */
export function resolvePlaybackTrackId(playlist: string[], selectedYear: string): string | null {
  const y = Number.parseInt(selectedYear, 10);
  if (!Number.isFinite(y)) return null;
  for (const trackId of playlist) {
    const entry = byId.get(trackId);
    if (!entry) continue;
    if (isTrackValidForGameYear(entry, y)) return trackId;
  }
  return null;
}
