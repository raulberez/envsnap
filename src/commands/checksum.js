const {
  recordChecksum,
  verifyChecksum,
  removeChecksum,
  loadChecksums,
  formatChecksumResult,
} = require('../snapshot-checksum');

function registerChecksumCommand(program) {
  const cmd = program.command('checksum').description('Manage snapshot checksums for integrity verification');

  cmd
    .command('record <snapshot>')
    .description('Record a checksum for a snapshot')
    .action((snapshot) => {
      try {
        const entry = recordChecksum(snapshot);
        console.log(`Checksum recorded for '${snapshot}': ${entry.hash.slice(0, 16)}…`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('verify <snapshot>')
    .description('Verify the integrity of a snapshot against its recorded checksum')
    .action((snapshot) => {
      try {
        const result = verifyChecksum(snapshot);
        console.log(formatChecksumResult(result, snapshot));
        if (!result.verified) process.exit(1);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('remove <snapshot>')
    .description('Remove the recorded checksum for a snapshot')
    .action((snapshot) => {
      const removed = removeChecksum(snapshot);
      if (removed) {
        console.log(`Checksum removed for '${snapshot}'.`);
      } else {
        console.log(`No checksum found for '${snapshot}'.`);
      }
    });

  cmd
    .command('list')
    .description('List all recorded checksums')
    .action(() => {
      const checksums = loadChecksums();
      const names = Object.keys(checksums);
      if (names.length === 0) {
        console.log('No checksums recorded.');
        return;
      }
      names.forEach((name) => {
        const { hash, recordedAt } = checksums[name];
        console.log(`${name}  ${hash.slice(0, 16)}…  ${recordedAt}`);
      });
    });
}

module.exports = { registerChecksumCommand };
