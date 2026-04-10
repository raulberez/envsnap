const { validateSnapshot, formatValidationResult } = require('../validate');

function registerValidateCommand(program) {
  program
    .command('validate <snapshot>')
    .description('Check that a snapshot is well-formed and contains valid environment variable names')
    .option('--json', 'Output result as JSON')
    .action((snapshotName, options) => {
      const result = validateSnapshot(snapshotName);

      if (options.json) {
        console.log(JSON.stringify({ snapshot: snapshotName, ...result }, null, 2));
        process.exit(result.valid ? 0 : 1);
        return;
      }

      const output = formatValidationResult(snapshotName, result);
      console.log(output);
      process.exit(result.valid ? 0 : 1);
    });
}

module.exports = { registerValidateCommand };
