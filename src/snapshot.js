const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Get the default snapshots directory
 */
function getSnapshotsDir() {
  return path.join(process.cwd(), '.envsnap');
}

/**
 * Create a snapshot of current environment variables
 * @param {string} name - Name for the snapshot
 * @param {Object} options - Options for snapshot creation
 * @returns {Promise<Object>} Snapshot metadata
 */
async function createSnapshot(name, options = {}) {
  const timestamp = new Date().toISOString();
  const snapshotsDir = getSnapshotsDir();
  
  // Ensure snapshots directory exists
  await fs.mkdir(snapshotsDir, { recursive: true });
  
  // Filter environment variables
  const envVars = options.filterPrefix 
    ? Object.keys(process.env)
        .filter(key => key.startsWith(options.filterPrefix))
        .reduce((obj, key) => ({ ...obj, [key]: process.env[key] }), {})
    : { ...process.env };
  
  const snapshot = {
    name,
    timestamp,
    hostname: os.hostname(),
    platform: os.platform(),
    variables: envVars,
    count: Object.keys(envVars).length
  };
  
  const filename = `${name}-${Date.now()}.json`;
  const filepath = path.join(snapshotsDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(snapshot, null, 2));
  
  return {
    name,
    filepath,
    timestamp,
    count: snapshot.count
  };
}

/**
 * List all snapshots
 * @returns {Promise<Array>} List of snapshot metadata
 */
async function listSnapshots() {
  const snapshotsDir = getSnapshotsDir();
  
  try {
    const files = await fs.readdir(snapshotsDir);
    const snapshots = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(snapshotsDir, file);
        const content = await fs.readFile(filepath, 'utf-8');
        const snapshot = JSON.parse(content);
        snapshots.push({
          name: snapshot.name,
          timestamp: snapshot.timestamp,
          count: snapshot.count,
          filepath
        });
      }
    }
    
    return snapshots.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

module.exports = {
  createSnapshot,
  listSnapshots,
  getSnapshotsDir
};
