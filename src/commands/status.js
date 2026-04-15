const {
  setStatus,
  getStatus,
  clearStatus,
  loadStatuses,
  formatStatusList,
  VALID_STATUSES,
} = require('../snapshot-status');

function registerStatusCommand(program) {
  const cmd = program.command('status').description('Manage snapshot statuses');

  cmd
    .command('set <name> <status>')
    .description(`Set status for a snapshot. Valid: ${VALID_STATUSES.join(', ')}`)
    .action((name, status) => {
      try {
        const result = setStatus(name, status);
        console.log(`Set status of "${name}" to "${result.status}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  cmd
    .command('get <name>')
    .description('Get the status of a snapshot')
    .action((name) => {
      const result = getStatus(name);
      if (!result) {
        console.log(`No status set for "${name}"`);
      } else {
        console.log(`${name}: ${result.status} (updated ${result.updatedAt})`);
      }
    });

  cmd
    .command('clear <name>')
    .description('Clear the status of a snapshot')
    .action((name) => {
      const removed = clearStatus(name);
      if (removed) {
        console.log(`Cleared status for "${name}"`);
      } else {
        console.log(`No status found for "${name}"`);
      }
    });

  cmd
    .command('list')
    .description('List all snapshot statuses')
    .action(() => {
      const statuses = loadStatuses();
      console.log(formatStatusList(statuses));
    });
}

module.exports = { registerStatusCommand };
