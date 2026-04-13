const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getLabelsFile() {
  return path.join(getSnapshotsDir(), 'labels.json');
}

function loadLabels() {
  const file = getLabelsFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveLabels(labels) {
  const file = getLabelsFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(labels, null, 2));
}

function setLabel(snapshotName, label) {
  if (!snapshotName || !label) throw new Error('snapshot name and label are required');
  const labels = loadLabels();
  labels[snapshotName] = label.trim();
  saveLabels(labels);
  return labels[snapshotName];
}

function getLabel(snapshotName) {
  const labels = loadLabels();
  return labels[snapshotName] || null;
}

function removeLabel(snapshotName) {
  const labels = loadLabels();
  if (!labels[snapshotName]) return false;
  delete labels[snapshotName];
  saveLabels(labels);
  return true;
}

function listLabels() {
  return loadLabels();
}

function findByLabel(label) {
  const labels = loadLabels();
  return Object.entries(labels)
    .filter(([, v]) => v.toLowerCase().includes(label.toLowerCase()))
    .map(([k]) => k);
}

module.exports = {
  getLabelsFile,
  loadLabels,
  saveLabels,
  setLabel,
  getLabel,
  removeLabel,
  listLabels,
  findByLabel,
};
