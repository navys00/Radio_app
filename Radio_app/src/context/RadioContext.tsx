import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { State, usePlaybackState } from 'react-native-track-player';
import { clampFrequencyKhz, DEFAULT_RADIO_YEAR, FREQUENCY_RANGE } from '@/src/data/radioData';
import type { RadioYear, VolumeLevel } from '@/src/types/radio';
import { loadRadioState, saveFrequency, saveRadioYear, saveVolume } from '@/src/utils/storage';
import {
  setupPlayer,
  setPlaybackVolume,
  switchFrequency,
  togglePlayPause,
  stopPlayback,
} from '@/src/services/player';

type RadioContextValue = {
  frequency: number;
  volume: VolumeLevel;
  year: RadioYear;
  isPlaying: boolean;
  setFrequency: (value: number) => Promise<void>;
  setVolume: (value: VolumeLevel) => Promise<void>;
  setYear: (value: RadioYear) => Promise<void>;
  onTogglePlay: () => Promise<void>;
  onStop: () => Promise<void>;
};

const DEFAULT_FREQUENCY = Math.round((FREQUENCY_RANGE.min + FREQUENCY_RANGE.max) / 2);
const DEFAULT_VOLUME: VolumeLevel = 82;

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [frequency, setFrequencyState] = useState<number>(DEFAULT_FREQUENCY);
  const [volume, setVolumeState] = useState<VolumeLevel>(DEFAULT_VOLUME);
  const [year, setYearState] = useState<RadioYear>(DEFAULT_RADIO_YEAR);
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
      const restored = await loadRadioState(DEFAULT_FREQUENCY, DEFAULT_VOLUME, DEFAULT_RADIO_YEAR);
      if (!mounted) return;

      const f = clampFrequencyKhz(restored.frequency);
      const v = restored.volume;
      const y = restored.year;
      setFrequencyState(f);
      setVolumeState(v);
      setYearState(y);
      setIsHydrated(true);
      await setPlaybackVolume(v / 100);
      await switchFrequency(f, y);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setFrequency = useCallback(async (value: number) => {
    const next = clampFrequencyKhz(value);
    setFrequencyState(next);
    await saveFrequency(next);
    if (isHydrated) {
      await switchFrequency(next, year);
    }
  }, [isHydrated, year]);

  const setVolume = useCallback(async (value: VolumeLevel) => {
    const next = Math.max(0, Math.min(100, Math.round(value)));
    setVolumeState(next);
    await saveVolume(next);
    if (isHydrated) {
      await setPlaybackVolume(next / 100);
    }
  }, [isHydrated]);

  const setYear = useCallback(async (value: RadioYear) => {
    setYearState(value);
    await saveRadioYear(value);
    if (isHydrated) {
      await switchFrequency(frequency, value, { force: true });
    }
  }, [isHydrated, frequency]);

  const onTogglePlay = useCallback(async () => {
    await togglePlayPause(frequency, year);
  }, [frequency, year]);

  const onStop = useCallback(async () => {
    await stopPlayback();
  }, []);

  const value = useMemo<RadioContextValue>(
    () => ({
      frequency,
      volume,
      year,
      isPlaying,
      setFrequency,
      setVolume,
      setYear,
      onTogglePlay,
      onStop,
    }),
    [frequency, volume, year, isPlaying, setFrequency, setVolume, setYear, onTogglePlay, onStop],
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
