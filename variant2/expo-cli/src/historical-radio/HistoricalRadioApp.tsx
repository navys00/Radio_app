import React, { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { FrequencyScale } from './components/FrequencyScale';
import { MilitaryBlockPicker } from './components/MilitaryBlockPicker';
import { RadioBodyChrome } from './components/RadioBodyChrome';
import { RadioControlsRow } from './components/RadioControlsRow';
import { StationList } from './components/StationList';
import { YearPicker } from './components/YearPicker';
import { ResponsiveLayoutProvider, useLayoutMetrics } from './context/ResponsiveLayoutContext';
import { useCaptureLeadIn } from './hooks/useCaptureLeadIn';
import { useRadioPlaybackPlan } from './hooks/useRadioPlaybackPlan';
import { useRadioTuning } from './hooks/useRadioTuning';
import { useStationCatalog } from './hooks/useStationCatalog';
import { useTuningHaptics } from './hooks/useTuningHaptics';
import { styles } from './styles';
import type { MilitaryBlock } from './types';

function HistoricalRadioScreen() {
  const { cardW, titleFontSize, sectionGap, panelGap } = useLayoutMetrics();
  const [selectedBlock, setSelectedBlock] = useState<MilitaryBlock>('СССР');
  const [selectedYear, setSelectedYear] = useState('1943');
  const [isRadioOn, setIsRadioOn] = useState(false);

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
      <View style={styles.screenContent}>
        <RadioBodyChrome dialGlow={dialGlow} cardWidth={cardW}>
          <View style={[styles.layoutColumn, { gap: sectionGap }]}>
            <View style={styles.zoneHeader}>
              <View style={styles.titleWrap}>
                <Text
                  style={[
                    styles.title,
                    { fontSize: titleFontSize },
                    !isRadioOn ? styles.titleLightsOff : null,
                  ]}
                >
                  Фестиваль
                </Text>
              </View>
            </View>

            <View style={styles.zoneScale}>
              <FrequencyScale
                isRadioOn={isRadioOn}
                dialGlow={dialGlow}
                scaleWidth={scaleWidth}
                sliderTranslateX={sliderTranslateX}
                onScaleLayout={onScaleLayout}
              />
            </View>

            <View style={[styles.zonePanels, { gap: panelGap }]}>
              <MilitaryBlockPicker selectedBlock={selectedBlock} onSelectBlock={setSelectedBlock} />
              <YearPicker selectedYear={selectedYear} onSelectYear={setSelectedYear} />
            </View>

            <View style={styles.zoneStations}>
              <StationList
                stations={stationsVisible}
                selectedYear={selectedYear}
                isRadioOn={isRadioOn}
                nearestStation={nearestStation}
              />
            </View>

            <View style={styles.zoneControls}>
              <RadioControlsRow
                isRadioOn={isRadioOn}
                tuningKhz={tuningKhz}
                waveRotation={waveRotation}
                volumeRotation={volumeRotation}
                onWaveRotate={onWaveRotate}
                onVolumeRotate={setVolumeRotation}
                onPowerToggle={() => setIsRadioOn((v) => !v)}
              />
            </View>
          </View>
        </RadioBodyChrome>
      </View>
    </SafeAreaView>
  );
}

export default function HistoricalRadioApp() {
  return (
    <ResponsiveLayoutProvider>
      <HistoricalRadioScreen />
    </ResponsiveLayoutProvider>
  );
}
