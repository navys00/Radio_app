/**
 * Валидация stations.json: диапазоны слотов, ссылки на станции в метаданных треков.
 * Запуск: npm run validate:stations
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const jsonPath = path.join(root, 'src', 'assets', 'stations.json');

const YEARS = new Set(['1941', '1942', '1943', '1944', '1945']);

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

for (const s of data.stations) {
  if (typeof s.frequency !== 'number') fail(`Station ${s.id}: frequency must be number`);
  if (!s.city) fail(`Station ${s.id}: missing city`);
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

console.log('stations.json OK:', data.stations.length, 'stations,', slots.length, 'off slots');
