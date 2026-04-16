const { setOwner, getOwner, removeOwner, listOwned, formatOwnerInfo } = require('../snapshot-owner');

function registerOwnerCommand(program) {
  const owner = program.command('owner').description('manage snapshot ownership');

  owner
    .command('set <snapshot> <owner>')
    .description('set the owner of a snapshot')
    .action((snapshot, ownerName) => {
      const info = setOwner(snapshot, ownerName);
      console.log(`Owner of '${snapshot}' set to '${info.owner}'.`);
    });

  owner
    .command('get <snapshot>')
    .description('get the owner of a snapshot')
    .action((snapshot) => {
      const info = getOwner(snapshot);
      console.log(formatOwnerInfo(snapshot, info));
    });

  owner
    .command('remove <snapshot>')
    .description('remove ownership from a snapshot')
    .action((snapshot) => {
      const removed = removeOwner(snapshot);
      if (removed) {
        console.log(`Owner removed from '${snapshot}'.`);
      } else {
        console.error(`No owner set for '${snapshot}'.`);
        process.exit(1);
      }
    });

  owner
    .command('list <owner>')
    .description('list snapshots owned by a user')
    .action((ownerName) => {
      const snaps = listOwned(ownerName);
      if (snaps.length === 0) {
        console.log(`No snapshots owned by '${ownerName}'.`);
      } else {
        snaps.forEach(s => console.log(formatOwnerInfo(s.name, s)));
      }
    });
}

module.exports = { registerOwnerCommand };
