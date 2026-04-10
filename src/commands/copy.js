const { copySnapshot } = require('../copy');

function registerCopyCommand(program) {
  program
    .command('copy <source> <destination>')
    .description('copy an existing snapshot to a new name')
    .option('--force', 'overwrite destination if it already exists')
    .action((source, destination, options) => {
      try {
        if (options.force) {
          const fs = require('fs');
          const path = require('path');
          const { getSnapshotsDir } = require('../snapshot');
          const destPath = path.join(getSnapshotsDir(), `${destination}.json`);
          if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
          }
        }

        const result = copySnapshot(source, destination);
        console.log(`Copied "${source}" → "${destination}"`);
        console.log(`  Created at: ${result.createdAt}`);
        console.log(`  Variables:  ${Object.keys(result.vars || {}).length}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerCopyCommand };
