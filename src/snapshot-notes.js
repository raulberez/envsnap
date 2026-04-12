const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getNotesFile() {
  return path.join(getSnapshotsDir(), 'notes.json');
}

function loadNotes() {
  const file = getNotesFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveNotes(notes) {
  const file = getNotesFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(notes, null, 2));
}

function setNote(snapshotName, note) {
  const notes = loadNotes();
  notes[snapshotName] = { text: note, updatedAt: new Date().toISOString() };
  saveNotes(notes);
  return notes[snapshotName];
}

function getNote(snapshotName) {
  const notes = loadNotes();
  return notes[snapshotName] || null;
}

function deleteNote(snapshotName) {
  const notes = loadNotes();
  if (!notes[snapshotName]) return false;
  delete notes[snapshotName];
  saveNotes(notes);
  return true;
}

function listNotes() {
  return loadNotes();
}

function formatNotesList(notes) {
  const entries = Object.entries(notes);
  if (entries.length === 0) return 'No notes found.';
  return entries
    .map(([name, { text, updatedAt }]) => `${name} (${updatedAt.slice(0, 10)}): ${text}`)
    .join('\n');
}

module.exports = {
  getNotesFile,
  loadNotes,
  saveNotes,
  setNote,
  getNote,
  deleteNote,
  listNotes,
  formatNotesList,
};
