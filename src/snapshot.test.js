const { createSnapshot, listSnapshots, getSnapshotsDir } = require('./snapshot');
const fs = require('fs').promises;
const path = require('path');

// Mock process.env for testing
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    NODE_ENV: 'test',
    API_KEY: 'test-key-123',
    DATABASE_URL: 'postgres://localhost',
    APP_DEBUG: 'true'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Snapshot Module', () => {
  const testSnapshotsDir = path.join(process.cwd(), '.envsnap');

  afterAll(async () => {
    // Cleanup test snapshots
    try {
      const files = await fs.readdir(testSnapshotsDir);
      for (const file of files) {
        if (file.startsWith('test-')) {
          await fs.unlink(path.join(testSnapshotsDir, file));
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  });

  describe('createSnapshot', () => {
    test('creates a snapshot with all environment variables', async () => {
      const result = await createSnapshot('test-snapshot');
      
      expect(result).toHaveProperty('name', 'test-snapshot');
      expect(result).toHaveProperty('filepath');
      expect(result).toHaveProperty('timestamp');
      expect(result.count).toBeGreaterThan(0);
      
      // Verify file exists
      const content = await fs.readFile(result.filepath, 'utf-8');
      const snapshot = JSON.parse(content);
      expect(snapshot.variables).toHaveProperty('NODE_ENV', 'test');
      expect(snapshot.variables).toHaveProperty('API_KEY', 'test-key-123');
    });

    test('filters environment variables by prefix', async () => {
      const result = await createSnapshot('test-filtered', { filterPrefix: 'API_' });
      
      const content = await fs.readFile(result.filepath, 'utf-8');
      const snapshot = JSON.parse(content);
      
      expect(snapshot.variables).toHaveProperty('API_KEY');
      expect(snapshot.variables).not.toHaveProperty('NODE_ENV');
      expect(result.count).toBe(1);
    });
  });

  describe('listSnapshots', () => {
    test('returns empty array when no snapshots exist', async () => {
      const snapshots = await listSnapshots();
      expect(Array.isArray(snapshots)).toBe(true);
    });

    test('lists all snapshots sorted by timestamp', async () => {
      await createSnapshot('test-first');
      await new Promise(resolve => setTimeout(resolve, 10));
      await createSnapshot('test-second');
      
      const snapshots = await listSnapshots();
      const testSnapshots = snapshots.filter(s => s.name.startsWith('test-'));
      
      expect(testSnapshots.length).toBeGreaterThanOrEqual(2);
      expect(testSnapshots[0].name).toBe('test-second');
    });
  });
});
