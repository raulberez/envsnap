const { compareSnapshots, diffSnapshots, formatDiff } = require('./diff');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

jest.mock('./snapshot', () => ({
  getSnapshotsDir: () => path.join(os.tmpdir(), 'envsnap-test-diff')
}));

describe('diff module', () => {
  const testDir = path.join(os.tmpdir(), 'envsnap-test-diff');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('compareSnapshots', () => {
    test('detects added variables', () => {
      const snap1 = { variables: { FOO: 'bar' } };
      const snap2 = { variables: { FOO: 'bar', BAZ: 'qux' } };
      
      const result = compareSnapshots(snap1, snap2);
      
      expect(result.added).toEqual({ BAZ: 'qux' });
      expect(result.removed).toEqual({});
      expect(result.modified).toEqual({});
    });

    test('detects removed variables', () => {
      const snap1 = { variables: { FOO: 'bar', BAZ: 'qux' } };
      const snap2 = { variables: { FOO: 'bar' } };
      
      const result = compareSnapshots(snap1, snap2);
      
      expect(result.removed).toEqual({ BAZ: 'qux' });
      expect(result.added).toEqual({});
    });

    test('detects modified variables', () => {
      const snap1 = { variables: { FOO: 'bar' } };
      const snap2 = { variables: { FOO: 'baz' } };
      
      const result = compareSnapshots(snap1, snap2);
      
      expect(result.modified).toEqual({ FOO: { old: 'bar', new: 'baz' } });
    });

    test('tracks unchanged variables', () => {
      const snap1 = { variables: { FOO: 'bar', SAME: 'value' } };
      const snap2 = { variables: { FOO: 'baz', SAME: 'value' } };
      
      const result = compareSnapshots(snap1, snap2);
      
      expect(result.unchanged).toEqual({ SAME: 'value' });
    });
  });

  describe('diffSnapshots', () => {
    test('loads and compares two snapshots', async () => {
      const snap1 = {
        timestamp: '2024-01-01T00:00:00.000Z',
        variables: { FOO: 'bar' }
      };
      const snap2 = {
        timestamp: '2024-01-02T00:00:00.000Z',
        variables: { FOO: 'baz' }
      };

      await fs.writeFile(
        path.join(testDir, 'test1.json'),
        JSON.stringify(snap1)
      );
      await fs.writeFile(
        path.join(testDir, 'test2.json'),
        JSON.stringify(snap2)
      );

      const result = await diffSnapshots('test1', 'test2');

      expect(result.name1).toBe('test1');
      expect(result.name2).toBe('test2');
      expect(result.diff.modified).toEqual({ FOO: { old: 'bar', new: 'baz' } });
    });

    test('throws error for missing snapshot', async () => {
      await expect(diffSnapshots('missing1', 'missing2'))
        .rejects.toThrow('Snapshot not found');
    });
  });

  describe('formatDiff', () => {
    test('formats diff output correctly', () => {
      const diffResult = {
        diff: {
          added: { NEW: 'value' },
          removed: { OLD: 'value' },
          modified: { CHANGED: { old: 'old', new: 'new' } },
          unchanged: {}
        }
      };

      const output = formatDiff(diffResult);

      expect(output).toContain('+ Added:');
      expect(output).toContain('+ NEW=value');
      expect(output).toContain('- Removed:');
      expect(output).toContain('- OLD=value');
      expect(output).toContain('~ Modified:');
      expect(output).toContain('~ CHANGED');
    });
  });
});
