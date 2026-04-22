const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getTtlFile(dir) {
  return path.join(dir || getSnapshotsDir(), 'ttl.json');
}

function loadTtls(dir) {
  const file = getTtlFile(dir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveTtls(ttls, dir) {
  const file = getTtlFile(dir);
  fs.writeFileSync(file, JSON.stringify(ttls, null, 2));
}

function setTtl(name, seconds, dir) {
  if (typeof seconds !== 'number' || seconds <= 0) {
    throw new Error('TTL must be a positive number of seconds');
  }
  const ttls = loadTtls(dir);
  const expiresAt = Date.now() + seconds * 1000;
  ttls[name] = { seconds, expiresAt, setAt: Date.now() };
  saveTtls(ttls, dir);
  return ttls[name];
}

function getTtl(name, dir) {
  const ttls = loadTtls(dir);
  return ttls[name] || null;
}

function removeTtl(name, dir) {
  const ttls = loadTtls(dir);
  if (!ttls[name]) return false;
  delete ttls[name];
  saveTtls(ttls, dir);
  return true;
}

function isExpired(name, dir) {
  const entry = getTtl(name, dir);
  if (!entry) return false;
  return Date.now() > entry.expiresAt;
}

function getExpiredSnapshots(dir) {
  const ttls = loadTtls(dir);
  const now = Date.now();
  return Object.entries(ttls)
    .filter(([, v]) => now > v.expiresAt)
    .map(([name]) => name);
}

function formatTtl(name, dir) {
  const entry = getTtl(name, dir);
  if (!entry) return `${name}: no TTL set`;
  const remaining = Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));
  const expired = Date.now() > entry.expiresAt;
  return expired
    ? `${name}: expired (was ${entry.seconds}s TTL)`
    : `${name}: ${remaining}s remaining (${entry.seconds}s TTL)`;
}

module.exports = {
  getTtlFile,
  loadTtls,
  saveTtls,
  setTtl,
  getTtl,
  removeTtl,
  isExpired,
  getExpiredSnapshots,
  formatTtl,
};
