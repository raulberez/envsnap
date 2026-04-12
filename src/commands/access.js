const {
  recordAccess,
  getAccessStats,
  clearAccessStats,
  formatAccessStats,
  loadAccessLog,
} = require('../snapshot-access');

function registerAccessCommand(program) {
  const access = program
    .command('access')
    .description('view or clear access statistics for snapshots');

  access
    .command('show <name>')
    .description('show read/write access stats for a snapshot')
    .action((name) => {
      const stats = getAccessStats(name);
      process.stdout.write(formatAccessStats(name, stats));
    });

  access
    .command('clear <name>')
    .description('clear access stats for a snapshot')
    .action((name) => {
      const removed = clearAccessStats(name);
      if (removed) {
        console.log(`Access stats cleared for "${name}".`);
      } else {
        console.log(`No access stats found for "${name}".`);
      }
    });

  access
    .command('list')
    .description('list all snapshots with access data')
    .option('--sort <field>', 'sort by reads or writes', 'reads')
    .action((opts) => {
      const log = loadAccessLog();
      const entries = Object.entries(log);
      if (entries.length === 0) {
        console.log('No access data recorded yet.');
        return;
      }
      const field = opts.sort === 'writes' ? 'writes' : 'reads';
      entries.sort((a, b) => b[1][field] - a[1][field]);
      console.log(`Snapshots by ${field}:`);
      for (const [name, stats] of entries) {
        console.log(`  ${name.padEnd(30)} reads=${stats.reads}  writes=${stats.writes}`);
      }
    });

  access
    .command('record <name> <action>')
    .description('manually record a read or write access event')
    .action((name, action) => {
      if (!['read', 'write'].includes(action)) {
        console.error('Action must be "read" or "write".');
        process.exit(1);
      }
      const entry = recordAccess(name, action);
      console.log(`Recorded ${action} for "${name}". Total reads=${entry.reads}, writes=${entry.writes}.`);
    });
}

module.exports = { registerAccessCommand };
