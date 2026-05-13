import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { State, usePlaybackState } from 'react-native-track-player';
import {
  clampFrequencyKhz,
  DEFAULT_BROADCAST_BLOC,
  DEFAULT_RADIO_YEAR,
  FREQUENCY_RANGE,
  getVisibleStations,
  nearestStationFrequency,
  resolveStationForFrequency,
} from '@/src/data/radioData';
import type { BroadcastBloc, RadioYear, Station, VolumeLevel } from '@/src/types/radio';
import {
  loadRadioState,
  saveBroadcastBloc,
  saveFrequency,
  saveRadioYear,
  saveVolume,
} from '@/src/utils/storage';
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
  bloc: BroadcastBloc;
  isPlaying: boolean;
  visibleStations: Station[];
  setFrequency: (value: number) => Promise<void>;
  setVolume: (value: VolumeLevel) => Promise<void>;
  setYear: (value: RadioYear) => Promise<void>;
  setBloc: (value: BroadcastBloc) => Promise<void>;
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
  const [bloc, setBlocState] = useState<BroadcastBloc>(DEFAULT_BROADCAST_BLOC);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const playback = usePlaybackState();

  const visibleStations = useMemo(() => getVisibleStations(bloc, year), [bloc, year]);

  const skipSnapOnceAfterHydrate = useRef(true);
  const frequencyRef = useRef(frequency);
  frequencyRef.current = frequency;

  useEffect(() => {
    const s = playback.state;
    if (s === undefined) return;
    setIsPlaying(s === State.Playing || s === State.Buffering);
  }, [playback.state]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await setupPlayer();
      const restored = await loadRadioState(
        DEFAULT_FREQUENCY,
        DEFAULT_VOLUME,
        DEFAULT_RADIO_YEAR,
        DEFAULT_BROADCAST_BLOC,
      );
      if (!mounted) return;

      const f = clampFrequencyKhz(restored.frequency);
      const v = restored.volume;
      const y = restored.year;
      const b = restored.bloc;
      const vis = getVisibleStations(b, y);
      setFrequencyState(f);
      setVolumeState(v);
      setYearState(y);
      setBlocState(b);
      setIsHydrated(true);
      await setPlaybackVolume(v / 100);
      await switchFrequency(f, y, { visibleStations: vis, bloc: b });
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (skipSnapOnceAfterHydrate.current) {
      skipSnapOnceAfterHydrate.current = false;
      return;
    }
    const f = frequencyRef.current;
    const vis = getVisibleStations(bloc, year);
    const st = resolveStationForFrequency(f, vis);
    if (st) {
      void switchFrequency(f, year, { force: true, visibleStations: vis, bloc });
      return;
    }
    if (vis.length === 0) {
      void switchFrequency(f, year, { force: true, visibleStations: vis, bloc });
      return;
    }
    const nf = nearestStationFrequency(f, vis);
    void (async () => {
      setFrequencyState(nf);
      await saveFrequency(nf);
      await switchFrequency(nf, year, { force: true, visibleStations: vis, bloc });
    })();
  }, [bloc, year, isHydrated]);

  const setFrequency = useCallback(
    async (value: number) => {
      const next = clampFrequencyKhz(value);
      setFrequencyState(next);
      await saveFrequency(next);
      if (isHydrated) {
        const vis = getVisibleStations(bloc, year);
        await switchFrequency(next, year, { visibleStations: vis, bloc });
      }
    },
    [isHydrated, year, bloc],
  );

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
  }, []);

  const setBloc = useCallback(async (value: BroadcastBloc) => {
    setBlocState(value);
    await saveBroadcastBloc(value);
  }, []);

  const onTogglePlay = useCallback(async () => {
    await togglePlayPause(frequency, year, visibleStations, bloc);
  }, [frequency, year, visibleStations, bloc]);

  const onStop = useCallback(async () => {
    await stopPlayback();
  }, []);

  const value = useMemo<RadioContextValue>(
    () => ({
      frequency,
      volume,
      year,
      bloc,
      isPlaying,
      visibleStations,
      setFrequency,
      setVolume,
      setYear,
      setBloc,
      onTogglePlay,
      onStop,
    }),
    [
      frequency,
      volume,
      year,
      bloc,
      isPlaying,
      visibleStations,
      setFrequency,
      setVolume,
      setYear,
      setBloc,
      onTogglePlay,
      onStop,
    ],
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
