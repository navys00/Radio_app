# Радио ЭФИР 1941-1945 (Expo CLI MVP)

MVP Android-приложения с офлайн-аудио, дискретной настройкой частоты и фоновым воспроизведением через `react-native-track-player`.

## Запуск разработки

1. Установить зависимости:

```bash
npm install
```

2. Сгенерировать Android нативную часть (первый раз или после изменения `app.json`):

```bash
npm run prebuild:android
```

3. Запустить development build:

```bash
npm run android
```

Важно: проект использует `react-native-track-player`, поэтому требуется Development Build, а не Expo Go.

## Контент и структура данных

- Конфигурация станций: `src/assets/stations.json`
- Маппинг и валидация аудио-id: `src/assets/audioMap.ts`
- Все `file` в `stations.json` должны соответствовать именам ресурсов в `android/app/src/main/res/raw`.
- Белый шум: ресурс `static` (`static.mp3`).

## Что реализовано в MVP

- Дискретный выбор частоты с пустыми частотами (шум).
- Выбор года 1941-1945.
- Переключение с коротким шумом перед новой станцией.
- Цикличное воспроизведение очереди станции.
- Фоновое воспроизведение с remote-кнопками (Play/Pause/Stop).
- Сохранение и восстановление частоты и года через AsyncStorage.

## Release-сборка

- Internal dev build: `npm run build:android:dev`
- Internal preview APK/AAB: `npm run build:android:preview`
- Production AAB: `npm run build:android:release`
