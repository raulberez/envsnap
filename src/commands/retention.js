const {
  setRetention,
  getRetention,
  removeRetention,
  loadRetentions,
  listExpired,
  formatRetentionList
} = require('../snapshot-retention');

function registerRetentionCommand(program) {
  const cmd = program.command('retention').description('Manage snapshot retention policies');

  cmd
    .command('set <snapshot> <days>')
    .description('Set a retention policy (in days) for a snapshot')
    .action((snapshot, days) => {
      const d = parseInt(days, 10);
      if (isNaN(d) || d <= 0) {
        console.error('Error: days must be a positive integer');
        process.exit(1);
      }
      try {
        const entry = setRetention(snapshot, d);
        console.log(`Retention set: ${snapshot} expires at ${entry.expiresAt}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('get <snapshot>')
    .description('Get the retention policy for a snapshot')
    .action((snapshot) => {
      const entry = getRetention(snapshot);
      if (!entry) {
        console.log(`No retention policy set for '${snapshot}'.`);
      } else {
        const expired = new Date() > new Date(entry.expiresAt);
        console.log(`Snapshot: ${snapshot}`);
        console.log(`  Days: ${entry.days}`);
        console.log(`  Expires: ${entry.expiresAt}`);
        console.log(`  Status: ${expired ? 'EXPIRED' : 'active'}`);
      }
    });

  cmd
    .command('remove <snapshot>')
    .description('Remove the retention policy for a snapshot')
    .action((snapshot) => {
      const removed = removeRetention(snapshot);
      if (removed) {
        console.log(`Retention policy removed for '${snapshot}'.`);
      } else {
        console.log(`No retention policy found for '${snapshot}'.`);
      }
    });

  cmd
    .command('list')
    .description('List all retention policies')
    .action(() => {
      const retentions = loadRetentions();
      console.log(formatRetentionList(retentions));
    });

  cmd
    .command('expired')
    .description('List snapshots with expired retention policies')
    .action(() => {
      const expired = listExpired();
      if (expired.length === 0) {
        console.log('No expired snapshots.');
      } else {
        console.log('Expired snapshots:');
        expired.forEach(e => console.log(`  ${e.name} (expired ${e.expiresAt})`));
      }
    });
}

module.exports = { registerRetentionCommand };
