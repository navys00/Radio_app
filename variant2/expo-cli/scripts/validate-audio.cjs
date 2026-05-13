/**
 * Проверяет, что все audioId из stations.json объявлены в audioMap.ts (строки `key: require(`).
 * Запуск: npm run validate:audio
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const jsonPath = path.join(root, 'src', 'historical-radio', 'data', 'stations.json');
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

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const blocks = ['СССР', 'ОСЬ', 'Союзники'];
for (const block of blocks) {
  const list = data[block];
  if (!Array.isArray(list)) fail(`Missing block array: ${block}`);
  for (const s of list) {
    const id = s.audioId;
    if (!id || typeof id !== 'string') fail(`Station ${s.city}: missing audioId`);
    if (!bundledKeys.has(id)) {
      fail(`audioId "${id}" (${s.city}, ${block}) not found in audioMap.ts`);
    }
  }
}

console.log('validate-audio OK:', bundledKeys.size, 'bundled keys,', blocks.length, 'blocks checked');
