import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Knob } from './components/Knob';
import { styles } from './styles';
import stationsRaw from './data/stations.json';
import type { MilitaryBlock, StationsByBlock } from './types';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const STATIONS_BY_BLOCK = stationsRaw as StationsByBlock;

export default function HistoricalRadioApp() {
  const [waveRotation, setWaveRotation] = useState(-40);
  const [volumeRotation, setVolumeRotation] = useState(30);
  const [frequencyPosition, setFrequencyPosition] = useState(50);

  const [selectedBlock, setSelectedBlock] = useState<MilitaryBlock>('СССР');
  const [selectedYear, setSelectedYear] = useState('1943');

  const militaryBlocks = useMemo(() => ['СССР', 'ОСЬ', 'Союзники'] as const, []);
  const years = useMemo(() => ['1941', '1942', '1943', '1944', '1945'] as const, []);

  const stations = STATIONS_BY_BLOCK[selectedBlock] ?? [];

  const onWaveRotate = (deg: number) => {
    setWaveRotation(deg);
    const mapped = ((deg + 140) / 280) * 100;
    setFrequencyPosition(mapped);
  };

  const activeBlockStyle =
    selectedBlock === 'СССР'
      ? styles.blockActiveUssr
      : selectedBlock === 'ОСЬ'
        ? styles.blockActiveAxis
        : styles.blockActiveAllies;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.radioBody}>
          <LinearGradient
            colors={['rgba(255,180,90,0.08)', 'rgba(0,0,0,0)']}
            style={styles.bodyRadialLike}
            pointerEvents="none"
          />

          <LinearGradient
            colors={['#4e3928', '#241b15']}
            style={styles.bodyFill}
            pointerEvents="none"
          />

          <View style={styles.bodyNoise} pointerEvents="none" />

          <View style={styles.innerPad}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Историческое Радио</Text>
              <Text style={styles.subtitle}>1941–1945</Text>
            </View>

            <View style={styles.scale}>
              <LinearGradient
                colors={['#120f0d', '#241b14', '#100d0b']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.scaleTopRow}>
                <Text style={styles.scaleBand}>LW</Text>
                <Text style={styles.scaleBand}>MW</Text>
                <Text style={styles.scaleBand}>SW</Text>
              </View>

              <View style={styles.scaleTicksWrap}>
                <View style={styles.ticksRow}>
                  {Array.from({ length: 32 }).map((_, i) => (
                    <View
                      key={i}
                      style={[styles.tick, i % 4 === 0 ? styles.tickMajor : styles.tickMinor]}
                    />
                  ))}
                </View>

                <View
                  style={[styles.slider, { left: `${clamp(frequencyPosition, 0, 100)}%` }]}
                />

                <View style={styles.scaleBottomRow}>
                  {['150', '300', '600', '1000', '1400'].map((t) => (
                    <Text key={t} style={styles.scaleNumber}>
                      {t}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.panel}>
              <LinearGradient colors={['#32271f', '#1e1712']} style={StyleSheet.absoluteFill} />
              <View style={styles.row}>
                {militaryBlocks.map((block) => {
                  const isActive = selectedBlock === block;
                  return (
                    <Pressable
                      key={block}
                      onPress={() => setSelectedBlock(block)}
                      style={[styles.blockBtn, isActive ? activeBlockStyle : null]}
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
              <View style={styles.rowBetween}>
                {years.map((year) => {
                  const isActive = selectedYear === year;
                  return (
                    <Pressable
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      style={[styles.yearBtn, isActive ? styles.yearActive : styles.yearIdle]}
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
              {stations.map((s) => (
                <View key={`${selectedBlock}-${s.city}-${s.freq}`} style={styles.stationCard}>
                  <LinearGradient
                    colors={['rgba(36,27,20,0.95)', 'rgba(18,14,11,0.95)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.stationLeft}>
                    <Text style={styles.stationCity}>{s.city}</Text>
                    <Text style={styles.stationBlock}>{selectedBlock}</Text>
                  </View>
                  <Text style={styles.stationFreq}>{s.freq}</Text>
                </View>
              ))}
            </View>

            <View style={styles.knobsRow}>
              <View style={styles.knobCol}>
                <Knob rotation={waveRotation} onRotate={onWaveRotate} />
                <Text style={styles.knobLabel}>Волна</Text>
              </View>

              <View style={styles.knobCol}>
                <Knob rotation={volumeRotation} onRotate={setVolumeRotation} />
                <Text style={styles.knobLabel}>Громкость</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

