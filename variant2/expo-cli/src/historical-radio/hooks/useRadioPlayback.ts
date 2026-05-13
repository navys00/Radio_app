import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import type { Station } from '../types';
import { getAudioModule, NOISE_LOOP_AUDIO_ID } from '../audio/audioMap';

/** Громкость 0…1 по углу ручки (-140 мин., +140 макс.). */
function volumeFromKnobDeg(deg: number): number {
  return Math.max(0, Math.min(1, (deg + 140) / 280));
}

function playbackKey(station: Station | null): string {
  if (station === null) return '__noise__';
  return `${station.audioId}:${station.khz}:${station.city}`;
}

/**
 * Эфир: зацикленный трек станции при «захвате» частоты, иначе — радиошум.
 * При `powerOn === false` звук полностью выгружается. При громкости 0 — `isMuted`.
 */
export function useRadioPlayback({
  capturedStation,
  volumeRotation,
  powerOn,
}: {
  capturedStation: Station | null;
  volumeRotation: number;
  powerOn: boolean;
}): void {
  const soundRef = useRef<Audio.Sound | null>(null);
  const captureKey = playbackKey(capturedStation);

  useEffect(() => {
    const mode =
      Platform.OS === 'web'
        ? {
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
          }
        : {
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          };
    void Audio.setAudioModeAsync(mode).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function swapTrack(): Promise<void> {
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {
          /* ignore */
        }
        soundRef.current = null;
      }

      if (!powerOn) {
        return;
      }

      const id =
        capturedStation === null ? NOISE_LOOP_AUDIO_ID : capturedStation.audioId;
      const mod = getAudioModule(id);
      if (!mod) {
        console.warn(`[useRadioPlayback] missing module for id "${id}"`);
        return;
      }

      const initialVol = volumeFromKnobDeg(volumeRotation);
      const muted = initialVol === 0;
      const { sound } = await Audio.Sound.createAsync(
        mod,
        {
          isLooping: true,
          volume: muted ? 0 : initialVol,
          shouldPlay: true,
          isMuted: muted,
        },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded && 'error' in status && status.error) {
            console.warn('[useRadioPlayback]', status.error);
          }
        },
        Platform.OS !== 'web'
      );

      if (cancelled) {
        try {
          await sound.unloadAsync();
        } catch {
          /* ignore */
        }
        return;
      }

      soundRef.current = sound;
      try {
        await sound.playAsync();
      } catch (e) {
        console.warn('[useRadioPlayback] playAsync', e);
      }
    }

    void swapTrack();

    return () => {
      cancelled = true;
      const s = soundRef.current;
      soundRef.current = null;
      if (s) {
        void s.unloadAsync().catch(() => {});
      }
    };
  }, [captureKey, powerOn]);

  useEffect(() => {
    if (!powerOn) return;
    const s = soundRef.current;
    if (!s) return;
    const v = volumeFromKnobDeg(volumeRotation);
    const muted = v === 0;
    void (async () => {
      try {
        await s.setVolumeAsync(muted ? 0 : v);
        await s.setIsMutedAsync(muted);
      } catch {
        /* ignore */
      }
    })();
  }, [volumeRotation, powerOn]);
}
