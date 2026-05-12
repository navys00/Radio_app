# Радио ЭФИР 1941-1945 (Expo CLI MVP)

MVP Android-приложения с офлайн-аудио и фоновым воспроизведением через `react-native-track-player`. Интерфейс — ламповый приёмник: корпус и шкала **вёрсткой**, красная стрелка, лампа, **две ручки** (частота и громкость), без слайдеров, селектора года и кнопок на экране.

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

## Зависимости интерфейса и состояния

- `react-native-gesture-handler`, `react-native-reanimated` — жесты ручек и анимации.
- `react-native-track-player` — фоновое воспроизведение и уведомление.
- `@react-native-async-storage/async-storage` — частота и громкость.

## Контент и структура данных

- Конфигурация станций: `src/assets/stations.json` (**16 городов** с частотами в AM-диапазоне).
- Маппинг и валидация аудио-id: `src/assets/audioMap.ts`.
- Все `file` в `stations.json` должны соответствовать именам ресурсов в `android/app/src/main/res/raw`.
- Белый шум: ресурс `static` (`static.mp3`).
- Опциональные графические ассеты (заказ у дизайнера): каталог `src/assets/images/radio/` (см. `README.md` там).
- ТЗ **информационного поля** (полосы по частотам, стрелка, приёмка): [`docs/tz-information-field.md`](docs/tz-information-field.md).

## Что реализовано в MVP

- Настройка частоты **520–1600 кГц**, шаг **1 кГц** при отпускании ручки; плавное движение стрелки во время жеста.
- Захват станции по ближайшей частоте в пределах полосы (`resolveStationForFrequency` в `radioData.ts`); иначе — белый шум.
- Очередь станции — **все** треки по годам из JSON в один цикл.
- Переключение **только при смене цели** (станция / шум / другая станция): короткий шум (~800 ms), затем эфир.
- Громкость **0–100**, независимое сохранение в AsyncStorage, `TrackPlayer.setVolume`.
- Прогрев ламп при старте; шкала с засечками и **подписями городов** у станций (без цифровой панели частоты).
- Фоновое воспроизведение; Play/Pause/Stop **в уведомлении**.

## Release-сборка

- Internal dev build: `npm run build:android:dev`
- Internal preview APK/AAB: `npm run build:android:preview`
- Production AAB: `npm run build:android:release`
