const { loadHistory, clearHistory, formatHistory } = require('../history');

function registerHistoryCommand(program) {
  const cmd = program.command('history');
  cmd
    .command('show <name>')
    .description('Show change history for a snapshot')
    .option('--json', 'Output as JSON')
    .action((name, opts) => {
      const entries = loadHistory(name);
      if (opts.json) {
        console.log(JSON.stringify(entries, null, 2));
      } else {
        console.log(formatHistory(name, entries));
      }
    });

  cmd
    .command('clear <name>')
    .description('Clear history for a snapshot')
    .action((name) => {
      clearHistory(name);
      console.log(`History cleared for "${name}".`);
    });

  return cmd;
}

module.exports = { registerHistoryCommand };
