import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles';
import { Knob } from './Knob';
import { PowerToggle } from './PowerToggle';

type RadioControlsRowProps = {
  isRadioOn: boolean;
  tuningKhz: number;
  waveRotation: number;
  volumeRotation: number;
  onWaveRotate: (deg: number) => void;
  onVolumeRotate: (deg: number) => void;
  onPowerToggle: () => void;
};

export function RadioControlsRow({
  isRadioOn,
  tuningKhz,
  waveRotation,
  volumeRotation,
  onWaveRotate,
  onVolumeRotate,
  onPowerToggle,
}: RadioControlsRowProps) {
  return (
    <View style={styles.knobsRow}>
      <View style={styles.knobCol}>
        <Knob
          rotation={waveRotation}
          onRotate={onWaveRotate}
          disabled={!isRadioOn}
          accessibilityLabel="Ручка настройки волны"
        />
        <Text style={[styles.knobLabel, !isRadioOn ? styles.knobLabelDim : null]}>Волна</Text>
      </View>

      <View style={styles.powerCol}>
        <View
          style={[styles.waveReadout, !isRadioOn ? styles.waveReadoutDim : null]}
          accessibilityLabel={`Текущая частота ${tuningKhz} килогерц`}
        >
          <Text style={styles.waveReadoutValue}>{tuningKhz}</Text>
          <Text style={styles.waveReadoutUnit}>кГц</Text>
        </View>
        <PowerToggle on={isRadioOn} onPress={onPowerToggle} />
      </View>

      <View style={styles.knobCol}>
        <Knob
          rotation={volumeRotation}
          onRotate={onVolumeRotate}
          disabled={!isRadioOn}
          accessibilityLabel="Ручка громкости"
        />
        <Text style={[styles.knobLabel, !isRadioOn ? styles.knobLabelDim : null]}>Громкость</Text>
      </View>
    </View>
  );
}
