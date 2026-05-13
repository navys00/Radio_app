# Схема `occupation-matrix.json`

- Файл: [`src/assets/occupation-matrix.json`](../src/assets/occupation-matrix.json).
- Поле **`availability`**: объект `stationId` → объект годов `1941` … `1945` со значением **`true`** (в эфире) или **`false`** (недоступна из‑за оккупации / сценария).
- Станция **без записи** в матрице считается **доступной во все годы** (упрощение для MVP).
- Ключи — **`id` станции** из [`stations.json`](../src/assets/stations.json), не название города.
