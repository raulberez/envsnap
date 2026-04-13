const { setLabel, getLabel, removeLabel, listLabels, findByLabel } = require('../snapshot-label');

function registerLabelCommand(program) {
  const label = program
    .command('label')
    .description('manage human-readable labels for snapshots');

  label
    .command('set <snapshot> <label>')
    .description('assign a label to a snapshot')
    .action((snapshot, lbl) => {
      try {
        setLabel(snapshot, lbl);
        console.log(`Label set: ${snapshot} → "${lbl}"`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  label
    .command('get <snapshot>')
    .description('get the label for a snapshot')
    .action((snapshot) => {
      const lbl = getLabel(snapshot);
      if (lbl) {
        console.log(lbl);
      } else {
        console.log(`No label found for "${snapshot}"`);
      }
    });

  label
    .command('remove <snapshot>')
    .description('remove the label from a snapshot')
    .action((snapshot) => {
      const removed = removeLabel(snapshot);
      if (removed) {
        console.log(`Label removed from "${snapshot}"`);
      } else {
        console.log(`No label found for "${snapshot}"`);
      }
    });

  label
    .command('list')
    .description('list all labeled snapshots')
    .action(() => {
      const labels = listLabels();
      const entries = Object.entries(labels);
      if (entries.length === 0) {
        console.log('No labels defined.');
        return;
      }
      entries.forEach(([snap, lbl]) => console.log(`${snap}: ${lbl}`));
    });

  label
    .command('find <query>')
    .description('find snapshots by label text')
    .action((query) => {
      const results = findByLabel(query);
      if (results.length === 0) {
        console.log(`No snapshots matching "${query}"`);
        return;
      }
      results.forEach((s) => console.log(s));
    });
}

module.exports = { registerLabelCommand };
