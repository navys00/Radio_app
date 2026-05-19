export type CaptureLeadIn = null | 'hiss' | 'tuning';

/** Обычная станция: с равной вероятностью hiss, tuning или без вступления. Секретная — всегда hiss или tuning. */
export function rollCaptureLeadIn(isSecret: boolean): CaptureLeadIn {
  const r = Math.random();
  if (isSecret) {
    return r < 0.5 ? 'hiss' : 'tuning';
  }
  if (r < 1 / 3) return 'hiss';
  if (r < 2 / 3) return 'tuning';
  return null;
}
