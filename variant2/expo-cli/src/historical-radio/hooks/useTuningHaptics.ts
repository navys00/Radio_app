import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Station } from '../types';
import { stationKey } from '../tuning';

export function useTuningHaptics(
  nearestStation: Station | null,
  stationsCount: number,
  isRadioOn: boolean
) {
  const lastSnapKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (stationsCount === 0) {
      lastSnapKeyRef.current = null;
      return;
    }
    const key = nearestStation ? stationKey(nearestStation) : null;
    if (
      isRadioOn &&
      Platform.OS !== 'web' &&
      key !== null &&
      lastSnapKeyRef.current !== null &&
      lastSnapKeyRef.current !== key
    ) {
      void Haptics.selectionAsync();
    }
    lastSnapKeyRef.current = key;
  }, [nearestStation, stationsCount, isRadioOn]);
}
