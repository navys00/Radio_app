import { getAudioModule, isBundledAudioId } from './audioMap';
import { parseUserPlaybackId } from '../types';
import type { UserTrack } from '../types';

export type PlaybackSource =
  | { kind: 'bundled'; module: number }
  | { kind: 'uri'; uri: string };

export function resolvePlaybackSource(
  trackId: string,
  userTracksById: Map<string, UserTrack>
): PlaybackSource | null {
  const userId = parseUserPlaybackId(trackId);
  if (userId) {
    const track = userTracksById.get(userId);
    if (!track?.fileUri) return null;
    return { kind: 'uri', uri: track.fileUri };
  }
  if (!isBundledAudioId(trackId)) return null;
  const mod = getAudioModule(trackId);
  if (mod === undefined) return null;
  return { kind: 'bundled', module: mod };
}
