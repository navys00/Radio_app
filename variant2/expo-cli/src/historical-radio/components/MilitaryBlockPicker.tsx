import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MILITARY_BLOCKS } from '../constants';
import { useLayoutMetrics } from '../context/ResponsiveLayoutContext';
import { styles } from '../styles';
import type { MilitaryBlock } from '../types';

function activeBlockStyle(block: MilitaryBlock) {
  if (block === 'СССР') return styles.blockActiveUssr;
  if (block === 'ОСЬ') return styles.blockActiveAxis;
  return styles.blockActiveAllies;
}

type MilitaryBlockPickerProps = {
  selectedBlock: MilitaryBlock;
  onSelectBlock: (block: MilitaryBlock) => void;
};

export function MilitaryBlockPicker({ selectedBlock, onSelectBlock }: MilitaryBlockPickerProps) {
  const { blockBtnPaddingV } = useLayoutMetrics();

  return (
    <View style={styles.panel}>
      <LinearGradient colors={['#32271f', '#1e1712']} style={StyleSheet.absoluteFill} />
      <View style={styles.panelBevel} pointerEvents="none" />
      <View style={styles.row}>
        {MILITARY_BLOCKS.map((block) => {
          const isActive = selectedBlock === block;
          return (
            <Pressable
              key={block}
              disabled={isActive}
              onPress={() => onSelectBlock(block)}
              style={({ pressed }) => [
                styles.blockBtn,
                { paddingVertical: blockBtnPaddingV },
                isActive ? activeBlockStyle(block) : null,
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
  );
}
