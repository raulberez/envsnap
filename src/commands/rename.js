const { renameSnapshot } = require('../rename');

function registerRenameCommand(program) {
  program
    .command('rename <old-name> <new-name>')
    .description('rename an existing snapshot')
    .action((oldName, newName) => {
      try {
        const result = renameSnapshot(oldName, newName);
        console.log(`Renamed snapshot "${result.oldName}" → "${result.newName}"`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerRenameCommand };
