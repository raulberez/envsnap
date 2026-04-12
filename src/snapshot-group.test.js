const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getGroupsFile,
  loadGroups,
  addToGroup,
  removeFromGroup,
  deleteGroup,
  getGroup,
  formatGroupList
} = require('./snapshot-group');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-group-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadGroups returns empty object when no file', () => {
  expect(loadGroups(tmpDir)).toEqual({});
});

test('addToGroup creates group and adds snapshot', () => {
  const members = addToGroup('staging', 'snap1', tmpDir);
  expect(members).toContain('snap1');
  expect(getGroup('staging', tmpDir)).toEqual(['snap1']);
});

test('addToGroup does not duplicate entries', () => {
  addToGroup('staging', 'snap1', tmpDir);
  const members = addToGroup('staging', 'snap1', tmpDir);
  expect(members.length).toBe(1);
});

test('addToGroup supports multiple snapshots', () => {
  addToGroup('staging', 'snap1', tmpDir);
  addToGroup('staging', 'snap2', tmpDir);
  expect(getGroup('staging', tmpDir)).toEqual(['snap1', 'snap2']);
});

test('removeFromGroup removes snapshot from group', () => {
  addToGroup('staging', 'snap1', tmpDir);
  addToGroup('staging', 'snap2', tmpDir);
  removeFromGroup('staging', 'snap1', tmpDir);
  expect(getGroup('staging', tmpDir)).toEqual(['snap2']);
});

test('removeFromGroup deletes group when empty', () => {
  addToGroup('staging', 'snap1', tmpDir);
  removeFromGroup('staging', 'snap1', tmpDir);
  expect(getGroup('staging', tmpDir)).toBeNull();
});

test('deleteGroup removes group entirely', () => {
  addToGroup('prod', 'snap1', tmpDir);
  deleteGroup('prod', tmpDir);
  expect(getGroup('prod', tmpDir)).toBeNull();
});

test('deleteGroup throws if group not found', () => {
  expect(() => deleteGroup('nonexistent', tmpDir)).toThrow("Group 'nonexistent' not found");
});

test('formatGroupList returns message for empty groups', () => {
  expect(formatGroupList({})).toBe('No groups defined.');
});

test('formatGroupList formats groups correctly', () => {
  const groups = { staging: ['snap1', 'snap2'], prod: ['snap3'] };
  const result = formatGroupList(groups);
  expect(result).toContain('staging: snap1, snap2');
  expect(result).toContain('prod: snap3');
});
