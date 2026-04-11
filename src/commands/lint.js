const path = require('path');
const { getSnapshotsDir } = require('../snapshot');
const { lintSnapshot, formatLintResult } = require('../lint');

function registerLintCommand(program) {
  program
    .command('lint <name>')
    .description('lint a snapshot for common issues (empty values, suspicious keys, duplicates)')
    .option('--strict', 'treat warnings as errors')
    .option('--json', 'output results as JSON')
    .action(async (name, opts) => {
      try {
        const snapshotsDir = getSnapshotsDir();
        const snapshotPath = path.join(snapshotsDir, `${name}.json`);

        const result = await lintSnapshot(snapshotPath);

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          process.exit(result.errors.length > 0 || (opts.strict && result.warnings.length > 0) ? 1 : 0);
          return;
        }

        const formatted = formatLintResult(result, name);
        console.log(formatted);

        const hasErrors = result.errors.length > 0;
        const hasWarnings = result.warnings.length > 0;

        if (hasErrors) {
          process.exit(1);
        } else if (opts.strict && hasWarnings) {
          console.error('\nExiting with error due to --strict mode and warnings found.');
          process.exit(1);
        } else {
          process.exit(0);
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error(`Snapshot "${name}" not found.`);
        } else {
          console.error(`Error linting snapshot: ${err.message}`);
        }
        process.exit(1);
      }
    });
}

module.exports = { registerLintCommand };
