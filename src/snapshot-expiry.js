const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getExpiryFile(dir) {
  return path.join(dir || getSnapshotsDir(), '.expiry.json');
}

function loadExpiries(dir) {
  const file = getExpiryFile(dir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveExpiries(expiries, dir) {
  const file = getExpiryFile(dir);
  fs.writeFileSync(file, JSON.stringify(expiries, null, 2));
}

function setExpiry(name, expiresAt, dir) {
  const expiries = loadExpiries(dir);
  expiries[name] = new Date(expiresAt).toISOString();
  saveExpiries(expiries, dir);
}

function getExpiry(name, dir) {
  const expiries = loadExpiries(dir);
  return expiries[name] || null;
}

function clearExpiry(name, dir) {
  const expiries = loadExpiries(dir);
  delete expiries[name];
  saveExpiries(expiries, dir);
}

function isExpired(name, dir) {
  const expiry = getExpiry(name, dir);
  if (!expiry) return false;
  return new Date(expiry) <= new Date();
}

function listExpired(dir) {
  const expiries = loadExpiries(dir);
  const now = new Date();
  return Object.entries(expiries)
    .filter(([, date]) => new Date(date) <= now)
    .map(([name, date]) => ({ name, expiresAt: date }));
}

function formatExpiryList(entries) {
  if (!entries.length) return 'No expired snapshots.';
  const lines = entries.map(e => `  ${e.name}  (expired: ${new Date(e.expiresAt).toLocaleString()})`);
  return `Expired snapshots:\n${lines.join('\n')}`;
}

module.exports = {
  getExpiryFile,
  loadExpiries,
  saveExpiries,
  setExpiry,
  getExpiry,
  clearExpiry,
  isExpired,
  listExpired,
  formatExpiryList,
};
