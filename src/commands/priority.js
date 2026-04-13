const {
  setPriority,
  getPriority,
  removePriority,
  loadPriorities,
  formatPriorityList,
  VALID_PRIORITIES,
} = require('../snapshot-priority');

function registerPriorityCommand(program) {
  const cmd = program
    .command('priority')
    .description('manage snapshot priorities');

  cmd
    .command('set <snapshot> <priority>')
    .description(`set priority for a snapshot (${VALID_PRIORITIES.join('|')})`)
    .action((snapshot, priority) => {
      try {
        setPriority(snapshot, priority);
        console.log(`Priority for "${snapshot}" set to "${priority}".`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  cmd
    .command('get <snapshot>')
    .description('get priority of a snapshot')
    .action((snapshot) => {
      const p = getPriority(snapshot);
      if (!p) {
        console.log(`No priority set for "${snapshot}".`);
      } else {
        console.log(`${snapshot}: ${p}`);
      }
    });

  cmd
    .command('remove <snapshot>')
    .description('remove priority from a snapshot')
    .action((snapshot) => {
      const removed = removePriority(snapshot);
      if (removed) {
        console.log(`Priority removed from "${snapshot}".`);
      } else {
        console.log(`No priority was set for "${snapshot}".`);
      }
    });

  cmd
    .command('list')
    .description('list all snapshot priorities')
    .action(() => {
      const priorities = loadPriorities();
      console.log(formatPriorityList(priorities));
    });

  return cmd;
}

module.exports = { registerPriorityCommand };
