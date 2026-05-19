import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppMode } from '../context/AppModeContext';
import { playlistStyles } from '../styles/playlist';
import { VinylDisc } from './playlist/VinylDisc';
import type { MilitaryBlock } from '../types';

type Props = {
  selectedBlock: MilitaryBlock;
  selectedYear: string;
  onPress: () => void;
};

export function PlaylistPromoCard({ selectedBlock, selectedYear, onPress }: Props) {
  const { mode, countTracksFor } = useAppMode();
  const count = countTracksFor(selectedBlock, selectedYear);
  const modeLabel = mode === 'manual' ? 'Свой эфир' : 'Фестиваль';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [playlistStyles.promoCard, pressed ? { opacity: 0.88 } : null]}
      accessibilityRole="button"
      accessibilityLabel="Мой плейлист"
    >
      <View style={playlistStyles.promoCrate}>
        <VinylDisc size="small" />
        <Text style={playlistStyles.promoCrateLabel}>МОЙ{'\n'}ПЛЕЙЛИСТ</Text>
      </View>
      <View style={playlistStyles.promoBody}>
        <Text style={playlistStyles.promoTitle}>МОЙ ПЛЕЙЛИСТ</Text>
        <Text style={playlistStyles.promoSubtitle} numberOfLines={2}>
          {mode === 'manual'
            ? `${selectedBlock} · ${selectedYear} · ${count} треков`
            : 'Настройте собственный эфир и добавьте треки'}
        </Text>
        <View style={playlistStyles.promoModeBadge}>
          <Text style={playlistStyles.promoModeBadgeText}>{modeLabel}</Text>
        </View>
      </View>
      <Text style={playlistStyles.promoArrow}>›</Text>
    </Pressable>
  );
}
