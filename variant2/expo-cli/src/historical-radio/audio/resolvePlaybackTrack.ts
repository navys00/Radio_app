import catalogJson from '../data/audioCatalog.json';
import { isUserTrackOnAirForYear } from '../library/assignStations';
import { isTrackValidForGameYear as isValidForYear } from '../library/trackYearRules';
import { parseUserPlaybackId } from '../types';
import type { AudioTrackKind, UserTrack } from '../types';

export type { AudioTrackKind };

export type AudioCatalogEntry = {
  id: string;
  kind: AudioTrackKind;
  releaseYear: number;
};

type AudioCatalogFile = { tracks: AudioCatalogEntry[] };

const catalog = catalogJson as AudioCatalogFile;

const byId = new Map<string, AudioCatalogEntry>(
  catalog.tracks.map((t) => [t.id, t])
);

export function getCatalogEntry(id: string): AudioCatalogEntry | undefined {
  return byId.get(id);
}

export function isTrackValidForGameYear(entry: AudioCatalogEntry, gameYear: number): boolean {
  return isValidForYear(entry.kind, entry.releaseYear, gameYear);
}

function isPlaylistIdValidForYear(
  trackId: string,
  y: number,
  userTracksById: Map<string, UserTrack>
): boolean {
  const userId = parseUserPlaybackId(trackId);
  if (userId) {
    const t = userTracksById.get(userId);
    if (!t) return false;
    return isUserTrackOnAirForYear(t, String(y));
  }
  const entry = byId.get(trackId);
  if (!entry) return false;
  return isTrackValidForGameYear(entry, y);
}

/**
 * Трек из плейлиста станции для выбранного года.
 * В ручном режиме — случайный из подходящих; в фестивальном — первый подходящий.
 */
export function resolvePlaybackTrackId(
  playlist: string[],
  selectedYear: string,
  options?: {
    userTracksById?: Map<string, UserTrack>;
    pickRandom?: boolean;
  }
): string | null {
  const y = Number.parseInt(selectedYear, 10);
  if (!Number.isFinite(y)) return null;
  const userMap = options?.userTracksById ?? new Map<string, UserTrack>();
  const valid = playlist.filter((id) => isPlaylistIdValidForYear(id, y, userMap));
  if (valid.length === 0) return null;
  if (options?.pickRandom) {
    return valid[Math.floor(Math.random() * valid.length)] ?? null;
  }
  return valid[0] ?? null;
}
