const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getAliasFile() {
  return path.join(getSnapshotsDir(), '.aliases.json');
}

function loadAliases() {
  const file = getAliasFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveAliases(aliases) {
  const file = getAliasFile();
  fs.writeFileSync(file, JSON.stringify(aliases, null, 2));
}

function addAlias(alias, snapshotName) {
  if (!alias || !snapshotName) throw new Error('Alias and snapshot name are required');
  const aliases = loadAliases();
  aliases[alias] = snapshotName;
  saveAliases(aliases);
  return aliases;
}

function removeAlias(alias) {
  const aliases = loadAliases();
  if (!aliases[alias]) throw new Error(`Alias "${alias}" not found`);
  delete aliases[alias];
  saveAliases(aliases);
  return aliases;
}

function resolveAlias(nameOrAlias) {
  const aliases = loadAliases();
  return aliases[nameOrAlias] || nameOrAlias;
}

function listAliases() {
  return loadAliases();
}

function formatAliasList(aliases) {
  const entries = Object.entries(aliases);
  if (entries.length === 0) return 'No aliases defined.';
  return entries.map(([alias, snap]) => `  ${alias} -> ${snap}`).join('\n');
}

module.exports = {
  getAliasFile,
  loadAliases,
  saveAliases,
  addAlias,
  removeAlias,
  resolveAlias,
  listAliases,
  formatAliasList,
};
