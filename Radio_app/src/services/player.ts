import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  State,
  type Track,
} from 'react-native-track-player';
import { getStationByFrequency, getStationById } from '@/src/data/radioData';
import { resolveAndroidRawResource, STATIC_NOISE_FILE, validateAudioMap } from '@/src/assets/audioMap';
import type { RadioYear } from '@/src/types/radio';

const SWITCH_NOISE_MS = 700;
let initialized = false;
let switchCounter = 0;

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

export async function playStation(stationId: string, year: RadioYear): Promise<void> {
  const targetStation = getStationById(stationId);
  if (!targetStation) return;

  const tracks = targetStation.years[year] ?? [];
  if (tracks.length === 0) {
    await playNoise('Пусто', 'Шум');
    return;
  }

  await TrackPlayer.reset();
  await TrackPlayer.add(tracks.map((track) => toTrack(track.file, 'Радио ЭФИР', `${targetStation.city} ${targetStation.frequency} кГц`)));
  await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  await TrackPlayer.play();
}

export async function playStationByFrequency(frequency: number, year: RadioYear): Promise<void> {
  const station = getStationByFrequency(frequency);
  if (!station) {
    await playNoise('Пусто', `${frequency} кГц`);
    return;
  }

  const tracks = station.years[year] ?? [];
  if (tracks.length === 0) {
    await playNoise('Пусто', `${frequency} кГц`);
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
  await TrackPlayer.reset();
  await TrackPlayer.add([toTrack(STATIC_NOISE_FILE, 'Радио ЭФИР', `${city} ${frequencyText}`.trim())]);
  await TrackPlayer.setRepeatMode(RepeatMode.Track);
  await TrackPlayer.play();
}

export async function switchFrequency(frequency: number, year: RadioYear): Promise<void> {
  const currentSwitch = ++switchCounter;
  await TrackPlayer.stop();
  await playNoise('Пусто', `${frequency} кГц`);
  await delay(SWITCH_NOISE_MS);
  if (currentSwitch !== switchCounter) return;
  await playStationByFrequency(frequency, year);
}

export async function togglePlayPause(): Promise<void> {
  const state = await TrackPlayer.getPlaybackState();
  if (state.state === State.Playing) {
    await TrackPlayer.pause();
    return;
  }
  await TrackPlayer.play();
}

export async function stopPlayback(): Promise<void> {
  await TrackPlayer.stop();
}

export function registerPlaybackService(): void {
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
