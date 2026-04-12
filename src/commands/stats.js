const { computeStats, formatStats, loadSnapshot } = require('../snapshot-stats');
const { recordAction } = require('../audit');

function registerStatsCommand(program) {
  program
    .command('stats <name>')
    .description('show statistics for a snapshot')
    .option('--json', 'output raw stats as JSON')
    .action(async (name, opts) => {
      try {
        const snapshot = loadSnapshot(name);
        const stats = computeStats(snapshot);

        if (opts.json) {
          console.log(JSON.stringify({ name, ...stats }, null, 2));
        } else {
          console.log(formatStats(name, stats));
        }

        await recordAction('stats', { snapshot: name }).catch(() => {});
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerStatsCommand };
