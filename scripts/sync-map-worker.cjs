const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.copyFileSync(path.join(root, 'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs'), path.join(root, 'public/maplibre-gl-worker.mjs'));
