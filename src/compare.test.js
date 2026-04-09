const fs = require('fs');
const path = require('path');
const os = require('os');
const { compareMultiple, formatComparisonTable } = require('./compare');

jest.mock('./snapshot', () => ({
  getSnapshotsDir: () => tmpDir,
}));

let tmpDir;

function writeSnap(name, env) {
  fs.writeFileSync(
    path.join(tmpDir, `${name}.json`),
    JSON.stringify({ name, env, createdAt: new Date().toISOString() })
  );
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-compare-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('compareMultiple', () => {
  it('throws if fewer than two snapshots provided', () => {
    expect(() => compareMultiple(['only-one'])).toThrow('At least two');
  });

  it('throws if a snapshot file does not exist', () => {
    writeSnap('snap-a', { FOO: 'bar' });
    expect(() => compareMultiple(['snap-a', 'missing'])).toThrow('Snapshot not found');
  });

  it('returns all keys across both snapshots', () => {
    writeSnap('snap-a', { FOO: 'bar', SHARED: '1' });
    writeSnap('snap-b', { BAZ: 'qux', SHARED: '1' });
    const result = compareMultiple(['snap-a', 'snap-b']);
    const keys = result.rows.map(r => r.key);
    expect(keys).toContain('FOO');
    expect(keys).toContain('BAZ');
    expect(keys).toContain('SHARED');
  });

  it('marks conflicting values correctly', () => {
    writeSnap('snap-a', { PORT: '3000' });
    writeSnap('snap-b', { PORT: '4000' });
    const result = compareMultiple(['snap-a', 'snap-b']);
    const portRow = result.rows.find(r => r.key === 'PORT');
    expect(portRow.hasConflict).toBe(true);
  });

  it('does not mark matching values as conflict', () => {
    writeSnap('snap-a', { NODE_ENV: 'production' });
    writeSnap('snap-b', { NODE_ENV: 'production' });
    const result = compareMultiple(['snap-a', 'snap-b']);
    const row = result.rows.find(r => r.key === 'NODE_ENV');
    expect(row.hasConflict).toBe(false);
  });

  it('marks missing keys in the appropriate snapshot', () => {
    writeSnap('snap-a', { ONLY_A: 'yes' });
    writeSnap('snap-b', {});
    const result = compareMultiple(['snap-a', 'snap-b']);
    const row = result.rows.find(r => r.key === 'ONLY_A');
    expect(row.missingIn).toContain('snap-b');
  });
});

describe('formatComparisonTable', () => {
  it('includes snapshot names in header', () => {
    writeSnap('alpha', { X: '1' });
    writeSnap('beta', { X: '2' });
    const result = compareMultiple(['alpha', 'beta']);
    const output = formatComparisonTable(result);
    expect(output).toContain('alpha');
    expect(output).toContain('beta');
  });

  it('marks conflicting rows with asterisk', () => {
    writeSnap('s1', { KEY: 'aaa' });
    writeSnap('s2', { KEY: 'bbb' });
    const result = compareMultiple(['s1', 's2']);
    const output = formatComparisonTable(result);
    expect(output).toMatch(/\*.*KEY/);
  });
});
