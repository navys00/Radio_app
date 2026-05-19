import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useResponsiveLayout } from './useResponsiveLayout';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export type PlaylistLayout = {
  contentMaxW: number;
  horizontalPad: number;
  playlistTitleSize: number;
  playerBarPad: number;
  playerTitleSize: number;
  playerMetaSize: number;
  vinylSize: number;
  sectionTitleSize: number;
  trackTitleSize: number;
  trackMetaSize: number;
  trackCoverSize: number;
  modeBtnPadV: number;
  modeBtnFont: number;
  searchPadV: number;
  searchFont: number;
  addVinylSize: number;
  listGap: number;
  bottomInset: number;
};

export function usePlaylistLayout(): PlaylistLayout {
  const { screenW, screenH, cardW } = useResponsiveLayout();

  return useMemo(() => {
    const narrow = screenW < 360;
    const short = screenH < 640;

    return {
      contentMaxW: cardW,
      horizontalPad: clamp(screenW * 0.03, 10, 16),
      playlistTitleSize: clamp(screenH * 0.042, 28, 44),
      playerBarPad: clamp(screenH * 0.018, 12, 16),
      playerTitleSize: clamp(screenH * 0.028, 18, 24),
      playerMetaSize: clamp(screenH * 0.018, 12, 15),
      vinylSize: clamp(screenW * 0.18, 56, 78),
      sectionTitleSize: clamp(screenH * 0.032, 20, 26),
      trackTitleSize: clamp(screenH * 0.024, 15, 19),
      trackMetaSize: clamp(screenH * 0.017, 11, 14),
      trackCoverSize: clamp(screenW * 0.16, 56, 72),
      modeBtnPadV: clamp(screenH * 0.014, 10, 14),
      modeBtnFont: narrow ? 12 : 13,
      searchPadV: clamp(screenH * 0.014, 10, 14),
      searchFont: clamp(screenH * 0.02, 14, 16),
      addVinylSize: clamp(screenW * 0.2, 72, 88),
      listGap: short ? 10 : 12,
      bottomInset: clamp(screenH * 0.02, 12, 24),
    };
  }, [screenW, screenH, cardW]);
}
