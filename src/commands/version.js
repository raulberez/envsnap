const { bumpVersion, getVersion, resetVersion, listVersioned, formatVersionList } = require('../snapshot-version');

function registerVersionCommand(program) {
  const cmd = program.command('version').description('manage snapshot version counters');

  cmd
    .command('bump <name>')
    .description('increment version counter for a snapshot')
    .action((name) => {
      const v = bumpVersion(name);
      console.log(`Bumped ${name} to v${v}`);
    });

  cmd
    .command('get <name>')
    .description('show current version of a snapshot')
    .action((name) => {
      const v = getVersion(name);
      if (v === null) {
        console.log(`No version tracked for "${name}"`);
      } else {
        console.log(`${name}: v${v}`);
      }
    });

  cmd
    .command('reset <name>')
    .description('reset version counter for a snapshot')
    .action((name) => {
      resetVersion(name);
      console.log(`Version counter reset for "${name}"`);
    });

  cmd
    .command('list')
    .description('list all snapshots with version counters')
    .action(() => {
      const entries = listVersioned();
      console.log(formatVersionList(entries));
    });

  return cmd;
}

module.exports = { registerVersionCommand };
