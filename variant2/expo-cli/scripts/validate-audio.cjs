/**
 * Проверяет, что все id из playlist в stations.json есть в audioCatalog.json и в audioMap.ts (require).
 * Запуск: npm run validate:audio
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const jsonPath = path.join(root, 'src', 'historical-radio', 'data', 'stations.json');
const catalogPath = path.join(root, 'src', 'historical-radio', 'data', 'audioCatalog.json');
const mapPath = path.join(root, 'src', 'historical-radio', 'audio', 'audioMap.ts');

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const mapSrc = fs.readFileSync(mapPath, 'utf8');
const bundledKeys = new Set();
const re = /^\s{2}([\w]+):\s*require\(/gm;
let m;
while ((m = re.exec(mapSrc))) {
  bundledKeys.add(m[1]);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const catalogIds = new Set((catalog.tracks || []).map((t) => t.id));

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const blocks = ['СССР', 'ОСЬ', 'Союзники'];
for (const block of blocks) {
  const list = data[block];
  if (!Array.isArray(list)) fail(`Missing block array: ${block}`);
  for (const s of list) {
    if (!Array.isArray(s.playlist) || s.playlist.length === 0) {
      fail(`Station ${s.city} (${block}): missing or empty playlist`);
    }
    for (const trackId of s.playlist) {
      if (!catalogIds.has(trackId)) {
        fail(`playlist id "${trackId}" (${s.city}, ${block}) not in audioCatalog.json`);
      }
      if (!bundledKeys.has(trackId)) {
        fail(`playlist id "${trackId}" (${s.city}, ${block}) not found in audioMap.ts`);
      }
    }
  }
}

console.log(
  'validate-audio OK:',
  bundledKeys.size,
  'bundled keys,',
  catalogIds.size,
  'catalog tracks,',
  blocks.length,
  'blocks'
);
