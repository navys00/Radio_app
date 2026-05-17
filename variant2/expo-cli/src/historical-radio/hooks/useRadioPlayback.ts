import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { getAudioModule } from '../audio/audioMap';
import { KNOB_ROT_MAX, KNOB_ROT_MIN } from '../constants';
import { volumeFromKnobDeg } from '../tuning';

/** Одноразовые вступления при захвате частоты (не зацикливать). */
const ONE_SHOT_NO_LOOP_IDS = new Set(['tuning_search_static', 'hiss_continuous']);

/** Длина клипа hiss при стинге — файл длинный, в эфир уводим по таймеру. */
const HISS_CAPTURE_STING_MAX_MS = 1200;

/**
 * Эфир по `playbackTrackId` (трек из audioMap или шум `receiver_interference`).
 * `playbackStreamKey` меняется при смене станции, года или выбранного трека — перезагрузка звука.
 * Для id из `ONE_SHOT_NO_LOOP_IDS` после окончания вызывается `onOneShotTrackFinished` (например переход к эфиру станции).
 * `tuning_search_static` звучит половину декларируемой длины файла; `hiss_continuous` — не дольше `HISS_CAPTURE_STING_MAX_MS`.
 */
export function useRadioPlayback({
  playbackStreamKey,
  playbackTrackId,
  volumeRotation,
  powerOn,
  onOneShotTrackFinished,
}: {
  playbackStreamKey: string;
  playbackTrackId: string;
  volumeRotation: number;
  powerOn: boolean;
  /** Вызывается один раз, когда одноразовый трек доиграл до конца. */
  onOneShotTrackFinished?: () => void;
}): void {
  const soundRef = useRef<Audio.Sound | null>(null);
  const onOneShotFinishedRef = useRef(onOneShotTrackFinished);
  onOneShotFinishedRef.current = onOneShotTrackFinished;

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
    let oneShotTimer: ReturnType<typeof setTimeout> | null = null;

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

      const id = playbackTrackId;
      const mod = getAudioModule(id);
      if (!mod) {
        console.warn(`[useRadioPlayback] missing module for id "${id}"`);
        return;
      }

      const initialVol = volumeFromKnobDeg(volumeRotation, KNOB_ROT_MIN, KNOB_ROT_MAX);
      const muted = initialVol === 0;
      const oneShot = ONE_SHOT_NO_LOOP_IDS.has(playbackTrackId);
      let oneShotEndReported = false;

      const scheduleTimedOneShotEnd = async (sound: Audio.Sound) => {
        const st = await sound.getStatusAsync();
        if (cancelled || !st.isLoaded || oneShotEndReported) return;
        const dur = st.durationMillis ?? 0;
        const waitMs =
          id === 'tuning_search_static'
            ? Math.max(80, dur > 0 ? Math.floor(dur / 2) : 400)
            : Math.max(80, Math.min(HISS_CAPTURE_STING_MAX_MS, dur > 0 ? dur : HISS_CAPTURE_STING_MAX_MS));
        oneShotTimer = setTimeout(() => {
          if (cancelled || oneShotEndReported) return;
          oneShotEndReported = true;
          oneShotTimer = null;
          onOneShotFinishedRef.current?.();
        }, waitMs);
      };

      const { sound } = await Audio.Sound.createAsync(
        mod,
        {
          isLooping: !oneShot,
          volume: muted ? 0 : initialVol,
          shouldPlay: true,
          isMuted: muted,
        },
        (status: AVPlaybackStatus) => {
          if (cancelled) return;
          if (!status.isLoaded && 'error' in status && status.error) {
            console.warn('[useRadioPlayback]', status.error);
          }
          if (
            oneShot &&
            id !== 'tuning_search_static' &&
            id !== 'hiss_continuous' &&
            status.isLoaded &&
            status.didJustFinish &&
            !oneShotEndReported
          ) {
            oneShotEndReported = true;
            onOneShotFinishedRef.current?.();
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
        if (oneShot && (id === 'tuning_search_static' || id === 'hiss_continuous')) {
          void scheduleTimedOneShotEnd(sound);
        }
      } catch (e) {
        console.warn('[useRadioPlayback] playAsync', e);
      }
    }

    void swapTrack();

    return () => {
      cancelled = true;
      if (oneShotTimer) {
        clearTimeout(oneShotTimer);
        oneShotTimer = null;
      }
      const s = soundRef.current;
      soundRef.current = null;
      if (s) {
        void s.unloadAsync().catch(() => {});
      }
    };
  }, [playbackStreamKey, powerOn, playbackTrackId]);

  useEffect(() => {
    if (!powerOn) return;
    const s = soundRef.current;
    if (!s) return;
    const v = volumeFromKnobDeg(volumeRotation, KNOB_ROT_MIN, KNOB_ROT_MAX);
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
