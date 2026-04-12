const {
  addDependency,
  removeDependency,
  getDependencies,
  getDependents,
  formatDepsInfo
} = require('../snapshot-deps');

function registerDepsCommand(program) {
  const deps = program
    .command('deps')
    .description('Manage snapshot dependencies');

  deps
    .command('add <snapshot> <dependsOn>')
    .description('Add a dependency between two snapshots')
    .action((snapshot, dependsOn) => {
      const list = addDependency(snapshot, dependsOn);
      console.log(`Added: ${snapshot} depends on ${dependsOn}`);
      console.log(`All dependencies: ${list.join(', ')}`);
    });

  deps
    .command('remove <snapshot> <dependsOn>')
    .description('Remove a dependency between two snapshots')
    .action((snapshot, dependsOn) => {
      removeDependency(snapshot, dependsOn);
      console.log(`Removed dependency: ${snapshot} -> ${dependsOn}`);
    });

  deps
    .command('list <snapshot>')
    .description('List dependencies and dependents of a snapshot')
    .option('--deps-only', 'Show only dependencies')
    .option('--dependents-only', 'Show only dependents')
    .action((snapshot, opts) => {
      if (opts.depsOnly) {
        const list = getDependencies(snapshot);
        console.log(list.length ? list.join('\n') : '(none)');
      } else if (opts.dependentsOnly) {
        const list = getDependents(snapshot);
        console.log(list.length ? list.join('\n') : '(none)');
      } else {
        console.log(formatDepsInfo(snapshot));
      }
    });

  return deps;
}

module.exports = { registerDepsCommand };
