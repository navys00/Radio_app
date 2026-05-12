# Release and Handover

## Подготовка контента

1. Положить все mp3 в `android/app/src/main/res/raw`.
2. Привести имена файлов к lower_snake_case без дефисов.
3. Обновить `src/assets/stations.json` в соответствии с реальными именами ресурсов.

## Сборка

1. Локальная генерация Android:
   - `npm run prebuild:android`
2. Internal тестовая сборка:
   - `npm run build:android:preview`
3. Production AAB:
   - `npm run build:android:release`

## Передача заказчику

- APK/AAB артефакт.
- Исходный код.
- `docs/mvp-test-checklist.md` с пройденными пунктами.
- Список известных ограничений (если есть).
