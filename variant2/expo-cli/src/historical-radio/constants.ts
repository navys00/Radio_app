export const DEFAULT_WAVE_ROTATION = -40;
export const DEFAULT_VOLUME_ROTATION = 30;

export const KNOB_ROT_MIN = -140;
export const KNOB_ROT_MAX = 140;

/** Доля угла жеста, попадающая в ручку (< 1 — меньше чувствительность). */
export const KNOB_ANGLE_SENSITIVITY = 0.38;

export const SCALE_MARK_KHZ = [150, 300, 600, 1000, 1400] as const;

export const MILITARY_BLOCKS = ['СССР', 'ОСЬ', 'Союзники'] as const;
export const GAME_YEARS = ['1941', '1942', '1943', '1944', '1945'] as const;
