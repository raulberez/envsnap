const { setProject, getProject, removeProject, listByProject, getAllProjects } = require('../snapshot-project');

function registerProjectCommand(program) {
  const proj = program
    .command('project')
    .description('manage project associations for snapshots');

  proj
    .command('set <snapshot> <project>')
    .description('associate a snapshot with a project')
    .action((snapshot, project) => {
      setProject(snapshot, project);
      console.log(`Snapshot "${snapshot}" associated with project "${project}".`);
    });

  proj
    .command('get <snapshot>')
    .description('get the project associated with a snapshot')
    .action((snapshot) => {
      const project = getProject(snapshot);
      if (project) {
        console.log(project);
      } else {
        console.log(`No project set for "${snapshot}".`);
        process.exitCode = 1;
      }
    });

  proj
    .command('unset <snapshot>')
    .description('remove project association from a snapshot')
    .action((snapshot) => {
      removeProject(snapshot);
      console.log(`Project association removed from "${snapshot}".`);
    });

  proj
    .command('list [project]')
    .description('list snapshots for a project, or list all projects')
    .action((project) => {
      if (project) {
        const snaps = listByProject(project);
        if (snaps.length === 0) {
          console.log(`No snapshots found for project "${project}".`);
        } else {
          snaps.forEach((s) => console.log(s));
        }
      } else {
        const projects = getAllProjects();
        if (projects.length === 0) {
          console.log('No projects defined.');
        } else {
          projects.forEach((p) => console.log(p));
        }
      }
    });
}

module.exports = { registerProjectCommand };
