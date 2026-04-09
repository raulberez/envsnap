#!/usr/bin/env node

const { createSnapshot, listSnapshots } = require('./snapshot');

/**
 * Main entry point for the envsnap CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'snap':
      case 'create': {
        const name = args[1] || `snapshot-${Date.now()}`;
        const filterPrefix = args.includes('--filter') 
          ? args[args.indexOf('--filter') + 1] 
          : null;
        
        const options = filterPrefix ? { filterPrefix } : {};
        const result = await createSnapshot(name, options);
        
        console.log(`✓ Snapshot created: ${result.name}`);
        console.log(`  Variables: ${result.count}`);
        console.log(`  Location: ${result.filepath}`);
        break;
      }

      case 'list':
      case 'ls': {
        const snapshots = await listSnapshots();
        
        if (snapshots.length === 0) {
          console.log('No snapshots found.');
          console.log('Create one with: envsnap snap <name>');
        } else {
          console.log(`Found ${snapshots.length} snapshot(s):\n`);
          snapshots.forEach((snap, index) => {
            const date = new Date(snap.timestamp).toLocaleString();
            console.log(`${index + 1}. ${snap.name}`);
            console.log(`   ${date} (${snap.count} variables)`);
          });
        }
        break;
      }

      case 'help':
      case '--help':
      case '-h':
      default: {
        console.log('envsnap - Environment variable snapshot tool\n');
        console.log('Usage:');
        console.log('  envsnap snap [name]          Create a snapshot');
        console.log('  envsnap snap [name] --filter PREFIX  Snapshot only vars with prefix');
        console.log('  envsnap list                 List all snapshots');
        console.log('  envsnap help                 Show this help\n');
        console.log('Examples:');
        console.log('  envsnap snap production');
        console.log('  envsnap snap dev --filter APP_');
        console.log('  envsnap list');
        break;
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
