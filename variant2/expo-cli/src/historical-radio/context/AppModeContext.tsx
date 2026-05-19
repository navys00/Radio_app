import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { filterUserTracksForContext } from '../library/assignStations';
import {
  createUserTrackFromFile,
  deleteUserTrackFile,
  loadUserTracks,
  saveUserTracks,
  type NewUserTrackInput,
  type PickedAudio,
} from '../library/userLibrary';
import type { UserTrackEditInput } from '../components/playlist/EditTrackModal';
import type { AppMode, MilitaryBlock, UserTrack } from '../types';

function releaseYearFromYears(years: string[]): number {
  const nums = years.map((y) => Number.parseInt(y, 10)).filter((n) => Number.isFinite(n));
  return nums.length > 0 ? Math.min(...nums) : 1943;
}

const MODE_KEY = '@historical-radio/app-mode';

type AppModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  userTracks: UserTrack[];
  userTracksById: Map<string, UserTrack>;
  isLibraryReady: boolean;
  addTrackFromFile: (picked: PickedAudio, input: NewUserTrackInput) => Promise<UserTrack>;
  removeTrack: (id: string) => Promise<void>;
  updateTrack: (id: string, input: UserTrackEditInput) => Promise<void>;
  countTracksFor: (block: MilitaryBlock, year: string) => number;
  refreshLibrary: () => Promise<void>;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('festival');
  const [userTracks, setUserTracks] = useState<UserTrack[]>([]);
  const [isLibraryReady, setLibraryReady] = useState(false);

  const refreshLibrary = useCallback(async () => {
    const tracks = await loadUserTracks();
    setUserTracks(tracks);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const storedMode = await AsyncStorage.getItem(MODE_KEY);
        if (!cancelled && (storedMode === 'festival' || storedMode === 'manual')) {
          setModeState(storedMode);
        }
        const tracks = await loadUserTracks();
        if (!cancelled) setUserTracks(tracks);
      } finally {
        if (!cancelled) setLibraryReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback(async (next: AppMode) => {
    setModeState(next);
    await AsyncStorage.setItem(MODE_KEY, next);
  }, []);

  const persistTracks = useCallback(async (tracks: UserTrack[]) => {
    setUserTracks(tracks);
    await saveUserTracks(tracks);
  }, []);

  const addTrackFromFile = useCallback(async (picked: PickedAudio, input: NewUserTrackInput) => {
    const track = await createUserTrackFromFile(picked.uri, picked.name, input);
    setUserTracks((prev) => {
      const next = [...prev, track];
      void saveUserTracks(next);
      return next;
    });
    return track;
  }, []);

  const removeTrack = useCallback(
    async (id: string) => {
      const target = userTracks.find((t) => t.id === id);
      if (target) await deleteUserTrackFile(target.fileUri);
      await persistTracks(userTracks.filter((t) => t.id !== id));
    },
    [userTracks, persistTracks]
  );

  const updateTrack = useCallback(async (id: string, input: UserTrackEditInput) => {
    setUserTracks((prev) => {
      const next = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: input.title.trim() || t.title,
              block: input.block,
              years: input.years,
              kind: input.kind,
              releaseYear: releaseYearFromYears(input.years),
            }
          : t
      );
      void saveUserTracks(next);
      return next;
    });
  }, []);

  const userTracksById = useMemo(
    () => new Map(userTracks.map((t) => [t.id, t])),
    [userTracks]
  );

  const countTracksFor = useCallback(
    (block: MilitaryBlock, year: string) =>
      filterUserTracksForContext(userTracks, block, year).length,
    [userTracks]
  );

  const value = useMemo(
    () => ({
      mode,
      setMode,
      userTracks,
      userTracksById,
      isLibraryReady,
      addTrackFromFile,
      removeTrack,
      updateTrack,
      countTracksFor,
      refreshLibrary,
    }),
    [
      mode,
      setMode,
      userTracks,
      userTracksById,
      isLibraryReady,
      addTrackFromFile,
      removeTrack,
      updateTrack,
      countTracksFor,
      refreshLibrary,
    ]
  );

  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}

export function useAppMode(): AppModeContextValue {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider');
  return ctx;
}
