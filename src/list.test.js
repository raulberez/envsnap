const fs = require('fs');
const path = require('path');
const os = require('os');
const { listSnapshots, formatList } = require('./list');
const { getSnapshotsDir } = require('./snapshot');

jest.mock('./snapshot');

describe('listSnapshots', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-test-'));
    getSnapshotsDir.mockReturnValue(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns empty array when directory does not exist', () => {
    getSnapshotsDir.mockReturnValue('/nonexistent/path');
    expect(listSnapshots('myproject')).toEqual([]);
  });

  it('returns empty array when no snapshots present', () => {
    expect(listSnapshots('myproject')).toEqual([]);
  });

  it('returns snapshot metadata for each json file', () => {
    const snap = { createdAt: '2024-01-15T10:00:00.000Z', env: { FOO: '1', BAR: '2' }, tags: ['prod'] };
    fs.writeFileSync(path.join(tmpDir, 'snap1.json'), JSON.stringify(snap));

    const result = listSnapshots('myproject');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('snap1');
    expect(result[0].varCount).toBe(2);
    expect(result[0].tags).toEqual(['prod']);
  });

  it('sorts snapshots newest first', () => {
    const older = { createdAt: '2024-01-01T00:00:00.000Z', env: {}, tags: [] };
    const newer = { createdAt: '2024-06-01T00:00:00.000Z', env: {}, tags: [] };
    fs.writeFileSync(path.join(tmpDir, 'old.json'), JSON.stringify(older));
    fs.writeFileSync(path.join(tmpDir, 'new.json'), JSON.stringify(newer));

    const result = listSnapshots('myproject');
    expect(result[0].name).toBe('new');
    expect(result[1].name).toBe('old');
  });
});

describe('formatList', () => {
  it('returns message when no snapshots', () => {
    expect(formatList([])).toBe('No snapshots found.');
  });

  it('formats snapshots with index, tags and var count', () => {
    const snapshots = [
      { name: 'prod-snap', createdAt: '2024-06-01T10:00:00.000Z', varCount: 5, tags: ['prod'] },
      { name: 'dev-snap', createdAt: '2024-05-01T10:00:00.000Z', varCount: 3, tags: [] },
    ];
    const output = formatList(snapshots);
    expect(output).toContain('1. prod-snap [prod]');
    expect(output).toContain('2. dev-snap');
    expect(output).toContain('Vars: 5');
    expect(output).toContain('Vars: 3');
  });
});
