const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getRetentionFile(dir) {
  return path.join(dir || getSnapshotsDir(), '.retention.json');
}

function loadRetentions(dir) {
  const file = getRetentionFile(dir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveRetentions(retentions, dir) {
  const file = getRetentionFile(dir);
  fs.writeFileSync(file, JSON.stringify(retentions, null, 2));
}

function setRetention(name, days, dir) {
  if (typeof days !== 'number' || days <= 0) {
    throw new Error('Retention days must be a positive number');
  }
  const retentions = loadRetentions(dir);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  retentions[name] = { days, expiresAt: expiresAt.toISOString(), setAt: new Date().toISOString() };
  saveRetentions(retentions, dir);
  return retentions[name];
}

function getRetention(name, dir) {
  const retentions = loadRetentions(dir);
  return retentions[name] || null;
}

function removeRetention(name, dir) {
  const retentions = loadRetentions(dir);
  if (!retentions[name]) return false;
  delete retentions[name];
  saveRetentions(retentions, dir);
  return true;
}

function isExpired(name, dir) {
  const entry = getRetention(name, dir);
  if (!entry) return false;
  return new Date() > new Date(entry.expiresAt);
}

function listExpired(dir) {
  const retentions = loadRetentions(dir);
  return Object.entries(retentions)
    .filter(([, v]) => new Date() > new Date(v.expiresAt))
    .map(([name, v]) => ({ name, ...v }));
}

function formatRetentionList(retentions) {
  const entries = Object.entries(retentions);
  if (entries.length === 0) return 'No retention policies set.';
  return entries.map(([name, v]) => {
    const expired = new Date() > new Date(v.expiresAt);
    const status = expired ? '[EXPIRED]' : '[active]';
    return `${name}: ${v.days}d ${status} (expires ${v.expiresAt})`;
  }).join('\n');
}

module.exports = {
  getRetentionFile,
  loadRetentions,
  saveRetentions,
  setRetention,
  getRetention,
  removeRetention,
  isExpired,
  listExpired,
  formatRetentionList
};
