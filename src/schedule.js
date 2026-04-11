const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getScheduleFile(baseDir) {
  return path.join(getSnapshotsDir(baseDir), '.schedule.json');
}

function loadSchedule(baseDir) {
  const file = getScheduleFile(baseDir);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function saveSchedule(entries, baseDir) {
  const file = getScheduleFile(baseDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(entries, null, 2));
}

function addSchedule(name, cron, label, baseDir) {
  const entries = loadSchedule(baseDir);
  const existing = entries.findIndex(e => e.name === name);
  const entry = { name, cron, label: label || name, createdAt: new Date().toISOString() };
  if (existing >= 0) {
    entries[existing] = entry;
  } else {
    entries.push(entry);
  }
  saveSchedule(entries, baseDir);
  return entry;
}

function removeSchedule(name, baseDir) {
  const entries = loadSchedule(baseDir);
  const next = entries.filter(e => e.name !== name);
  if (next.length === entries.length) {
    throw new Error(`No schedule found for snapshot: ${name}`);
  }
  saveSchedule(next, baseDir);
}

function getSchedule(name, baseDir) {
  const entries = loadSchedule(baseDir);
  return entries.find(e => e.name === name) || null;
}

function formatScheduleList(entries) {
  if (!entries.length) return 'No schedules configured.';
  return entries
    .map(e => `  ${e.name.padEnd(24)} ${e.cron.padEnd(20)} ${e.label}`)
    .join('\n');
}

module.exports = {
  getScheduleFile,
  loadSchedule,
  saveSchedule,
  addSchedule,
  removeSchedule,
  getSchedule,
  formatScheduleList,
};
