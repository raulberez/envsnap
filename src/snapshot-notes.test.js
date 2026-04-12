const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-notes-'));
  jest.resetModules();
  jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  mod = require('./snapshot-notes');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadNotes returns empty object when no file', () => {
  expect(mod.loadNotes()).toEqual({});
});

test('setNote and getNote roundtrip', () => {
  mod.setNote('snap1', 'my note here');
  const note = mod.getNote('snap1');
  expect(note).not.toBeNull();
  expect(note.text).toBe('my note here');
  expect(note.updatedAt).toBeDefined();
});

test('getNote returns null for missing snapshot', () => {
  expect(mod.getNote('nonexistent')).toBeNull();
});

test('deleteNote removes existing note', () => {
  mod.setNote('snap2', 'delete me');
  const result = mod.deleteNote('snap2');
  expect(result).toBe(true);
  expect(mod.getNote('snap2')).toBeNull();
});

test('deleteNote returns false for missing note', () => {
  expect(mod.deleteNote('ghost')).toBe(false);
});

test('listNotes returns all notes', () => {
  mod.setNote('a', 'note a');
  mod.setNote('b', 'note b');
  const notes = mod.listNotes();
  expect(Object.keys(notes)).toHaveLength(2);
});

test('formatNotesList returns message when empty', () => {
  expect(mod.formatNotesList({})).toBe('No notes found.');
});

test('formatNotesList formats entries', () => {
  mod.setNote('mysnap', 'production config');
  const notes = mod.listNotes();
  const output = mod.formatNotesList(notes);
  expect(output).toContain('mysnap');
  expect(output).toContain('production config');
});
