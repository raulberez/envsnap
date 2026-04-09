const { pruneByAge, pruneByCount } = require('../prune');

function registerPruneCommand(program) {
  program
    .command('prune <project>')
    .description('remove old snapshots by age or count')
    .option('--older-than <days>', 'delete snapshots older than N days', parseInt)
    .option('--keep <count>', 'keep only the N most recent snapshots', parseInt)
    .option('--dry-run', 'show what would be deleted without removing anything')
    .action((project, options) => {
      const { olderThan, keep, dryRun } = options;

      if (!olderThan && !keep) {
        console.error('error: specify --older-than <days> or --keep <count>');
        process.exit(1);
      }

      if (olderThan && keep) {
        console.error('error: use --older-than or --keep, not both');
        process.exit(1);
      }

      if (dryRun) {
        // import meta to show preview without deleting
        const { getSnapshotMeta } = require('../prune');
        const all = getSnapshotMeta(project);
        let toDelete = [];

        if (olderThan) {
          const cutoff = new Date(Date.now() - olderThan * 24 * 60 * 60 * 1000);
          toDelete = all.filter((s) => s.mtime < cutoff).map((s) => s.name);
        } else {
          toDelete = all.slice(0, Math.max(0, all.length - keep)).map((s) => s.name);
        }

        if (toDelete.length === 0) {
          console.log('nothing to prune');
        } else {
          console.log(`would delete ${toDelete.length} snapshot(s):`);
          toDelete.forEach((n) => console.log(`  - ${n}`));
        }
        return;
      }

      let deleted = [];

      if (olderThan) {
        deleted = pruneByAge(project, olderThan);
      } else {
        deleted = pruneByCount(project, keep);
      }

      if (deleted.length === 0) {
        console.log('nothing to prune');
      } else {
        console.log(`pruned ${deleted.length} snapshot(s):`);
        deleted.forEach((n) => console.log(`  - ${n}`));
      }
    });
}

module.exports = { registerPruneCommand };
