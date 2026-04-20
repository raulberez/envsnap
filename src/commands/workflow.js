const {
  setWorkflow,
  getWorkflow,
  removeWorkflow,
  listByWorkflow,
  formatWorkflowList,
} = require('../snapshot-workflow');

function registerWorkflowCommand(program) {
  const workflow = program
    .command('workflow')
    .description('Manage workflow assignments for snapshots');

  workflow
    .command('set <snapshot> <workflow>')
    .description('Assign a workflow to a snapshot')
    .action((snapshot, wf) => {
      setWorkflow(snapshot, wf);
      console.log(`Workflow "${wf}" assigned to snapshot "${snapshot}".`);
    });

  workflow
    .command('get <snapshot>')
    .description('Get the workflow assigned to a snapshot')
    .action((snapshot) => {
      const wf = getWorkflow(snapshot);
      if (!wf) {
        console.log(`No workflow assigned to "${snapshot}".`);
      } else {
        console.log(`${snapshot}: ${wf}`);
      }
    });

  workflow
    .command('remove <snapshot>')
    .description('Remove workflow assignment from a snapshot')
    .action((snapshot) => {
      const removed = removeWorkflow(snapshot);
      if (removed) {
        console.log(`Workflow removed from "${snapshot}".`);
      } else {
        console.error(`No workflow found for "${snapshot}".`);
        process.exit(1);
      }
    });

  workflow
    .command('list <workflow>')
    .description('List all snapshots assigned to a workflow')
    .action((wf) => {
      const entries = listByWorkflow(wf);
      console.log(formatWorkflowList(entries));
    });
}

module.exports = { registerWorkflowCommand };
