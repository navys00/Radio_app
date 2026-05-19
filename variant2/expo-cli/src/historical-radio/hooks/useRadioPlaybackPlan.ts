import { useEffect, useMemo } from 'react';
import { validateStationAudioReferences, NOISE_LOOP_AUDIO_ID } from '../audio/audioMap';
import { resolvePlaybackSource } from '../audio/playbackSource';
import { resolvePlaybackTrackId } from '../audio/resolvePlaybackTrack';
import type { CaptureLeadIn } from '../captureLeadIn';
import { useAppMode } from '../context/AppModeContext';
import { ALL_STATIONS_FLAT } from '../data/stationsData';
import type { Station } from '../types';
import { stationKey } from '../tuning';
import { useRadioPlayback } from './useRadioPlayback';

export function useRadioPlaybackPlan({
  nearestStation,
  selectedYear,
  captureLeadIn,
  volumeRotation,
  isRadioOn,
  onCaptureLeadInFinished,
}: {
  nearestStation: Station | null;
  selectedYear: string;
  captureLeadIn: CaptureLeadIn;
  volumeRotation: number;
  isRadioOn: boolean;
  onCaptureLeadInFinished: () => void;
}): void {
  const { mode, userTracksById } = useAppMode();

  useEffect(() => {
    if (__DEV__ && mode === 'festival') {
      validateStationAudioReferences(ALL_STATIONS_FLAT);
    }
  }, [mode]);

  const resolvedPlaybackId = useMemo(() => {
    if (!nearestStation) return NOISE_LOOP_AUDIO_ID;
    return (
      resolvePlaybackTrackId(nearestStation.playlist, selectedYear, {
        userTracksById,
        pickRandom: mode === 'manual',
      }) ?? NOISE_LOOP_AUDIO_ID
    );
  }, [nearestStation, selectedYear, userTracksById, mode]);

  const effectivePlaybackTrackId = useMemo(() => {
    if (!nearestStation) return NOISE_LOOP_AUDIO_ID;
    if (captureLeadIn === 'hiss') return 'hiss_continuous';
    if (captureLeadIn === 'tuning') return 'tuning_search_static';
    return resolvedPlaybackId;
  }, [nearestStation, captureLeadIn, resolvedPlaybackId]);

  const playbackSource = useMemo(() => {
    return resolvePlaybackSource(effectivePlaybackTrackId, userTracksById);
  }, [effectivePlaybackTrackId, userTracksById]);

  const playbackStreamKey = useMemo(() => {
    const stationPart = nearestStation ? stationKey(nearestStation) : 'off';
    const phase = !nearestStation
      ? 'noise'
      : captureLeadIn === 'hiss'
        ? 'sting_hiss'
        : captureLeadIn === 'tuning'
          ? 'sting_tune'
          : 'main';
    return `${mode}|${stationPart}|${selectedYear}|${phase}|${resolvedPlaybackId}`;
  }, [nearestStation, selectedYear, resolvedPlaybackId, captureLeadIn, mode]);

  useRadioPlayback({
    playbackStreamKey,
    playbackSource,
    playbackTrackId: effectivePlaybackTrackId,
    volumeRotation,
    powerOn: isRadioOn,
    onOneShotTrackFinished: onCaptureLeadInFinished,
  });
}
