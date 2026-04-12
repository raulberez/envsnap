const {
  loadGroups,
  addToGroup,
  removeFromGroup,
  deleteGroup,
  getGroup,
  formatGroupList
} = require('../snapshot-group');

function registerGroupCommand(program) {
  const group = program
    .command('group')
    .description('Manage snapshot groups');

  group
    .command('add <groupName> <snapshot>')
    .description('Add a snapshot to a group')
    .action((groupName, snapshot) => {
      try {
        const members = addToGroup(groupName, snapshot);
        console.log(`Added '${snapshot}' to group '${groupName}'.`);
        console.log(`Members: ${members.join(', ')}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  group
    .command('remove <groupName> <snapshot>')
    .description('Remove a snapshot from a group')
    .action((groupName, snapshot) => {
      try {
        removeFromGroup(groupName, snapshot);
        console.log(`Removed '${snapshot}' from group '${groupName}'.`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  group
    .command('delete <groupName>')
    .description('Delete an entire group')
    .action((groupName) => {
      try {
        deleteGroup(groupName);
        console.log(`Deleted group '${groupName}'.`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  group
    .command('show <groupName>')
    .description('Show snapshots in a group')
    .action((groupName) => {
      const members = getGroup(groupName);
      if (!members) {
        console.log(`Group '${groupName}' not found.`);
      } else {
        console.log(`Group '${groupName}': ${members.join(', ') || '(empty)'}`);
      }
    });

  group
    .command('list')
    .description('List all groups')
    .action(() => {
      const groups = loadGroups();
      console.log(formatGroupList(groups));
    });
}

module.exports = { registerGroupCommand };
