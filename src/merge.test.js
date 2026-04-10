const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-merge-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeSnap(name, vars) {
  fs.writeFileSync(
    path.join(tmpDir, `${name}.json`),
    JSON.stringify({ vars, createdAt: new Date().toISOString() })
  );
}

test('mergeSnapshots combines two snapshots with no conflicts', () => {
  writeSnap('a', { FOO: '1', BAR: '2' });
  writeSnap('b', { BAZ: '3' });
  const { mergeSnapshots } = require('./merge');
  const { merged, conflicts } = mergeSnapshots(['a', 'b']);
  expect(merged).toEqual({ FOO: '1', BAR: '2', BAZ: '3' });
  expect(Object.keys(conflicts)).toHaveLength(0);
});

test('mergeSnapshots detects conflicts and applies last-wins by default', () => {
  writeSnap('a', { FOO: 'from-a' });
  writeSnap('b', { FOO: 'from-b' });
  const { mergeSnapshots } = require('./merge');
  const { merged, conflicts } = mergeSnapshots(['a', 'b']);
  expect(merged.FOO).toBe('from-b');
  expect(conflicts.FOO).toHaveLength(2);
  expect(conflicts.FOO[0].source).toBe('a');
  expect(conflicts.FOO[1].source).toBe('b');
});

test('mergeSnapshots throws when fewer than two names provided', () => {
  const { mergeSnapshots } = require('./merge');
  expect(() => mergeSnapshots(['only-one'])).toThrow('At least two snapshot names are required');
});

test('mergeSnapshots throws when a snapshot does not exist', () => {
  writeSnap('exists', { A: '1' });
  const { mergeSnapshots } = require('./merge');
  expect(() => mergeSnapshots(['exists', 'missing'])).toThrow('Snapshot "missing" not found');
});

test('saveMergedSnapshot writes file and can be reloaded', () => {
  const { saveMergedSnapshot, loadSnapshot } = require('./merge');
  saveMergedSnapshot('result', { X: '42' });
  const data = loadSnapshot('result');
  expect(data.vars).toEqual({ X: '42' });
  expect(data.mergedSnapshot).toBe(true);
});
