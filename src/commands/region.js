const { setRegion, getRegion, removeRegion, listByRegion, getAllRegions } = require('../snapshot-region');

function registerRegionCommand(program) {
  const region = program
    .command('region')
    .description('manage deployment region tags for snapshots');

  region
    .command('set <snapshot> <region>')
    .description('assign a region to a snapshot')
    .action((snapshot, reg) => {
      try {
        const saved = setRegion(snapshot, reg);
        console.log(`Region set to "${saved}" for snapshot "${snapshot}"`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  region
    .command('get <snapshot>')
    .description('get the region assigned to a snapshot')
    .action((snapshot) => {
      const reg = getRegion(snapshot);
      if (reg) {
        console.log(reg);
      } else {
        console.log(`No region set for "${snapshot}"`);
      }
    });

  region
    .command('remove <snapshot>')
    .description('remove the region from a snapshot')
    .action((snapshot) => {
      const removed = removeRegion(snapshot);
      if (removed) {
        console.log(`Region removed from "${snapshot}"`);
      } else {
        console.log(`No region found for "${snapshot}"`);
      }
    });

  region
    .command('list [region]')
    .description('list snapshots by region, or list all known regions')
    .action((reg) => {
      if (reg) {
        const snaps = listByRegion(reg);
        if (snaps.length === 0) {
          console.log(`No snapshots found for region "${reg}"`);
        } else {
          snaps.forEach((s) => console.log(s));
        }
      } else {
        const all = getAllRegions();
        if (all.length === 0) {
          console.log('No regions defined.');
        } else {
          all.forEach((r) => console.log(r));
        }
      }
    });

  return region;
}

module.exports = { registerRegionCommand };
