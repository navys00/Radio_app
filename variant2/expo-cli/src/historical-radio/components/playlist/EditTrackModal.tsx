import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GAME_YEARS, MILITARY_BLOCKS } from '../../constants';
import type { AudioTrackKind, MilitaryBlock, UserTrack } from '../../types';

export type UserTrackEditInput = {
  title: string;
  block: MilitaryBlock;
  years: string[];
  kind: AudioTrackKind;
};

type Props = {
  visible: boolean;
  track: UserTrack | null;
  busy: boolean;
  onClose: () => void;
  onSave: (input: UserTrackEditInput) => void;
};

export function EditTrackModal({ visible, track, busy, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [block, setBlock] = useState<MilitaryBlock>('СССР');
  const [years, setYears] = useState<string[]>([]);
  const [kind, setKind] = useState<AudioTrackKind>('music');

  useEffect(() => {
    if (!visible || !track) return;
    setTitle(track.title);
    setBlock(track.block);
    setYears([...track.years]);
    setKind(track.kind);
  }, [visible, track]);

  const toggleYear = (y: string) => {
    setYears((prev) => (prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y].sort()));
  };

  const handleSave = () => {
    if (years.length === 0) return;
    onSave({
      title: title.trim() || track?.title || 'Без названия',
      block,
      years,
      kind,
    });
  };

  if (!track) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={localStyles.backdrop}>
        <View style={localStyles.sheet}>
          <LinearGradient colors={['#32271f', '#1e1712']} style={StyleSheet.absoluteFill} />
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={localStyles.scroll}>
            <Text style={localStyles.heading}>Редактировать трек</Text>
            <Text style={localStyles.label}>Название</Text>
            <TextInput
              style={localStyles.input}
              value={title}
              onChangeText={setTitle}
              editable={!busy}
              placeholder="Название в списке"
              placeholderTextColor="#7f6448"
            />
            <Text style={localStyles.label}>Блок</Text>
            <View style={localStyles.row}>
              {MILITARY_BLOCKS.map((b) => (
                <Pressable
                  key={b}
                  onPress={() => setBlock(b)}
                  disabled={busy}
                  style={[localStyles.chip, block === b ? localStyles.chipActive : null]}
                >
                  <Text style={[localStyles.chipText, block === b ? localStyles.chipTextActive : null]}>
                    {b}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={localStyles.label}>Годы эфира</Text>
            <View style={localStyles.row}>
              {GAME_YEARS.map((y) => (
                <Pressable
                  key={y}
                  onPress={() => toggleYear(y)}
                  disabled={busy}
                  style={[localStyles.yearChip, years.includes(y) ? localStyles.chipActive : null]}
                >
                  <Text
                    style={[localStyles.chipText, years.includes(y) ? localStyles.chipTextActive : null]}
                  >
                    {y}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={localStyles.label}>Тип</Text>
            <View style={localStyles.row}>
              {(['music', 'speech'] as const).map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setKind(k)}
                  disabled={busy}
                  style={[localStyles.chip, kind === k ? localStyles.chipActive : null]}
                >
                  <Text style={[localStyles.chipText, kind === k ? localStyles.chipTextActive : null]}>
                    {k === 'music' ? 'Музыка' : 'Речь'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={localStyles.actions}>
              <Pressable onPress={onClose} style={localStyles.cancelBtn} disabled={busy}>
                <Text style={localStyles.cancelText}>Отмена</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={localStyles.saveBtn}
                disabled={busy || years.length === 0}
              >
                <Text style={localStyles.saveText}>Сохранить</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,210,150,0.12)',
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
  },
  heading: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 22,
    color: '#f7ddb6',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    letterSpacing: 1.5,
    color: '#8e7152',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#120d09',
    borderWidth: 1,
    borderColor: 'rgba(255, 211, 149, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f7ddb6',
    fontFamily: 'Oswald_400Regular',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1a120d',
    borderWidth: 1,
    borderColor: 'rgba(255,210,150,0.08)',
  },
  yearChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1a120d',
    borderWidth: 1,
    borderColor: 'rgba(255,210,150,0.08)',
    minWidth: 52,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#5a0906',
    borderColor: 'rgba(255,160,120,0.3)',
  },
  chipText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#9d7b58',
  },
  chipTextActive: {
    color: '#ffd7a4',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,210,150,0.15)',
  },
  cancelText: {
    fontFamily: 'Oswald_400Regular',
    color: '#c9a06a',
    fontSize: 15,
  },
  saveBtn: {
    flex: 1.4,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#b87a2f',
  },
  saveText: {
    fontFamily: 'Oswald_600SemiBold',
    color: '#24150a',
    fontSize: 15,
  },
});
