import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { State, usePlaybackState } from 'react-native-track-player';
import { allFrequencies, getStationByFrequency } from '@/src/data/radioData';
import { loadRadioState, saveFrequency } from '@/src/utils/storage';
import { setupPlayer, switchFrequency, togglePlayPause, stopPlayback } from '@/src/services/player';
import type { Station } from '@/src/types/radio';

type RadioContextValue = {
  frequency: number;
  station: Station | undefined;
  isPlaying: boolean;
  setFrequency: (value: number) => Promise<void>;
  onTogglePlay: () => Promise<void>;
  onStop: () => Promise<void>;
};

const DEFAULT_FREQUENCY = allFrequencies[0] ?? 530;

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [frequency, setFrequencyState] = useState<number>(DEFAULT_FREQUENCY);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const playback = usePlaybackState();

  useEffect(() => {
    const s = playback.state;
    if (s === undefined) return;
    setIsPlaying(s === State.Playing || s === State.Buffering);
  }, [playback.state]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await setupPlayer();
      const restored = await loadRadioState(DEFAULT_FREQUENCY);
      if (!mounted) return;

      setFrequencyState(restored.frequency);
      setIsHydrated(true);
      await switchFrequency(restored.frequency);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setFrequency = useCallback(async (value: number) => {
    setFrequencyState(value);
    await saveFrequency(value);
    if (isHydrated) {
      await switchFrequency(value);
    }
  }, [isHydrated]);

  const onTogglePlay = useCallback(async () => {
    await togglePlayPause();
  }, []);

  const onStop = useCallback(async () => {
    await stopPlayback();
  }, []);

  const value = useMemo<RadioContextValue>(
    () => ({
      frequency,
      station: getStationByFrequency(frequency),
      isPlaying,
      setFrequency,
      onTogglePlay,
      onStop,
    }),
    [frequency, isPlaying, setFrequency, onTogglePlay, onStop],
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
