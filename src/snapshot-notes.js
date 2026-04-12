const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getNotesFile(snapshotsDir) {
  return path.join(snapshotsDir || getSnapshotsDir(), '.notes.json');
}

function loadNotes(snapshotsDir) {
  const file = getNotesFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveNotes(notes, snapshotsDir) {
  const file = getNotesFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(notes, null, 2));
}

function setNote(snapshotName, note, snapshotsDir) {
  if (!snapshotName || typeof snapshotName !== 'string') {
    throw new Error('Snapshot name is required');
  }
  const notes = loadNotes(snapshotsDir);
  notes[snapshotName] = { text: note, updatedAt: new Date().toISOString() };
  saveNotes(notes, snapshotsDir);
  return notes[snapshotName];
}

function getNote(snapshotName, snapshotsDir) {
  const notes = loadNotes(snapshotsDir);
  return notes[snapshotName] || null;
}

function removeNote(snapshotName, snapshotsDir) {
  const notes = loadNotes(snapshotsDir);
  if (!notes[snapshotName]) return false;
  delete notes[snapshotName];
  saveNotes(notes, snapshotsDir);
  return true;
}

function formatNotesList(notes) {
  const entries = Object.entries(notes);
  if (entries.length === 0) return 'No notes found.';
  return entries
    .map(([name, { text, updatedAt }]) => {
      const date = new Date(updatedAt).toLocaleDateString();
      return `  ${name} (${date}): ${text}`;
    })
    .join('\n');
}

module.exports = {
  getNotesFile,
  loadNotes,
  saveNotes,
  setNote,
  getNote,
  removeNote,
  formatNotesList,
};
