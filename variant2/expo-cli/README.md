# Историческое радио (Expo)

Мобильное приложение «ретро-радио» для фестиваля: настройка частоты, выбор военного блока и года, воспроизведение речей и музыки из локального бандла.

## Запуск

```bash
npm install
npm start
```

Платформы: `npm run android`, `npm run ios`, `npm run web`.

## Установочный APK (Android)

**Готовый файл для теста на устройстве:**

`dist/historical-radio-1.0.0.apk` (~218 МБ, все аудио в бандле)

Скопируйте на телефон, откройте файл и разрешите установку из неизвестных источников.

**Пересборка локально** (нужны Android SDK и Java 17):

```bash
# ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk
npm run build:android:apk
```

APK также появится в:  
`android/app/build/outputs/apk/release/app-release.apk`

**Облачная сборка (EAS)** — после `npx eas login`:

```bash
npm run build:android:apk:cloud
```

## Проверки

```bash
npm run validate      # аудио-ссылки + TypeScript
npm run validate:audio
npm run typecheck
```

## Структура `src/historical-radio/`

| Папка / файл | Назначение |
|--------------|------------|
| `HistoricalRadioApp.tsx` | Сборка экрана из хуков и компонентов |
| `hooks/` | Тюнинг, каталог станций, lead-in, плеер, haptics |
| `components/` | Шкала, списки, ручки, корпус радио |
| `audio/` | `audioMap`, резолв трека по году |
| `data/` | `stations.json`, `audioCatalog.json` |
| `styles/` | Стили по зонам UI |
| `tuning.ts`, `captureLeadIn.ts` | Чистая доменная логика |

## Добавление контента

1. Положить MP3 в `assets/audio/…`
2. Добавить запись в `data/audioCatalog.json` (`id`, `kind`, `releaseYear`)
3. Добавить `require` в `audio/audioMap.ts` с тем же `id`
4. Указать `id` в `playlist` станции в `data/stations.json`
5. Запустить `npm run validate:audio`

**Речь** играет только в `releaseYear`. **Музыка** — с года выпуска по 1945.

Секретные станции: `"secret": true` в `stations.json`, треки в `assets/audio/*/secret/`.

**Важно:** MP3 и APK не хранятся в Git (см. `.gitignore`). Аудио нужно иметь локально у каждого разработчика / в CI-артефакте отдельно.
