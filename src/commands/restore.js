const { restoreToFile, restoreToProcess } = require('../restore');

module.exports = {
  command: 'restore <snapshot>',
  describe: 'Restore environment variables from a snapshot',
  builder: (yargs) => {
    yargs
      .positional('snapshot', {
        describe: 'Name of the snapshot to restore',
        type: 'string',
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        default: '.env',
        describe: 'Target .env file path to write',
      })
      .option('overwrite', {
        type: 'boolean',
        default: false,
        describe: 'Overwrite the target file if it already exists',
      })
      .option('process', {
        type: 'boolean',
        default: false,
        describe: 'Apply vars directly to the current process.env instead of writing a file',
      });
  },
  handler: (argv) => {
    const { snapshot, output, overwrite } = argv;

    try {
      if (argv.process) {
        const { count } = restoreToProcess(snapshot);
        console.log(`✔ Applied ${count} variable(s) from "${snapshot}" to process.env`);
        return;
      }

      const { targetPath, count } = restoreToFile(snapshot, output, { overwrite });
      console.log(`✔ Restored ${count} variable(s) from "${snapshot}" to ${targetPath}`);
    } catch (err) {
      console.error(`✖ Restore failed: ${err.message}`);
      if (err.message.includes('already exists')) {
        console.error('  Tip: use --overwrite to replace the existing file');
      }
      process.exit(1);
    }
  },
};
