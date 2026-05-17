import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export type ResponsiveLayout = {
  screenW: number;
  screenH: number;
  cardW: number;
  titleFontSize: number;
  knobSize: number;
  yearBtnHeight: number;
  blockBtnPaddingV: number;
  panelGap: number;
  sectionGap: number;
  stationFontSize: number;
};

export function useResponsiveLayout(): ResponsiveLayout {
  const { width: screenW, height: screenH } = useWindowDimensions();

  return useMemo(() => {
    const cardW = Math.min(screenW - 20, 400);
    const h = screenH;

    return {
      screenW,
      screenH: h,
      cardW,
      titleFontSize: clamp(h * 0.038, 24, 38),
      knobSize: clamp(Math.min(cardW * 0.26, h * 0.115), 76, 118),
      yearBtnHeight: clamp(h * 0.048, 34, 48),
      blockBtnPaddingV: clamp(h * 0.012, 7, 12),
      panelGap: clamp(h * 0.006, 4, 8),
      sectionGap: clamp(h * 0.014, 8, 14),
      stationFontSize: clamp(h * 0.017, 12, 16),
    };
  }, [screenW, screenH]);
}
