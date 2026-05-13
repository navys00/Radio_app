import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { validateStationAudioReferences } from './audio/audioMap';
import { Knob } from './components/Knob';
import { PowerToggle } from './components/PowerToggle';
import { useRadioPlayback } from './hooks/useRadioPlayback';
import { styles } from './styles';
import stationsRaw from './data/stations.json';
import type { MilitaryBlock, StationsByBlock } from './types';
import {
  findNearestStationIfCaptured,
  khzFromTuningPercent,
  stationKey,
  tuningPercentFromWaveRotation,
} from './tuning';

const STATIONS_BY_BLOCK = stationsRaw as StationsByBlock;

const ALL_STATIONS_FLAT = [
  ...STATIONS_BY_BLOCK['СССР'],
  ...STATIONS_BY_BLOCK['ОСЬ'],
  ...STATIONS_BY_BLOCK['Союзники'],
];

export default function HistoricalRadioApp() {
  const [waveRotation, setWaveRotation] = useState(-40);
  const [volumeRotation, setVolumeRotation] = useState(30);
  const [frequencyPosition, setFrequencyPosition] = useState(50);
  const [scaleWidth, setScaleWidth] = useState(0);
  const animatedFrequency = useRef(new Animated.Value(50)).current;

  const [selectedBlock, setSelectedBlock] = useState<MilitaryBlock>('СССР');
  const [selectedYear, setSelectedYear] = useState('1943');
  const [isRadioOn, setIsRadioOn] = useState(true);

  const militaryBlocks = useMemo(() => ['СССР', 'ОСЬ', 'Союзники'] as const, []);
  const years = useMemo(() => ['1941', '1942', '1943', '1944', '1945'] as const, []);

  const stationsAll = STATIONS_BY_BLOCK[selectedBlock] ?? [];

  const stations = useMemo(
    () =>
      stationsAll
        .filter((s) => s.years.includes(selectedYear))
        .sort((a, b) => a.khz - b.khz),
    [stationsAll, selectedYear]
  );

  const tuningKhz = useMemo(() => khzFromTuningPercent(frequencyPosition), [frequencyPosition]);

  const nearestStation = useMemo(
    () => findNearestStationIfCaptured(stations, tuningKhz),
    [stations, tuningKhz]
  );

  useEffect(() => {
    if (__DEV__) {
      validateStationAudioReferences(ALL_STATIONS_FLAT);
    }
  }, []);

  useRadioPlayback({
    capturedStation: nearestStation,
    volumeRotation,
    powerOn: isRadioOn,
  });

  const lastSnapKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (stations.length === 0) {
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
  }, [nearestStation, stations.length, isRadioOn]);

  useEffect(() => {
    Animated.timing(animatedFrequency, {
      toValue: frequencyPosition,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animatedFrequency, frequencyPosition]);

  const sliderTranslateX = animatedFrequency.interpolate({
    inputRange: [0, 100],
    outputRange: [0, Math.max(scaleWidth - 3, 0)],
  });

  const onScaleLayout = (event: LayoutChangeEvent) => {
    setScaleWidth(event.nativeEvent.layout.width);
  };

  const onWaveRotate = (deg: number) => {
    setWaveRotation(deg);
    setFrequencyPosition(tuningPercentFromWaveRotation(deg));
  };

  const activeBlockStyle =
    selectedBlock === 'СССР'
      ? styles.blockActiveUssr
      : selectedBlock === 'ОСЬ'
        ? styles.blockActiveAxis
        : styles.blockActiveAllies;

  const dialGlow = isRadioOn ? 1 : 0.11;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.radioBody}>
          <LinearGradient
            colors={['rgba(255,180,90,0.08)', 'rgba(0,0,0,0)']}
            style={[styles.bodyRadialLike, { opacity: dialGlow }]}
            pointerEvents="none"
          />

          <LinearGradient
            colors={['#4e3928', '#241b15']}
            style={styles.bodyFill}
            pointerEvents="none"
          />

          <View style={styles.bodyNoise} pointerEvents="none" />
          <View style={styles.bodyInsetShadow} pointerEvents="none" />
          <View style={styles.bodyTopBevel} pointerEvents="none" />
          <View style={styles.bodyBottomVignette} pointerEvents="none" />

          <View style={styles.innerPad}>
            <View style={styles.titleWrap}>
              <Text style={[styles.title, !isRadioOn ? styles.titleLightsOff : null]}>Фестиваль</Text>
            </View>

            <View style={styles.scale}>
              <LinearGradient
                colors={['#120f0d', '#241b14', '#100d0b']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.scaleInnerShadow} pointerEvents="none" />

              <View style={styles.scaleTopRow}>
                <Text style={[styles.scaleBand, !isRadioOn ? styles.scaleTextDim : null]}>LW</Text>
                <Text style={[styles.scaleBand, !isRadioOn ? styles.scaleTextDim : null]}>MW</Text>
                <Text style={[styles.scaleBand, !isRadioOn ? styles.scaleTextDim : null]}>SW</Text>
              </View>

              <View style={styles.scaleTicksWrap} onLayout={onScaleLayout}>
                <View style={styles.ticksRow}>
                  {Array.from({ length: 32 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.tick,
                        i % 4 === 0 ? styles.tickMajor : styles.tickMinor,
                        { opacity: isRadioOn ? 1 : 0.38 },
                      ]}
                    />
                  ))}
                </View>

                <Animated.View
                  style={[
                    styles.slider,
                    {
                      transform: [{ translateX: sliderTranslateX }],
                      opacity: (scaleWidth > 0 ? 1 : 0) * dialGlow,
                    },
                  ]}
                />

                <View style={styles.scaleBottomRow}>
                  {['150', '300', '600', '1000', '1400'].map((t) => (
                    <Text key={t} style={[styles.scaleNumber, !isRadioOn ? styles.scaleTextDim : null]}>
                      {t}
                    </Text>
                  ))}
                </View>
              </View>

              <LinearGradient
                colors={['rgba(255,244,210,0.22)', 'rgba(255,244,210,0.02)', 'rgba(0,0,0,0)']}
                locations={[0, 0.42, 1]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={[styles.scaleGlassSheen, { opacity: 0.95 * dialGlow }]}
                pointerEvents="none"
              />
              <View style={[styles.scaleGlassMist, { opacity: isRadioOn ? 1 : 0.12 }]} pointerEvents="none" />
            </View>

            <View style={styles.panel}>
              <LinearGradient colors={['#32271f', '#1e1712']} style={StyleSheet.absoluteFill} />
              <View style={styles.panelBevel} pointerEvents="none" />
              <View style={styles.row}>
                {militaryBlocks.map((block) => {
                  const isActive = selectedBlock === block;
                  return (
                    <Pressable
                      key={block}
                      disabled={isActive}
                      onPress={() => setSelectedBlock(block)}
                      style={({ pressed }) => [
                        styles.blockBtn,
                        isActive ? activeBlockStyle : null,
                        isActive ? styles.controlDisabled : null,
                        pressed ? styles.controlPressed : null,
                      ]}
                    >
                      <Text style={[styles.blockText, isActive ? styles.blockTextActive : null]}>
                        {block}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.panel}>
              <LinearGradient colors={['#32271f', '#1e1712']} style={StyleSheet.absoluteFill} />
              <View style={styles.panelBevel} pointerEvents="none" />
              <View style={styles.rowBetween}>
                {years.map((year) => {
                  const isActive = selectedYear === year;
                  return (
                    <Pressable
                      key={year}
                      disabled={isActive}
                      onPress={() => setSelectedYear(year)}
                      style={({ pressed }) => [
                        styles.yearBtn,
                        isActive ? styles.yearActive : styles.yearIdle,
                        isActive ? styles.controlDisabled : null,
                        pressed ? styles.controlPressed : null,
                      ]}
                    >
                      <Text style={[styles.yearText, isActive ? styles.yearTextActive : null]}>
                        {year}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.stationsWrap}>
              {stations.length === 0 ? (
                <View style={styles.emptyStationsWrap}>
                  <Text style={styles.emptyStationsText}>
                    На выбранный год в этом блоке нет станций в списке.
                  </Text>
                </View>
              ) : (
                stations.map((s) => {
                  const isTuned =
                    isRadioOn &&
                    nearestStation !== null &&
                    stationKey(s) === stationKey(nearestStation);
                  return (
                    <View
                      key={`${selectedBlock}-${selectedYear}-${s.city}-${s.khz}`}
                      style={[styles.stationCard, isTuned ? styles.stationCardActive : null]}
                    >
                      <LinearGradient
                        colors={
                          isTuned
                            ? ['rgba(62,44,28,0.98)', 'rgba(26,18,12,0.98)']
                            : ['rgba(36,27,20,0.95)', 'rgba(18,14,11,0.95)']
                        }
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.stationLeft}>
                        <Text style={[styles.stationCity, isTuned ? styles.stationCityActive : null]}>
                          {s.city}
                        </Text>
                        <Text style={styles.stationBlock}>{selectedBlock}</Text>
                      </View>
                      <Text style={[styles.stationFreq, isTuned ? styles.stationFreqActive : null]}>
                        {s.freq}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.knobsRow}>
              <View style={styles.knobCol}>
                <Knob rotation={waveRotation} onRotate={onWaveRotate} disabled={!isRadioOn} />
                <Text style={[styles.knobLabel, !isRadioOn ? styles.knobLabelDim : null]}>Волна</Text>
              </View>

              <View style={styles.powerCol}>
                <PowerToggle on={isRadioOn} onPress={() => setIsRadioOn((v) => !v)} />
              </View>

              <View style={styles.knobCol}>
                <Knob rotation={volumeRotation} onRotate={setVolumeRotation} disabled={!isRadioOn} />
                <Text style={[styles.knobLabel, !isRadioOn ? styles.knobLabelDim : null]}>Громкость</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

