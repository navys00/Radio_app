import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  State,
  type Track,
} from 'react-native-track-player';
import {
  clampFrequencyKhz,
  getStationById,
  getTracksForOffSlotYear,
  getTracksForStationYear,
  resolveTunedSource,
  type OffSlotHysteresisState,
  type TunedSource,
} from '@/src/data/radioData';
import type { RadioYear, StationTrack } from '@/src/types/radio';
import {
  isNativeAudioPlaybackSupported,
  resolvePlaybackUrl,
  STATIC_NOISE_FILE,
  validateAudioMap,
} from '@/src/assets/audioMap';

const SWITCH_NOISE_MS = 800;
let initialized = false;
let switchCounter = 0;
let lastPlaybackTargetKey: string | null = null;
let offSlotPlaybackState: OffSlotHysteresisState = { slotId: null };

function playbackKeyFromSource(source: TunedSource, frequencyKhz: number, year: RadioYear): string {
  const f = clampFrequencyKhz(frequencyKhz);
  if (source.kind === 'station') {
    return `st:${source.station.id}:y:${year}`;
  }
  if (source.kind === 'off') {
    return `off:${source.slot.id}:y:${year}`;
  }
  return `noise:${f}:y:${year}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toTrack(id: string, title: string, artist: string): Track {
  return {
    id,
    title,
    artist,
    url: resolvePlaybackUrl(id),
  };
}

export async function setupPlayer(): Promise<void> {
  if (initialized) return;
  if (!isNativeAudioPlaybackSupported()) {
    initialized = true;
    return;
  }

  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Pause],
    notificationCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
  });

  if (__DEV__) {
    validateAudioMap();
  }

  initialized = true;
}

export async function setPlaybackVolume(volume01: number): Promise<void> {
  if (!isNativeAudioPlaybackSupported()) return;
  const v = Math.max(0, Math.min(1, volume01));
  await TrackPlayer.setVolume(v);
}

function tracksForSource(source: TunedSource, year: RadioYear): StationTrack[] {
  if (source.kind === 'station') {
    return getTracksForStationYear(source.station, year);
  }
  if (source.kind === 'off') {
    return getTracksForOffSlotYear(source.slot, year);
  }
  return [];
}

export async function playStation(stationId: string, year: RadioYear): Promise<void> {
  if (!isNativeAudioPlaybackSupported()) return;
  const targetStation = getStationById(stationId);
  if (!targetStation) return;

  const tracks = getTracksForStationYear(targetStation, year);
  if (tracks.length === 0) {
    await playNoise('Пусто', `${targetStation.city} · ${year}`, year);
    return;
  }

  await TrackPlayer.reset();
  await TrackPlayer.add(
    tracks.map((track) =>
      toTrack(track.file, `Радио ЭФИР · ${year}`, `${targetStation.city} ${targetStation.frequency} кГц`),
    ),
  );
  await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  await TrackPlayer.play();
}

export async function playSourceAtFrequency(frequency: number, year: RadioYear, source: TunedSource): Promise<void> {
  if (!isNativeAudioPlaybackSupported()) return;
  const freq = clampFrequencyKhz(frequency);

  if (source.kind === 'noise') {
    await playNoise('Пусто', `${freq} кГц · ${year}`, year);
    return;
  }

  const tracks = tracksForSource(source, year);
  if (tracks.length === 0) {
    const label =
      source.kind === 'station'
        ? `${source.station.city} · ${year}`
        : `${source.slot.id} · ${year}`;
    await playNoise('Пусто', label, year);
    return;
  }

  const meta =
    source.kind === 'station'
      ? `${source.station.city} ${source.station.frequency} кГц`
      : `Слот ${source.slot.minKhz}–${source.slot.maxKhz} кГц`;

  await TrackPlayer.reset();
  await TrackPlayer.add(
    tracks.map((track, index) =>
      toTrack(track.file, `Радио ЭФИР · ${year} ${index + 1}`, meta),
    ),
  );
  await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  await TrackPlayer.play();
}

export async function playNoise(city = 'Пусто', frequencyText = '', year?: RadioYear): Promise<void> {
  if (!isNativeAudioPlaybackSupported()) return;
  const y = year ? ` · ${year}` : '';
  await TrackPlayer.reset();
  await TrackPlayer.add([toTrack(STATIC_NOISE_FILE, 'Радио ЭФИР', `${city} ${frequencyText}${y}`.trim())]);
  await TrackPlayer.setRepeatMode(RepeatMode.Track);
  await TrackPlayer.play();
}

export async function switchFrequency(
  frequency: number,
  year: RadioYear,
  opts?: { force?: boolean },
): Promise<void> {
  if (!isNativeAudioPlaybackSupported()) return;
  const freq = clampFrequencyKhz(frequency);
  const { source, nextOffState } = resolveTunedSource(freq, offSlotPlaybackState);
  const nextKey = playbackKeyFromSource(source, freq, year);
  if (!opts?.force && lastPlaybackTargetKey !== null && nextKey === lastPlaybackTargetKey) {
    return;
  }
  lastPlaybackTargetKey = nextKey;
  offSlotPlaybackState = nextOffState;

  const currentSwitch = ++switchCounter;
  await TrackPlayer.stop();
  await playNoise('Пусто', `${freq} кГц`, year);
  await delay(SWITCH_NOISE_MS);
  if (currentSwitch !== switchCounter) return;
  await playSourceAtFrequency(freq, year, source);
}

export async function togglePlayPause(frequency: number, year: RadioYear): Promise<void> {
  if (!isNativeAudioPlaybackSupported()) return;
  const { state } = await TrackPlayer.getPlaybackState();
  if (state === State.Stopped || state === State.None) {
    await switchFrequency(frequency, year, { force: true });
    return;
  }
  if (state === State.Playing) {
    await TrackPlayer.pause();
    return;
  }
  await TrackPlayer.play();
}

export async function stopPlayback(): Promise<void> {
  if (!isNativeAudioPlaybackSupported()) return;
  await TrackPlayer.reset();
  lastPlaybackTargetKey = null;
}

export function registerPlaybackService(): void {
  if (!isNativeAudioPlaybackSupported()) return;
  TrackPlayer.registerPlaybackService(() => async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
      await TrackPlayer.play();
    });
    TrackPlayer.addEventListener(Event.RemotePause, async () => {
      await TrackPlayer.pause();
    });
    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
      await TrackPlayer.stop();
    });
  });
}
