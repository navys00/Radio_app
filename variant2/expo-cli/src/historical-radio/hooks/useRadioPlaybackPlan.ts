import { useEffect, useMemo } from 'react';
import { validateStationAudioReferences, NOISE_LOOP_AUDIO_ID } from '../audio/audioMap';
import { resolvePlaybackTrackId } from '../audio/resolvePlaybackTrack';
import type { CaptureLeadIn } from '../captureLeadIn';
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
  useEffect(() => {
    if (__DEV__) {
      validateStationAudioReferences(ALL_STATIONS_FLAT);
    }
  }, []);

  const resolvedPlaybackId = useMemo(() => {
    if (!nearestStation) return NOISE_LOOP_AUDIO_ID;
    return (
      resolvePlaybackTrackId(nearestStation.playlist, selectedYear) ?? NOISE_LOOP_AUDIO_ID
    );
  }, [nearestStation, selectedYear]);

  const effectivePlaybackTrackId = useMemo(() => {
    if (!nearestStation) return NOISE_LOOP_AUDIO_ID;
    if (captureLeadIn === 'hiss') return 'hiss_continuous';
    if (captureLeadIn === 'tuning') return 'tuning_search_static';
    return resolvedPlaybackId;
  }, [nearestStation, captureLeadIn, resolvedPlaybackId]);

  const playbackStreamKey = useMemo(() => {
    const stationPart = nearestStation ? stationKey(nearestStation) : 'off';
    const phase = !nearestStation
      ? 'noise'
      : captureLeadIn === 'hiss'
        ? 'sting_hiss'
        : captureLeadIn === 'tuning'
          ? 'sting_tune'
          : 'main';
    return `${stationPart}|${selectedYear}|${phase}|${resolvedPlaybackId}`;
  }, [nearestStation, selectedYear, resolvedPlaybackId, captureLeadIn]);

  useRadioPlayback({
    playbackStreamKey,
    playbackTrackId: effectivePlaybackTrackId,
    volumeRotation,
    powerOn: isRadioOn,
    onOneShotTrackFinished: onCaptureLeadInFinished,
  });
}
