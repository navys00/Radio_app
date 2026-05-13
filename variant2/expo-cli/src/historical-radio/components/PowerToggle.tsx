import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

export function PowerToggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel="Питание радио"
      hitSlop={10}
      style={({ pressed }) => [styles.powerPressable, pressed ? styles.powerPressablePressed : null]}
    >
      <View style={styles.powerHousing}>
        <LinearGradient
          colors={['#2a2119', '#120d0a']}
          style={styles.powerHousingGradient}
        />
        <View style={styles.powerBevel} />
        <View style={styles.powerTrack}>
          <View style={[styles.powerThumb, on ? styles.powerThumbOn : styles.powerThumbOff]}>
            <LinearGradient colors={['#e8d4bc', '#7a5a3d']} style={StyleSheet.absoluteFillObject} />
          </View>
        </View>
      </View>
      <Text style={[styles.powerStateLabel, on ? styles.powerStateLabelOn : styles.powerStateLabelOff]}>
        {on ? 'Вкл' : 'Выкл'}
      </Text>
      <Text style={styles.powerCaption}>Питание</Text>
    </Pressable>
  );
}
