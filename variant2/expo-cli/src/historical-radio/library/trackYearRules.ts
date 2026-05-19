import type { AudioTrackKind } from '../types';

const GAME_YEAR_MIN = 1941;
const GAME_YEAR_MAX = 1945;

export function isTrackValidForGameYear(
  kind: AudioTrackKind,
  releaseYear: number,
  gameYear: number
): boolean {
  if (gameYear < GAME_YEAR_MIN || gameYear > GAME_YEAR_MAX) return false;
  if (kind === 'speech') return releaseYear === gameYear;
  return gameYear >= releaseYear && gameYear <= GAME_YEAR_MAX;
}
