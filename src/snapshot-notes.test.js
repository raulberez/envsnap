const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-notes-'));
  jest.resetModules();
  mod = require('./snapshot-notes');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadNotes returns empty object when file missing', () => {
  expect(mod.loadNotes(tmpDir)).toEqual({});
});

test('setNote creates a note entry', () => {
  const result = mod.setNote('snap1', 'initial staging env', tmpDir);
  expect(result.text).toBe('initial staging env');
  expect(result.updatedAt).toBeDefined();
});

test('getNote returns saved note', () => {
  mod.setNote('snap1', 'my note', tmpDir);
  const note = mod.getNote('snap1', tmpDir);
  expect(note).not.toBeNull();
  expect(note.text).toBe('my note');
});

test('getNote returns null for unknown snapshot', () => {
  expect(mod.getNote('nonexistent', tmpDir)).toBeNull();
});

test('setNote overwrites existing note', () => {
  mod.setNote('snap1', 'first', tmpDir);
  mod.setNote('snap1', 'second', tmpDir);
  expect(mod.getNote('snap1', tmpDir).text).toBe('second');
});

test('removeNote deletes the note and returns true', () => {
  mod.setNote('snap1', 'to delete', tmpDir);
  const result = mod.removeNote('snap1', tmpDir);
  expect(result).toBe(true);
  expect(mod.getNote('snap1', tmpDir)).toBeNull();
});

test('removeNote returns false when note does not exist', () => {
  expect(mod.removeNote('ghost', tmpDir)).toBe(false);
});

test('setNote throws on empty name', () => {
  expect(() => mod.setNote('', 'note', tmpDir)).toThrow();
});

test('formatNotesList returns no notes message when empty', () => {
  expect(mod.formatNotesList({})).toBe('No notes found.');
});

test('formatNotesList formats notes correctly', () => {
  mod.setNote('snap1', 'hello', tmpDir);
  mod.setNote('snap2', 'world', tmpDir);
  const notes = mod.loadNotes(tmpDir);
  const output = mod.formatNotesList(notes);
  expect(output).toContain('snap1');
  expect(output).toContain('hello');
  expect(output).toContain('snap2');
  expect(output).toContain('world');
});
