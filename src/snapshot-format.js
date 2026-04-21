const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

const VALID_FORMATS = ['dotenv', 'json', 'shell', 'csv'];

function getFormatsFile(baseDir) {
  return path.join(baseDir || getSnapshotsDir(), '.formats.json');
}

function loadFormats(baseDir) {
  const file = getFormatsFile(baseDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveFormats(formats, baseDir) {
  const file = getFormatsFile(baseDir);
  fs.writeFileSync(file, JSON.stringify(formats, null, 2));
}

function setFormat(name, format, baseDir) {
  if (!VALID_FORMATS.includes(format)) {
    throw new Error(`Invalid format "${format}". Must be one of: ${VALID_FORMATS.join(', ')}`);
  }
  const formats = loadFormats(baseDir);
  formats[name] = format;
  saveFormats(formats, baseDir);
  return format;
}

function getFormat(name, baseDir) {
  const formats = loadFormats(baseDir);
  return formats[name] || null;
}

function removeFormat(name, baseDir) {
  const formats = loadFormats(baseDir);
  if (!formats[name]) return false;
  delete formats[name];
  saveFormats(formats, baseDir);
  return true;
}

function listFormats(baseDir) {
  return loadFormats(baseDir);
}

function formatFormatEntry(name, format) {
  return `${name}: ${format}`;
}

module.exports = {
  getFormatsFile,
  loadFormats,
  saveFormats,
  setFormat,
  getFormat,
  removeFormat,
  listFormats,
  formatFormatEntry,
  VALID_FORMATS,
};
