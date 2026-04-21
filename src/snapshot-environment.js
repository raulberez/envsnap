const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getEnvironmentFile() {
  return path.join(getSnapshotsDir(), '.environments.json');
}

function loadEnvironments() {
  const file = getEnvironmentFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveEnvironments(envs) {
  const file = getEnvironmentFile();
  fs.writeFileSync(file, JSON.stringify(envs, null, 2));
}

function setEnvironment(snapshotName, environment) {
  if (!environment || typeof environment !== 'string') {
    throw new Error('Environment must be a non-empty string');
  }
  const envs = loadEnvironments();
  envs[snapshotName] = environment.trim().toLowerCase();
  saveEnvironments(envs);
  return envs[snapshotName];
}

function getEnvironment(snapshotName) {
  const envs = loadEnvironments();
  return envs[snapshotName] || null;
}

function removeEnvironment(snapshotName) {
  const envs = loadEnvironments();
  if (!envs[snapshotName]) return false;
  delete envs[snapshotName];
  saveEnvironments(envs);
  return true;
}

function listByEnvironment(environment) {
  const envs = loadEnvironments();
  const target = environment.trim().toLowerCase();
  return Object.entries(envs)
    .filter(([, env]) => env === target)
    .map(([name]) => name);
}

function getAllEnvironments() {
  const envs = loadEnvironments();
  const unique = [...new Set(Object.values(envs))];
  return unique.sort();
}

module.exports = {
  getEnvironmentFile,
  loadEnvironments,
  saveEnvironments,
  setEnvironment,
  getEnvironment,
  removeEnvironment,
  listByEnvironment,
  getAllEnvironments,
};
