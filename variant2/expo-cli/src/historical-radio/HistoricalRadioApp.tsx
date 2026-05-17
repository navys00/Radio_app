import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { FrequencyScale } from './components/FrequencyScale';
import { MilitaryBlockPicker } from './components/MilitaryBlockPicker';
import { RadioBodyChrome } from './components/RadioBodyChrome';
import { RadioControlsRow } from './components/RadioControlsRow';
import { StationList } from './components/StationList';
import { YearPicker } from './components/YearPicker';
import { useCaptureLeadIn } from './hooks/useCaptureLeadIn';
import { useRadioPlaybackPlan } from './hooks/useRadioPlaybackPlan';
import { useRadioTuning } from './hooks/useRadioTuning';
import { useStationCatalog } from './hooks/useStationCatalog';
import { useTuningHaptics } from './hooks/useTuningHaptics';
import { styles } from './styles';
import type { MilitaryBlock } from './types';

export default function HistoricalRadioApp() {
  const [selectedBlock, setSelectedBlock] = useState<MilitaryBlock>('СССР');
  const [selectedYear, setSelectedYear] = useState('1943');
  const [isRadioOn, setIsRadioOn] = useState(true);

  const {
    waveRotation,
    volumeRotation,
    setVolumeRotation,
    frequencyPosition,
    scaleWidth,
    sliderTranslateX,
    onScaleLayout,
    onWaveRotate,
  } = useRadioTuning();

  const { stations, stationsVisible, tuningKhz, nearestStation } = useStationCatalog(
    selectedBlock,
    selectedYear,
    frequencyPosition
  );

  const { captureLeadIn, endCaptureLeadIn } = useCaptureLeadIn(nearestStation, isRadioOn);

  useRadioPlaybackPlan({
    nearestStation,
    selectedYear,
    captureLeadIn,
    volumeRotation,
    isRadioOn,
    onCaptureLeadInFinished: endCaptureLeadIn,
  });

  useTuningHaptics(nearestStation, stations.length, isRadioOn);

  const dialGlow = isRadioOn ? 1 : 0.11;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <RadioBodyChrome dialGlow={dialGlow}>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, !isRadioOn ? styles.titleLightsOff : null]}>Фестиваль</Text>
          </View>

          <FrequencyScale
            isRadioOn={isRadioOn}
            dialGlow={dialGlow}
            scaleWidth={scaleWidth}
            sliderTranslateX={sliderTranslateX}
            onScaleLayout={onScaleLayout}
          />

          <MilitaryBlockPicker selectedBlock={selectedBlock} onSelectBlock={setSelectedBlock} />
          <YearPicker selectedYear={selectedYear} onSelectYear={setSelectedYear} />

          <StationList
            stations={stationsVisible}
            selectedBlock={selectedBlock}
            selectedYear={selectedYear}
            isRadioOn={isRadioOn}
            nearestStation={nearestStation}
          />

          <RadioControlsRow
            isRadioOn={isRadioOn}
            tuningKhz={tuningKhz}
            waveRotation={waveRotation}
            volumeRotation={volumeRotation}
            onWaveRotate={onWaveRotate}
            onVolumeRotate={setVolumeRotation}
            onPowerToggle={() => setIsRadioOn((v) => !v)}
          />
        </RadioBodyChrome>
      </ScrollView>
    </SafeAreaView>
  );
}
