import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { State, usePlaybackState } from 'react-native-track-player';
import { clampFrequencyKhz, FREQUENCY_RANGE } from '@/src/data/radioData';
import { loadRadioState, saveFrequency, saveVolume } from '@/src/utils/storage';
import {
  setupPlayer,
  setPlaybackVolume,
  switchFrequency,
  togglePlayPause,
  stopPlayback,
} from '@/src/services/player';
import type { VolumeLevel } from '@/src/types/radio';

type RadioContextValue = {
  frequency: number;
  volume: VolumeLevel;
  isPlaying: boolean;
  setFrequency: (value: number) => Promise<void>;
  setVolume: (value: VolumeLevel) => Promise<void>;
  onTogglePlay: () => Promise<void>;
  onStop: () => Promise<void>;
};

const DEFAULT_FREQUENCY = Math.round((FREQUENCY_RANGE.min + FREQUENCY_RANGE.max) / 2);
const DEFAULT_VOLUME: VolumeLevel = 82;

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [frequency, setFrequencyState] = useState<number>(DEFAULT_FREQUENCY);
  const [volume, setVolumeState] = useState<VolumeLevel>(DEFAULT_VOLUME);
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
      const restored = await loadRadioState(DEFAULT_FREQUENCY, DEFAULT_VOLUME);
      if (!mounted) return;

      const f = clampFrequencyKhz(restored.frequency);
      const v = restored.volume;
      setFrequencyState(f);
      setVolumeState(v);
      setIsHydrated(true);
      await setPlaybackVolume(v / 100);
      await switchFrequency(f);
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
      await switchFrequency(next);
    }
  }, [isHydrated]);

  const setVolume = useCallback(async (value: VolumeLevel) => {
    const next = Math.max(0, Math.min(100, Math.round(value)));
    setVolumeState(next);
    await saveVolume(next);
    if (isHydrated) {
      await setPlaybackVolume(next / 100);
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
      volume,
      isPlaying,
      setFrequency,
      setVolume,
      onTogglePlay,
      onStop,
    }),
    [frequency, volume, isPlaying, setFrequency, setVolume, onTogglePlay, onStop],
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
