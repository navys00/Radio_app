/**
 * Валидация stations.json: диапазоны слотов, ссылки на станции в метаданных треков.
 * Запуск: npm run validate:stations
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const jsonPath = path.join(root, 'src', 'assets', 'stations.json');
const occupationPath = path.join(root, 'src', 'assets', 'occupation-matrix.json');

const YEARS = new Set(['1941', '1942', '1943', '1944', '1945']);
const BLOCS = new Set(['ussr', 'allies', 'axis']);
const MAX_PER_BLOC = 12;

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const raw = fs.readFileSync(jsonPath, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  fail(`Invalid JSON: ${e.message}`);
}

if (!data || !Array.isArray(data.stations)) {
  fail('Missing stations array');
}

const stationIds = new Set();
for (const s of data.stations) {
  if (!s.id || typeof s.id !== 'string') fail('Station without id');
  if (stationIds.has(s.id)) fail(`Duplicate station id: ${s.id}`);
  stationIds.add(s.id);
}

const byBloc = { ussr: 0, allies: 0, axis: 0 };

for (const s of data.stations) {
  if (typeof s.frequency !== 'number') fail(`Station ${s.id}: frequency must be number`);
  if (!s.city) fail(`Station ${s.id}: missing city`);
  if (!s.bloc || typeof s.bloc !== 'string' || !BLOCS.has(s.bloc)) {
    fail(`Station ${s.id}: bloc must be one of ussr | allies | axis`);
  }
  byBloc[s.bloc] += 1;
  if (!s.years || typeof s.years !== 'object') fail(`Station ${s.id}: missing years`);
  for (const y of Object.keys(s.years)) {
    if (!YEARS.has(y)) fail(`Station ${s.id}: unknown year ${y}`);
    const arr = s.years[y];
    if (!Array.isArray(arr)) fail(`Station ${s.id}: years.${y} must be array`);
    for (const t of arr) {
      if (!t.file || !t.title) fail(`Station ${s.id} ${y}: track needs file and title`);
      if (t.allowedStationIds) {
        for (const id of t.allowedStationIds) {
          if (!stationIds.has(id)) fail(`Track ${t.file}: unknown allowedStationId ${id}`);
        }
      }
      if (t.forbiddenStationIds) {
        for (const id of t.forbiddenStationIds) {
          if (!stationIds.has(id)) fail(`Track ${t.file}: unknown forbiddenStationId ${id}`);
        }
      }
    }
  }
}

for (const b of BLOCS) {
  if (byBloc[b] > MAX_PER_BLOC) {
    fail(`Bloc ${b}: ${byBloc[b]} stations, max ${MAX_PER_BLOC}`);
  }
}

let occupationRaw;
try {
  occupationRaw = fs.readFileSync(occupationPath, 'utf8');
} catch (e) {
  fail(`Cannot read occupation-matrix.json: ${e.message}`);
}
let occupation;
try {
  occupation = JSON.parse(occupationRaw);
} catch (e) {
  fail(`Invalid occupation-matrix JSON: ${e.message}`);
}
const availability = occupation && occupation.availability && typeof occupation.availability === 'object'
  ? occupation.availability
  : null;
if (!availability) {
  fail('occupation-matrix.json: missing availability object');
}
for (const matrixId of Object.keys(availability)) {
  if (!stationIds.has(matrixId)) {
    fail(`occupation-matrix: unknown station id "${matrixId}"`);
  }
  const yearsObj = availability[matrixId];
  if (!yearsObj || typeof yearsObj !== 'object') {
    fail(`occupation-matrix.${matrixId}: must be object of year -> boolean`);
  }
  for (const y of Object.keys(yearsObj)) {
    if (!YEARS.has(y)) fail(`occupation-matrix.${matrixId}: unknown year ${y}`);
    const v = yearsObj[y];
    if (typeof v !== 'boolean') fail(`occupation-matrix.${matrixId}.${y}: must be boolean`);
  }
}

const slots = data.offStationSlots ?? [];
if (!Array.isArray(slots)) fail('offStationSlots must be an array');

const slotIds = new Set();
for (const slot of slots) {
  if (!slot.id || typeof slot.id !== 'string') fail('Off slot without id');
  if (slotIds.has(slot.id)) fail(`Duplicate offStationSlot id: ${slot.id}`);
  slotIds.add(slot.id);
  if (typeof slot.minKhz !== 'number' || typeof slot.maxKhz !== 'number') {
    fail(`Slot ${slot.id}: minKhz/maxKhz must be numbers`);
  }
  if (slot.minKhz > slot.maxKhz) fail(`Slot ${slot.id}: minKhz > maxKhz`);
  if (slot.bloc != null) {
    if (typeof slot.bloc !== 'string' || !BLOCS.has(slot.bloc)) {
      fail(`Slot ${slot.id}: bloc must be ussr | allies | axis`);
    }
  }
  if (!slot.years || typeof slot.years !== 'object') fail(`Slot ${slot.id}: missing years`);
  for (const [y, arr] of Object.entries(slot.years)) {
    if (!YEARS.has(y)) fail(`Slot ${slot.id}: unknown year ${y}`);
    if (!Array.isArray(arr)) fail(`Slot ${slot.id}: years.${y} must be array`);
    for (const t of arr) {
      if (!t.file || !t.title) fail(`Slot ${slot.id} ${y}: track needs file and title`);
    }
  }
}

for (let i = 0; i < slots.length; i++) {
  for (let j = i + 1; j < slots.length; j++) {
    const a = slots[i];
    const b = slots[j];
    if (a.minKhz <= b.maxKhz && b.minKhz <= a.maxKhz) {
      fail(`Overlapping offStationSlots: ${a.id} and ${b.id}`);
    }
  }
}

console.log(
  'stations.json OK:',
  data.stations.length,
  'stations,',
  slots.length,
  'off slots;',
  'occupation-matrix keys:',
  Object.keys(availability).length,
);
