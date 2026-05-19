import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import type { AudioTrackKind, MilitaryBlock, UserTrack } from '../types';

const STORAGE_KEY = '@historical-radio/user-tracks';
const AUDIO_DIR = 'radio-user/audio';
const MAX_WEB_AUDIO_BYTES = 12 * 1024 * 1024;
const MAX_NATIVE_BASE64_BYTES = 24 * 1024 * 1024;

const NATIVE_PICK_TYPES = [
  'audio/*',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-mpeg',
  'application/ogg',
  'application/octet-stream',
];

export type PickedAudio = {
  uri: string;
  name: string | null;
};

export type NewUserTrackInput = {
  block: MilitaryBlock;
  years: string[];
  kind: AudioTrackKind;
};

function storageBaseDir(): string {
  const doc = FileSystem.documentDirectory;
  const cache = FileSystem.cacheDirectory;
  const base =
    doc && doc.length > 0 ? doc : cache && cache.length > 0 ? cache : null;
  if (!base) {
    throw new Error('Локальное хранилище недоступно на этом устройстве');
  }
  return base;
}

function audioRoot(): string {
  return `${storageBaseDir()}${AUDIO_DIR}/`;
}

async function ensureAudioDir(): Promise<string> {
  const root = audioRoot();
  const info = await FileSystem.getInfoAsync(root);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(root, { intermediates: true });
  }
  return root;
}

function titleFromFileName(fileName: string | null | undefined): string {
  if (!fileName?.trim()) return 'Без названия';
  const withoutExt = fileName.replace(/\.[a-z0-9]+$/i, '').trim();
  let decoded = withoutExt;
  try {
    decoded = decodeURIComponent(withoutExt);
  } catch {
    /* keep raw */
  }
  const cleaned = decoded.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || 'Без названия';
}

function defaultReleaseYearFromYears(years: string[]): number {
  const nums = years.map((y) => Number.parseInt(y, 10)).filter((n) => Number.isFinite(n));
  return nums.length > 0 ? Math.min(...nums) : 1943;
}

function readUriAsDataUrl(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        if (blob.size > MAX_WEB_AUDIO_BYTES) {
          reject(new Error('Файл слишком большой (макс. 12 МБ)'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') resolve(result);
          else reject(new Error('Не удалось прочитать файл'));
        };
        reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
        reader.readAsDataURL(blob);
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Не удалось прочитать файл'));
      }
    })();
  });
}

function normalizeFileUri(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('data:')) {
    return uri;
  }
  if (uri.startsWith('/')) return `file://${uri}`;
  return uri;
}

async function fileSizeBytes(uri: string): Promise<number | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    return typeof info.size === 'number' ? info.size : null;
  } catch {
    return null;
  }
}

async function assertNonEmptyFile(uri: string): Promise<void> {
  const size = await fileSizeBytes(uri);
  if (size === null || size <= 0) {
    throw new Error('Не удалось прочитать аудиофайл. Попробуйте другой файл.');
  }
}

function isUnderAudioLibrary(uri: string): boolean {
  return uri.includes(`${AUDIO_DIR}/`);
}

async function copyAudioToLibrary(sourceUri: string, destUri: string): Promise<void> {
  const from = normalizeFileUri(sourceUri);
  const to = normalizeFileUri(destUri);

  try {
    await FileSystem.copyAsync({ from, to });
    const size = await fileSizeBytes(to);
    if (size !== null && size > 0) return;
  } catch {
    /* fallback */
  }

  try {
    const result = await FileSystem.downloadAsync(from, to);
    if (result.status >= 200 && result.status < 300) {
      const size = await fileSizeBytes(to);
      if (size !== null && size > 0) return;
    }
  } catch {
    /* fallback */
  }

  const sourceSize = await fileSizeBytes(from);
  if (sourceSize !== null && sourceSize > MAX_NATIVE_BASE64_BYTES) {
    throw new Error(
      `Файл слишком большой (${Math.round(sourceSize / 1024 / 1024)} МБ). Максимум ~24 МБ.`
    );
  }

  const base64 = await FileSystem.readAsStringAsync(from, {
    encoding: FileSystem.EncodingType.Base64,
  });
  await FileSystem.writeAsStringAsync(to, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  await assertNonEmptyFile(to);
}

async function persistSourceUri(
  sourceUri: string,
  destPath: string
): Promise<string> {
  if (Platform.OS === 'web') {
    return readUriAsDataUrl(sourceUri);
  }
  await copyAudioToLibrary(sourceUri, destPath);
  return destPath;
}

/** Открывает системный выбор аудиофайла. */
export async function pickAudioFile(): Promise<PickedAudio | null> {
  const pick = await DocumentPicker.getDocumentAsync({
    type: Platform.OS === 'web' ? 'audio/*' : NATIVE_PICK_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (pick.canceled || !pick.assets?.[0]?.uri) return null;
  const asset = pick.assets[0];
  return { uri: asset.uri, name: asset.name ?? null };
}

/**
 * Сразу после выбора копирует файл в постоянное хранилище приложения.
 * На Android URI из пикера может стать недоступен, пока открыта модалка параметров.
 */
export async function stagePickedAudio(pick: PickedAudio): Promise<PickedAudio> {
  if (Platform.OS === 'web') return pick;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const ext = pick.name?.match(/\.[a-z0-9]+$/i)?.[0] ?? '.mp3';
  const root = await ensureAudioDir();
  const dest = `${root}${id}${ext}`;
  await copyAudioToLibrary(pick.uri, dest);
  await assertNonEmptyFile(dest);
  return { uri: dest, name: pick.name };
}

/** Удаляет файл, подготовленный для импорта, если трек так и не добавили. */
export async function discardStagedAudio(uri: string): Promise<void> {
  if (Platform.OS === 'web' || !isUnderAudioLibrary(uri)) return;
  await deleteUserTrackFile(uri);
}

export async function createUserTrackFromFile(
  sourceUri: string,
  fileName: string | null,
  input: NewUserTrackInput
): Promise<UserTrack> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const ext = fileName?.match(/\.[a-z0-9]+$/i)?.[0] ?? '.mp3';

  let fileUri: string;
  if (Platform.OS === 'web') {
    fileUri = await persistSourceUri(sourceUri, '');
  } else if (isUnderAudioLibrary(sourceUri)) {
    await assertNonEmptyFile(sourceUri);
    fileUri = sourceUri;
  } else {
    const root = await ensureAudioDir();
    const dest = `${root}${id}${ext}`;
    fileUri = await persistSourceUri(sourceUri, dest);
    await assertNonEmptyFile(fileUri);
  }

  return {
    id,
    title: titleFromFileName(fileName),
    block: input.block,
    years: input.years.length > 0 ? input.years : ['1943'],
    kind: input.kind,
    releaseYear: defaultReleaseYearFromYears(input.years),
    fileUri,
    createdAt: Date.now(),
  };
}

export async function loadUserTracks(): Promise<UserTrack[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserTrack[];
    if (!Array.isArray(parsed)) return [];

    const valid: UserTrack[] = [];
    for (const t of parsed) {
      if (!t?.id || !t.fileUri) continue;
      if (Platform.OS === 'web' || t.fileUri.startsWith('data:')) {
        valid.push(t);
        continue;
      }
      const info = await FileSystem.getInfoAsync(t.fileUri);
      if (info.exists) valid.push(t);
    }
    if (valid.length !== parsed.length) {
      await saveUserTracks(valid);
    }
    return valid;
  } catch {
    return [];
  }
}

export async function saveUserTracks(tracks: UserTrack[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export async function deleteUserTrackFile(fileUri: string): Promise<void> {
  if (fileUri.startsWith('data:')) return;
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch {
    /* ignore */
  }
}
