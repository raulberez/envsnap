const {
  setVisibility,
  getVisibility,
  removeVisibility,
  loadVisibilities,
  formatVisibilityList,
  VALID_VISIBILITIES,
} = require('../snapshot-visibility');

function registerVisibilityCommand(program) {
  const vis = program
    .command('visibility')
    .description('Manage snapshot visibility (public, private, internal)');

  vis
    .command('set <snapshot> <visibility>')
    .description(`Set visibility for a snapshot (${VALID_VISIBILITIES.join('|')})`)
    .action((snapshot, visibility) => {
      try {
        setVisibility(snapshot, visibility);
        console.log(`Visibility for "${snapshot}" set to "${visibility}".`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  vis
    .command('get <snapshot>')
    .description('Get visibility for a snapshot')
    .action((snapshot) => {
      const v = getVisibility(snapshot);
      console.log(`${snapshot}: ${v}`);
    });

  vis
    .command('remove <snapshot>')
    .description('Remove visibility setting (resets to public)')
    .action((snapshot) => {
      removeVisibility(snapshot);
      console.log(`Visibility setting removed for "${snapshot}".`);
    });

  vis
    .command('list')
    .description('List all visibility settings')
    .action(() => {
      const all = loadVisibilities();
      console.log(formatVisibilityList(all));
    });
}

module.exports = { registerVisibilityCommand };
