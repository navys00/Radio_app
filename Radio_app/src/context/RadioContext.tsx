import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { allFrequencies, getStationByFrequency } from '@/src/data/radioData';
import { loadRadioState, saveFrequency, saveYear } from '@/src/utils/storage';
import { setupPlayer, switchFrequency, togglePlayPause, stopPlayback } from '@/src/services/player';
import type { RadioYear, Station } from '@/src/types/radio';

type RadioContextValue = {
  frequency: number;
  year: RadioYear;
  station: Station | undefined;
  isPlaying: boolean;
  setFrequency: (value: number) => Promise<void>;
  setYear: (value: RadioYear) => Promise<void>;
  onTogglePlay: () => Promise<void>;
  onStop: () => Promise<void>;
};

const DEFAULT_FREQUENCY = allFrequencies[0] ?? 530;
const DEFAULT_YEAR: RadioYear = '1941';

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [frequency, setFrequencyState] = useState<number>(DEFAULT_FREQUENCY);
  const [year, setYearState] = useState<RadioYear>(DEFAULT_YEAR);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await setupPlayer();
      const restored = await loadRadioState(DEFAULT_FREQUENCY, DEFAULT_YEAR);
      if (!mounted) return;

      setFrequencyState(restored.frequency);
      setYearState(restored.year);
      setIsHydrated(true);
      await switchFrequency(restored.frequency, restored.year);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setFrequency = useCallback(async (value: number) => {
    setFrequencyState(value);
    await saveFrequency(value);
    if (isHydrated) {
      await switchFrequency(value, year);
    }
  }, [isHydrated, year]);

  const setYear = useCallback(async (value: RadioYear) => {
    setYearState(value);
    await saveYear(value);
    if (isHydrated) {
      await switchFrequency(frequency, value);
    }
  }, [frequency, isHydrated]);

  const onTogglePlay = async () => {
    await togglePlayPause();
    setIsPlaying((prev) => !prev);
  };

  const onStop = async () => {
    await stopPlayback();
    setIsPlaying(false);
  };

  const value = useMemo<RadioContextValue>(
    () => ({
      frequency,
      year,
      station: getStationByFrequency(frequency),
      isPlaying,
      setFrequency,
      setYear,
      onTogglePlay,
      onStop,
    }),
    [frequency, year, isPlaying, setFrequency, setYear],
  );

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio must be used inside RadioProvider');
  }
  return context;
}
