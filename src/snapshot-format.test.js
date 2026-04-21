const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getFormatsFile,
  loadFormats,
  setFormat,
  getFormat,
  removeFormat,
  listFormats,
  formatFormatEntry,
  VALID_FORMATS,
} = require('./snapshot-format');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-format-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getFormatsFile returns path inside base dir', () => {
  const file = getFormatsFile(tmpDir);
  expect(file).toBe(path.join(tmpDir, '.formats.json'));
});

test('loadFormats returns empty object when file missing', () => {
  expect(loadFormats(tmpDir)).toEqual({});
});

test('setFormat saves a valid format', () => {
  setFormat('snap1', 'json', tmpDir);
  const formats = loadFormats(tmpDir);
  expect(formats['snap1']).toBe('json');
});

test('setFormat throws on invalid format', () => {
  expect(() => setFormat('snap1', 'xml', tmpDir)).toThrow('Invalid format');
});

test('getFormat returns saved format', () => {
  setFormat('snap2', 'shell', tmpDir);
  expect(getFormat('snap2', tmpDir)).toBe('shell');
});

test('getFormat returns null for unknown snapshot', () => {
  expect(getFormat('nope', tmpDir)).toBeNull();
});

test('removeFormat removes an existing entry', () => {
  setFormat('snap3', 'dotenv', tmpDir);
  const result = removeFormat('snap3', tmpDir);
  expect(result).toBe(true);
  expect(getFormat('snap3', tmpDir)).toBeNull();
});

test('removeFormat returns false for missing entry', () => {
  expect(removeFormat('ghost', tmpDir)).toBe(false);
});

test('listFormats returns all entries', () => {
  setFormat('a', 'csv', tmpDir);
  setFormat('b', 'json', tmpDir);
  const all = listFormats(tmpDir);
  expect(all).toEqual({ a: 'csv', b: 'json' });
});

test('formatFormatEntry returns formatted string', () => {
  expect(formatFormatEntry('mysnap', 'dotenv')).toBe('mysnap: dotenv');
});

test('VALID_FORMATS contains expected values', () => {
  expect(VALID_FORMATS).toContain('dotenv');
  expect(VALID_FORMATS).toContain('json');
  expect(VALID_FORMATS).toContain('shell');
  expect(VALID_FORMATS).toContain('csv');
});
