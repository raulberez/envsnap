const { mergeSnapshots, saveMergedSnapshot, snapshotExists } = require('../merge');

function registerMergeCommand(program) {
  program
    .command('merge <snapshots...>')
    .description('merge two or more snapshots into a new one')
    .option('-o, --output <name>', 'name for the resulting merged snapshot', 'merged')
    .option('--strategy <strategy>', 'conflict resolution strategy: last-wins (default)', 'last-wins')
    .option('--no-overwrite', 'fail if the output snapshot already exists')
    .action((snapshots, opts) => {
      if (snapshots.length < 2) {
        console.error('Error: provide at least two snapshot names to merge.');
        process.exit(1);
      }

      if (opts.noOverwrite && snapshotExists(opts.output)) {
        console.error(`Error: snapshot "${opts.output}" already exists. Use a different --output name.`);
        process.exit(1);
      }

      let result;
      try {
        result = mergeSnapshots(snapshots, opts.strategy);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }

      const { merged, conflicts } = result;
      const conflictKeys = Object.keys(conflicts);

      if (conflictKeys.length > 0) {
        console.warn(`Warning: ${conflictKeys.length} conflict(s) resolved using "${opts.strategy}" strategy:`);
        for (const key of conflictKeys) {
          const sources = conflicts[key].map((c) => `${c.source}=${c.value}`).join(', ');
          console.warn(`  ${key}: [${sources}] → "${merged[key]}"`);
        }
      }

      const filePath = saveMergedSnapshot(opts.output, merged);
      const keyCount = Object.keys(merged).length;
      console.log(`Merged ${snapshots.length} snapshots into "${opts.output}" (${keyCount} vars) → ${filePath}`);
    });
}

module.exports = { registerMergeCommand };
