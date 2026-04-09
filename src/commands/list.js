const { listSnapshots, formatList } = require('../list');

function registerListCommand(program) {
  program
    .command('list')
    .alias('ls')
    .description('List all snapshots for a project')
    .argument('[project]', 'project name', process.env.ENVSNAP_PROJECT || 'default')
    .option('--json', 'output raw JSON')
    .option('--tag <tag>', 'filter snapshots by tag')
    .action((project, options) => {
      let snapshots = listSnapshots(project);

      if (options.tag) {
        snapshots = snapshots.filter((s) => s.tags.includes(options.tag));
      }

      if (options.json) {
        console.log(JSON.stringify(snapshots, null, 2));
        return;
      }

      if (snapshots.length === 0) {
        console.log(
          options.tag
            ? `No snapshots found for project "${project}" with tag "${options.tag}".`
            : `No snapshots found for project "${project}".`
        );
        return;
      }

      console.log(`Snapshots for project: ${project}\n`);
      console.log(formatList(snapshots));
    });
}

module.exports = { registerListCommand };
