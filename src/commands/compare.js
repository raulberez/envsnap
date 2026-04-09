const { compareMultiple, formatComparisonTable } = require('../compare');

/**
 * Register the `compare` command with a yargs-compatible program
 */
function registerCompareCommand(program) {
  program.command(
    'compare <snapshots..>',
    'Compare multiple snapshots side by side',
    yargs => {
      yargs.positional('snapshots', {
        describe: 'Two or more snapshot names to compare',
        type: 'string',
      });
      yargs.option('conflicts-only', {
        alias: 'c',
        type: 'boolean',
        default: false,
        describe: 'Only show keys with conflicting values',
      });
      yargs.option('json', {
        type: 'boolean',
        default: false,
        describe: 'Output raw comparison data as JSON',
      });
    },
    argv => {
      const { snapshots, conflictsOnly, json } = argv;

      if (snapshots.length < 2) {
        console.error('Error: provide at least two snapshot names to compare.');
        process.exit(1);
      }

      let result;
      try {
        result = compareMultiple(snapshots);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }

      if (conflictsOnly) {
        result = {
          ...result,
          rows: result.rows.filter(r => r.hasConflict || r.missingIn.length > 0),
        };
      }

      if (json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      if (result.rows.length === 0) {
        console.log('No differences found between the selected snapshots.');
        return;
      }

      console.log(formatComparisonTable(result));
    }
  );
}

module.exports = { registerCompareCommand };
