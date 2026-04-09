const fs = require('fs');
const path = require('path');
const os = require('os');
const { getSnapshotMeta, pruneByAge, pruneByCount } = require('./prune');
const { getSnapshotsDir } = require('./snapshot');

jest.mock('./snapshot');

describe('prune', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-prune-'));
    getSnapshotsDir.mockReturnValue(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeSnap(name, daysAgo = 0) {
    const file = path.join(tmpDir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify({ vars: {} }));
    const mtime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    fs.utimesSync(file, mtime, mtime);
    return file;
  }

  describe('getSnapshotMeta', () => {
    it('returns empty array when dir does not exist', () => {
      getSnapshotsDir.mockReturnValue('/nonexistent/path');
      expect(getSnapshotMeta('myproject')).toEqual([]);
    });

    it('returns sorted metadata for snapshots', () => {
      writeSnap('snap-a', 5);
      writeSnap('snap-b', 1);
      const meta = getSnapshotMeta('myproject');
      expect(meta).toHaveLength(2);
      expect(meta[0].name).toBe('snap-a');
      expect(meta[1].name).toBe('snap-b');
    });
  });

  describe('pruneByAge', () => {
    it('deletes snapshots older than given days', () => {
      writeSnap('old-snap', 10);
      writeSnap('recent-snap', 2);
      const deleted = pruneByAge('myproject', 7);
      expect(deleted).toEqual(['old-snap']);
      expect(fs.existsSync(path.join(tmpDir, 'old-snap.json'))).toBe(false);
      expect(fs.existsSync(path.join(tmpDir, 'recent-snap.json'))).toBe(true);
    });

    it('returns empty array when nothing is old enough', () => {
      writeSnap('fresh', 1);
      expect(pruneByAge('myproject', 7)).toEqual([]);
    });
  });

  describe('pruneByCount', () => {
    it('keeps only the N most recent snapshots', () => {
      writeSnap('snap-1', 9);
      writeSnap('snap-2', 6);
      writeSnap('snap-3', 3);
      writeSnap('snap-4', 1);
      const deleted = pruneByCount('myproject', 2);
      expect(deleted).toHaveLength(2);
      expect(deleted).toContain('snap-1');
      expect(deleted).toContain('snap-2');
      expect(fs.existsSync(path.join(tmpDir, 'snap-3.json'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'snap-4.json'))).toBe(true);
    });

    it('does nothing when count is within limit', () => {
      writeSnap('snap-1', 2);
      expect(pruneByCount('myproject', 5)).toEqual([]);
    });
  });
});
