const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-comment-'));
  jest.resetModules();
  mod = require('./snapshot-comment');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getComment returns null when no comments file exists', () => {
  expect(mod.getComment('snap1', tmpDir)).toBeNull();
});

test('setComment stores a comment with timestamp', () => {
  const entry = mod.setComment('snap1', 'initial deploy snapshot', tmpDir);
  expect(entry.text).toBe('initial deploy snapshot');
  expect(entry.updatedAt).toBeTruthy();
});

test('getComment retrieves stored comment', () => {
  mod.setComment('snap1', 'hello world', tmpDir);
  const entry = mod.getComment('snap1', tmpDir);
  expect(entry.text).toBe('hello world');
});

test('setComment overwrites existing comment', () => {
  mod.setComment('snap1', 'first', tmpDir);
  mod.setComment('snap1', 'second', tmpDir);
  expect(mod.getComment('snap1', tmpDir).text).toBe('second');
});

test('deleteComment removes the entry and returns true', () => {
  mod.setComment('snap1', 'to delete', tmpDir);
  const result = mod.deleteComment('snap1', tmpDir);
  expect(result).toBe(true);
  expect(mod.getComment('snap1', tmpDir)).toBeNull();
});

test('deleteComment returns false for missing snapshot', () => {
  expect(mod.deleteComment('nope', tmpDir)).toBe(false);
});

test('listComments returns all entries', () => {
  mod.setComment('a', 'comment a', tmpDir);
  mod.setComment('b', 'comment b', tmpDir);
  const all = mod.listComments(tmpDir);
  expect(Object.keys(all)).toHaveLength(2);
  expect(all.a.text).toBe('comment a');
});

test('formatComment returns formatted string', () => {
  mod.setComment('snap1', 'nice snap', tmpDir);
  const entry = mod.getComment('snap1', tmpDir);
  const out = mod.formatComment('snap1', entry);
  expect(out).toContain('snap1');
  expect(out).toContain('nice snap');
});

test('formatComment handles null entry', () => {
  const out = mod.formatComment('missing', null);
  expect(out).toContain('No comment');
});
