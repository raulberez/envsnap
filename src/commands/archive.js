const { archiveSnapshot, unarchiveSnapshot, listArchived } = require('../archive');

function registerArchiveCommand(program) {
  const archive = program
    .command('archive')
    .description('Archive, unarchive, or list archived snapshots');

  archive
    .command('add <name>')
    .description('Move a snapshot to the archive')
    .action((name) => {
      try {
        const dest = archiveSnapshot(name);
        console.log(`Archived "${name}" → ${dest}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  archive
    .command('restore <name>')
    .description('Restore the latest archived version of a snapshot')
    .action((name) => {
      try {
        const dest = unarchiveSnapshot(name);
        console.log(`Restored "${name}" → ${dest}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  archive
    .command('list')
    .description('List all archived snapshots')
    .action(() => {
      try {
        const items = listArchived();
        if (items.length === 0) {
          console.log('No archived snapshots.');
          return;
        }
        console.log('Archived snapshots:');
        items.forEach(({ name, archivedAt }) => {
          console.log(`  ${name}  (archived ${archivedAt})`);
        });
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerArchiveCommand };
