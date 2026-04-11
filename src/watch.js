const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

const DEFAULT_INTERVAL_MS = 2000;

function getEnvFilePath(envFile) {
  return path.resolve(process.cwd(), envFile || '.env');
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    vars[key] = value;
  }
  return vars;
}

function snapshotChanged(prev, curr) {
  if (!prev || !curr) return true;
  const keys = new Set([...Object.keys(prev), ...Object.keys(curr)]);
  for (const k of keys) {
    if (prev[k] !== curr[k]) return true;
  }
  return false;
}

function saveAutoSnapshot(vars, label) {
  const dir = getSnapshotsDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const name = `${label}-${ts}`;
  const filePath = path.join(dir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ name, vars, createdAt: new Date().toISOString() }, null, 2));
  return name;
}

function watchEnvFile(options = {}) {
  const { envFile, label = 'watch', interval = DEFAULT_INTERVAL_MS, onSnapshot, onError } = options;
  const filePath = getEnvFilePath(envFile);
  let lastVars = readEnvFile(filePath);

  const timer = setInterval(() => {
    try {
      const current = readEnvFile(filePath);
      if (snapshotChanged(lastVars, current)) {
        const name = saveAutoSnapshot(current || {}, label);
        lastVars = current;
        if (onSnapshot) onSnapshot(name, current);
      }
    } catch (err) {
      if (onError) onError(err);
    }
  }, interval);

  return {
    stop: () => clearInterval(timer),
    filePath,
  };
}

module.exports = { watchEnvFile, readEnvFile, snapshotChanged, saveAutoSnapshot, getEnvFilePath };
