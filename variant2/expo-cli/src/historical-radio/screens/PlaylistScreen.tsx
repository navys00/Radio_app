import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppMode } from '../context/AppModeContext';
import { AddTrackModal } from '../components/playlist/AddTrackModal';
import { EditTrackModal, type UserTrackEditInput } from '../components/playlist/EditTrackModal';
import { AddTrackVinylButton } from '../components/playlist/AddTrackVinylButton';
import { VinylDisc } from '../components/playlist/VinylDisc';
import { usePlaylistLayout } from '../hooks/usePlaylistLayout';
import {
  discardStagedAudio,
  pickAudioFile,
  stagePickedAudio,
  type NewUserTrackInput,
  type PickedAudio,
} from '../library/userLibrary';
import { playlistStyles } from '../styles/playlist';
import type { AppMode, MilitaryBlock, UserTrack } from '../types';

type Props = {
  selectedBlock: MilitaryBlock;
  selectedYear: string;
  onBack: () => void;
};

function ModeSwitch({
  mode,
  onChange,
  padV,
  fontSize,
}: {
  mode: AppMode;
  onChange: (m: AppMode) => void;
  padV: number;
  fontSize: number;
}) {
  return (
    <View style={playlistStyles.modeSwitchRow}>
      {(['festival', 'manual'] as const).map((m) => {
        const active = mode === m;
        const label = m === 'festival' ? 'Хроника' : 'Свой эфир';
        return (
          <Pressable
            key={m}
            onPress={() => void onChange(m)}
            style={[
              playlistStyles.modeBtn,
              { paddingVertical: padV },
              active ? playlistStyles.modeBtnActive : null,
            ]}
          >
            <Text
              style={[
                playlistStyles.modeBtnText,
                { fontSize },
                active ? playlistStyles.modeBtnTextActive : null,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TrackRow({
  track,
  onEdit,
  onDelete,
  coverSize,
  titleSize,
  metaSize,
}: {
  track: UserTrack;
  onEdit: () => void;
  onDelete: () => void;
  coverSize: number;
  titleSize: number;
  metaSize: number;
}) {
  const yearsLabel = track.years.join(', ');
  return (
    <View style={playlistStyles.trackCard}>
      <View style={[playlistStyles.trackCover, { width: coverSize, height: coverSize }]}>
        <VinylDisc size="small" />
      </View>
      <View style={playlistStyles.trackInfo}>
        <Text style={[playlistStyles.trackTitle, { fontSize: titleSize }]} numberOfLines={2}>
          {track.title}
        </Text>
        <Text style={[playlistStyles.trackMeta, { fontSize: metaSize }]} numberOfLines={2}>
          {track.block} · {yearsLabel} · {track.kind === 'music' ? 'музыка' : 'речь'}
        </Text>
      </View>
      <View style={playlistStyles.trackActions}>
        <Pressable
          onPress={onEdit}
          style={playlistStyles.trackActionBtn}
          accessibilityLabel="Редактировать"
        >
          <Text style={playlistStyles.trackEditText}>✦</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={playlistStyles.trackActionBtn}
          accessibilityLabel="Удалить"
        >
          <Text style={playlistStyles.trackDeleteText}>×</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function PlaylistScreen({ selectedBlock, selectedYear, onBack }: Props) {
  const layout = usePlaylistLayout();
  const { mode, setMode, userTracks, removeTrack, updateTrack, countTracksFor, addTrackFromFile } =
    useAppMode();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<UserTrack | null>(null);
  const [pendingPick, setPendingPick] = useState<PickedAudio | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const statusBarInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = userTracks;
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q));
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [userTracks, search]);

  const contextCount = countTracksFor(selectedBlock, selectedYear);

  const confirmDelete = (track: UserTrack) => {
    Alert.alert('Удалить трек?', track.title, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => void removeTrack(track.id),
      },
    ]);
  };

  const handleStartAdd = useCallback(async () => {
    if (importBusy) return;
    setImportBusy(true);
    try {
      if (mode !== 'manual') {
        await setMode('manual');
      }
      const picked = await pickAudioFile();
      if (!picked) return;
      const staged = await stagePickedAudio(picked);
      setPendingPick(staged);
      setAddOpen(true);
    } catch (e) {
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось выбрать файл');
    } finally {
      setImportBusy(false);
    }
  }, [importBusy, mode, setMode]);

  const handleCloseAdd = useCallback(() => {
    if (importBusy) return;
    const stagedUri = pendingPick?.uri;
    const keepFile = stagedUri
      ? userTracks.some((t) => t.fileUri === stagedUri)
      : false;
    setAddOpen(false);
    setPendingPick(null);
    if (stagedUri && !keepFile) {
      void discardStagedAudio(stagedUri);
    }
  }, [importBusy, pendingPick, userTracks]);

  const handleOpenEdit = useCallback((track: UserTrack) => {
    if (importBusy) return;
    setEditingTrack(track);
    setEditOpen(true);
  }, [importBusy]);

  const handleCloseEdit = useCallback(() => {
    if (importBusy) return;
    setEditOpen(false);
    setEditingTrack(null);
  }, [importBusy]);

  const handleSaveEdit = useCallback(
    async (input: UserTrackEditInput) => {
      if (!editingTrack) return;
      if (input.years.length === 0) {
        Alert.alert('Выберите год', 'Отметьте хотя бы один год эфира.');
        return;
      }
      setImportBusy(true);
      try {
        await updateTrack(editingTrack.id, input);
        setEditOpen(false);
        setEditingTrack(null);
      } catch (e) {
        Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось сохранить');
      } finally {
        setImportBusy(false);
      }
    },
    [editingTrack, updateTrack]
  );

  const handleConfirmAdd = useCallback(
    async (input: NewUserTrackInput) => {
      if (!pendingPick) return;
      if (input.years.length === 0) {
        Alert.alert('Выберите год', 'Отметьте хотя бы один год эфира.');
        return;
      }
      setImportBusy(true);
      try {
        await addTrackFromFile(pendingPick, input);
        setAddOpen(false);
        setPendingPick(null);
      } catch (e) {
        Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось добавить трек');
      } finally {
        setImportBusy(false);
      }
    },
    [pendingPick, addTrackFromFile]
  );

  const listFooter = (
    <View style={{ gap: layout.listGap, paddingBottom: layout.bottomInset }}>
      <Pressable
        onPress={() => void handleStartAdd()}
        disabled={importBusy}
        accessibilityRole="button"
        accessibilityLabel="Добавить трек"
        style={({ pressed }) => [playlistStyles.addCard, pressed ? { opacity: 0.88 } : null]}
      >
        <View style={playlistStyles.addVinylWrap}>
          <AddTrackVinylButton size={layout.addVinylSize} />
        </View>
        <Text style={[playlistStyles.addTitle, { fontSize: layout.sectionTitleSize - 4 }]}>
          Добавить трек
        </Text>
        <Text style={[playlistStyles.addHint, { fontSize: layout.trackMetaSize }]}>
          Сначала выберите аудиофайл, затем укажите блок и годы эфира.
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={playlistStyles.screenRoot}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            playlistStyles.screenInner,
            {
              paddingHorizontal: layout.horizontalPad,
              paddingTop: statusBarInset + 8,
              maxWidth: layout.contentMaxW + layout.horizontalPad * 2,
              width: '100%',
              alignSelf: 'center',
            },
          ]}
        >
          <View style={playlistStyles.playlistHeader}>
            <Pressable onPress={onBack} style={playlistStyles.headerBackBtn} accessibilityRole="button">
              <Text style={playlistStyles.backBtnText}>← Радио</Text>
            </Pressable>
            <Text style={[playlistStyles.playlistTitle, { fontSize: layout.playlistTitleSize }]}>
              Фестиваль
            </Text>
            <View style={playlistStyles.headerSpacer} />
          </View>

          <ModeSwitch
            mode={mode}
            onChange={(m) => void setMode(m)}
            padV={layout.modeBtnPadV}
            fontSize={layout.modeBtnFont}
          />

          <View style={[playlistStyles.playerBar, { padding: layout.playerBarPad, gap: 14 }]}>
            <VinylDisc size="normal" discSize={layout.vinylSize} />
            <View style={playlistStyles.playerBarText}>
              <Text style={[playlistStyles.playerLabel, { fontSize: layout.trackMetaSize - 1 }]}>
                АКТИВНЫЙ ЭФИР
              </Text>
              <Text style={[playlistStyles.playerMeta, { fontSize: layout.playerMetaSize }]}>
                {mode === 'festival'
                  ? 'Фестивальная программа'
                  : `${contextCount} треков на эфире · 3 станции`}
              </Text>
            </View>
          </View>

          {importBusy ? (
            <View style={playlistStyles.busyRow}>
              <ActivityIndicator color="#c9a06a" />
              <Text style={playlistStyles.busyText}>Импорт аудио…</Text>
            </View>
          ) : null}

          {mode === 'festival' ? (
            <View style={playlistStyles.festivalBanner}>
              <Text style={[playlistStyles.festivalBannerText, { fontSize: layout.trackMetaSize }]}>
                В фестивальном режиме звучит встроенная программа. Переключитесь на «Свой эфир»,
                чтобы добавлять свои треки.
              </Text>
            </View>
          ) : (
            <>
              <TextInput
                style={[
                  playlistStyles.searchInput,
                  {
                    paddingVertical: layout.searchPadV,
                    fontSize: layout.searchFont,
                  },
                ]}
                value={search}
                onChangeText={setSearch}
                placeholder="Поиск треков"
                placeholderTextColor="#7f6448"
              />
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: layout.listGap, flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={[playlistStyles.emptyHint, { fontSize: layout.trackMetaSize }]}>
                    Пока нет своих треков. Нажмите на пластинку ниже и выберите аудиофайл.
                  </Text>
                }
                ListFooterComponent={listFooter}
                renderItem={({ item }) => (
                  <TrackRow
                    track={item}
                    onEdit={() => handleOpenEdit(item)}
                    onDelete={() => confirmDelete(item)}
                    coverSize={layout.trackCoverSize}
                    titleSize={layout.trackTitleSize}
                    metaSize={layout.trackMetaSize}
                  />
                )}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <AddTrackModal
        visible={addOpen}
        picked={pendingPick}
        defaultBlock={selectedBlock}
        defaultYear={selectedYear}
        busy={importBusy}
        onClose={handleCloseAdd}
        onConfirm={(input) => void handleConfirmAdd(input)}
      />

      <EditTrackModal
        visible={editOpen}
        track={editingTrack}
        busy={importBusy}
        onClose={handleCloseEdit}
        onSave={(input) => void handleSaveEdit(input)}
      />
    </SafeAreaView>
  );
}
