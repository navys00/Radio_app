import { useCallback, useEffect, useRef, useState } from 'react';
import { rollCaptureLeadIn, type CaptureLeadIn } from '../captureLeadIn';
import type { Station } from '../types';
import { stationKey } from '../tuning';

export function useCaptureLeadIn(nearestStation: Station | null, isRadioOn: boolean) {
  const [captureLeadIn, setCaptureLeadIn] = useState<CaptureLeadIn>(null);
  const prevStationKeyRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const key = nearestStation ? stationKey(nearestStation) : null;
    if (!isRadioOn) {
      setCaptureLeadIn(null);
      prevStationKeyRef.current = key;
      return;
    }
    if (prevStationKeyRef.current === undefined) {
      prevStationKeyRef.current = key;
      setCaptureLeadIn(null);
      return;
    }
    const prev = prevStationKeyRef.current;
    if (key === null) {
      setCaptureLeadIn(null);
    } else if (prev === null || prev !== key) {
      setCaptureLeadIn(rollCaptureLeadIn(nearestStation?.secret === true));
    }
    prevStationKeyRef.current = key;
  }, [nearestStation, isRadioOn]);

  const endCaptureLeadIn = useCallback(() => {
    setCaptureLeadIn(null);
  }, []);

  return { captureLeadIn, endCaptureLeadIn };
}
