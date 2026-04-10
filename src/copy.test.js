const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

jest.mock('./snapshot', () => ({
  getSnapshotsDir: () => tmpDir,
}));

const { copySnapshot, snapshotExists } = require('./copy');

function writeSnap(name, vars = {}) {
  const filePath = path.join(tmpDir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ name, vars, createdAt: '2024-01-01T00:00:00.000Z' }, null, 2));
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-copy-'));
  jest.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('snapshotExists', () => {
  it('returns true when snapshot file exists', () => {
    writeSnap('alpha');
    expect(snapshotExists('alpha')).toBe(true);
  });

  it('returns false when snapshot does not exist', () => {
    expect(snapshotExists('ghost')).toBe(false);
  });
});

describe('copySnapshot', () => {
  it('copies a snapshot to a new name', () => {
    writeSnap('base', { NODE_ENV: 'production' });
    const result = copySnapshot('base', 'base-copy');
    expect(result.name).toBe('base-copy');
    expect(result.copiedFrom).toBe('base');
    expect(result.vars).toEqual({ NODE_ENV: 'production' });
    expect(snapshotExists('base-copy')).toBe(true);
  });

  it('throws if source does not exist', () => {
    expect(() => copySnapshot('missing', 'dest')).toThrow('does not exist');
  });

  it('throws if destination already exists', () => {
    writeSnap('src');
    writeSnap('dest');
    expect(() => copySnapshot('src', 'dest')).toThrow('already exists');
  });

  it('throws if source and destination are the same', () => {
    writeSnap('same');
    expect(() => copySnapshot('same', 'same')).toThrow('must be different');
  });

  it('throws if source name is empty', () => {
    expect(() => copySnapshot('', 'dest')).toThrow('Source snapshot name is required');
  });

  it('preserves original snapshot after copy', () => {
    writeSnap('original', { KEY: 'value' });
    copySnapshot('original', 'clone');
    expect(snapshotExists('original')).toBe(true);
  });
});
