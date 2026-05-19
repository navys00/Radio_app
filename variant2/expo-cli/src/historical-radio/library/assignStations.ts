import type { MilitaryBlock, Station, UserTrack } from '../types';
import { toUserPlaybackId } from '../types';
import { getStationTemplatesForBlockYear } from './stationTemplates';

/** Пользовательский трек в эфире, если выбранный год отмечен в «Годы эфира». */
export function isUserTrackOnAirForYear(track: UserTrack, selectedYear: string): boolean {
  return track.years.includes(selectedYear);
}

export function filterUserTracksForContext(
  tracks: UserTrack[],
  block: MilitaryBlock,
  selectedYear: string
): UserTrack[] {
  return tracks
    .filter((t) => t.block === block && isUserTrackOnAirForYear(t, selectedYear))
    .sort((a, b) => a.title.localeCompare(b.title, 'ru') || a.id.localeCompare(b.id));
}

/** Раскладывает треки по слотам станций (round-robin). */
export function assignUserTracksToStations(
  templates: Station[],
  userTracks: UserTrack[]
): Station[] {
  const ids = userTracks.map((t) => toUserPlaybackId(t.id));
  if (templates.length === 0) return [];
  if (ids.length === 0) {
    return templates.map((s) => ({ ...s, playlist: [] }));
  }
  return templates.map((station, stationIndex) => ({
    ...station,
    playlist: ids.filter((_, i) => i % templates.length === stationIndex),
  }));
}

export function buildManualStations(
  block: MilitaryBlock,
  selectedYear: string,
  allUserTracks: UserTrack[]
): Station[] {
  const templates = getStationTemplatesForBlockYear(block, selectedYear);
  const matching = filterUserTracksForContext(allUserTracks, block, selectedYear);
  return assignUserTracksToStations(templates, matching);
}
