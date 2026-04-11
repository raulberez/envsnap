const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function parseEnvFormat(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) vars[key] = value;
  }
  return vars;
}

function parseJsonFormat(content) {
  const parsed = JSON.parse(content);
  if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
    throw new Error('JSON file must contain a flat key-value object');
  }
  const vars = {};
  for (const [k, v] of Object.entries(parsed)) {
    vars[k] = String(v);
  }
  return vars;
}

function parseShellFormat(content) {
  const vars = {};
  const exportRe = /^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    const match = trimmed.match(exportRe);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[match[1]] = value;
  }
  return vars;
}

function detectFormat(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return 'json';
  if (ext === '.sh') return 'shell';
  if (content.trim().startsWith('{')) return 'json';
  if (content.includes('export ')) return 'shell';
  return 'env';
}

function importSnapshot(filePath, snapshotName, options = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const format = options.format || detectFormat(filePath, content);

  let vars;
  if (format === 'json') vars = parseJsonFormat(content);
  else if (format === 'shell') vars = parseShellFormat(content);
  else vars = parseEnvFormat(content);

  const dir = getSnapshotsDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const destPath = path.join(dir, `${snapshotName}.json`);
  if (fs.existsSync(destPath) && !options.overwrite) {
    throw new Error(`Snapshot "${snapshotName}" already exists. Use --overwrite to replace it.`);
  }

  const snapshot = { name: snapshotName, createdAt: new Date().toISOString(), vars };
  fs.writeFileSync(destPath, JSON.stringify(snapshot, null, 2));
  return snapshot;
}

module.exports = { importSnapshot, parseEnvFormat, parseJsonFormat, parseShellFormat, detectFormat };
