import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  State,
  type Track,
} from 'react-native-track-player';
import { Platform } from 'react-native';
import {
  clampFrequencyKhz,
  getAllTracksForStation,
  getStationById,
  resolveStationForFrequency,
} from '@/src/data/radioData';
import { resolveAndroidRawResource, STATIC_NOISE_FILE, validateAudioMap } from '@/src/assets/audioMap';

const SWITCH_NOISE_MS = 800;
let initialized = false;
let switchCounter = 0;
let lastPlaybackTargetKey: string | null = null;
const isTrackPlayerSupported = Platform.OS === 'android';

function playbackTargetKey(frequencyKhz: number): string {
  const s = resolveStationForFrequency(frequencyKhz);
  return s?.id ?? '__noise__';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toTrack(id: string, title: string, artist: string): Track {
  return {
    id,
    title,
    artist,
    url: resolveAndroidRawResource(id),
  };
}

export async function setupPlayer(): Promise<void> {
  if (initialized) return;
  if (!isTrackPlayerSupported) {
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
  if (!isTrackPlayerSupported) return;
  const v = Math.max(0, Math.min(1, volume01));
  await TrackPlayer.setVolume(v);
}

export async function playStation(stationId: string): Promise<void> {
  if (!isTrackPlayerSupported) return;
  const targetStation = getStationById(stationId);
  if (!targetStation) return;

  const tracks = getAllTracksForStation(targetStation);
  if (tracks.length === 0) {
    await playNoise('Пусто', 'Шум');
    return;
  }

  await TrackPlayer.reset();
  await TrackPlayer.add(tracks.map((track) => toTrack(track.file, 'Радио ЭФИР', `${targetStation.city} ${targetStation.frequency} кГц`)));
  await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  await TrackPlayer.play();
}

export async function playStationByFrequency(frequency: number): Promise<void> {
  if (!isTrackPlayerSupported) return;
  const freq = clampFrequencyKhz(frequency);
  const station = resolveStationForFrequency(freq);
  if (!station) {
    await playNoise('Пусто', `${freq} кГц`);
    return;
  }

  const tracks = getAllTracksForStation(station);
  if (tracks.length === 0) {
    await playNoise('Пусто', `${freq} кГц`);
    return;
  }

  await TrackPlayer.reset();
  await TrackPlayer.add(
    tracks.map((track, index) =>
      toTrack(track.file, `Радио ЭФИР ${index + 1}`, `${station.city} ${station.frequency} кГц`),
    ),
  );
  await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  await TrackPlayer.play();
}

export async function playNoise(city = 'Пусто', frequencyText = ''): Promise<void> {
  if (!isTrackPlayerSupported) return;
  await TrackPlayer.reset();
  await TrackPlayer.add([toTrack(STATIC_NOISE_FILE, 'Радио ЭФИР', `${city} ${frequencyText}`.trim())]);
  await TrackPlayer.setRepeatMode(RepeatMode.Track);
  await TrackPlayer.play();
}

export async function switchFrequency(frequency: number): Promise<void> {
  if (!isTrackPlayerSupported) return;
  const freq = clampFrequencyKhz(frequency);
  const nextKey = playbackTargetKey(freq);
  if (lastPlaybackTargetKey !== null && nextKey === lastPlaybackTargetKey) {
    return;
  }
  lastPlaybackTargetKey = nextKey;

  const currentSwitch = ++switchCounter;
  await TrackPlayer.stop();
  await playNoise('Пусто', `${freq} кГц`);
  await delay(SWITCH_NOISE_MS);
  if (currentSwitch !== switchCounter) return;
  await playStationByFrequency(freq);
}

export async function togglePlayPause(): Promise<void> {
  if (!isTrackPlayerSupported) return;
  const state = await TrackPlayer.getPlaybackState();
  if (state.state === State.Playing) {
    await TrackPlayer.pause();
    return;
  }
  await TrackPlayer.play();
}

export async function stopPlayback(): Promise<void> {
  if (!isTrackPlayerSupported) return;
  await TrackPlayer.stop();
}

export function registerPlaybackService(): void {
  if (!isTrackPlayerSupported) return;
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
