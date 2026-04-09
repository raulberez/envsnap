const path = require('path');
const { exportSnapshot, exportToFile } = require('../export');

const VALID_FORMATS = ['env', 'json', 'shell'];

function registerExportCommand(program) {
  program
    .command('export <snapshot>')
    .description('export a snapshot to stdout or a file')
    .option('-f, --format <format>', 'output format: env, json, shell', 'env')
    .option('-o, --output <file>', 'write output to a file instead of stdout')
    .action((snapshotName, options) => {
      const { format, output } = options;

      if (!VALID_FORMATS.includes(format)) {
        console.error(`Error: invalid format "${format}". Choose from: ${VALID_FORMATS.join(', ')}`);
        process.exit(1);
      }

      try {
        if (output) {
          const resolvedPath = path.resolve(output);
          exportToFile(snapshotName, resolvedPath, format);
          console.log(`Exported snapshot "${snapshotName}" to ${resolvedPath}`);
        } else {
          const content = exportSnapshot(snapshotName, format);
          console.log(content);
        }
      } catch (err) {
        if (err.code === 'SNAPSHOT_NOT_FOUND') {
          console.error(`Error: snapshot "${snapshotName}" not found`);
        } else {
          console.error(`Error: ${err.message}`);
        }
        process.exit(1);
      }
    });
}

module.exports = { registerExportCommand };
