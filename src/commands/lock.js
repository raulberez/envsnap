const { lockSnapshot, unlockSnapshot, listLocked, formatLockList, isLocked, getLockInfo } = require('../snapshot-lock');

function registerLockCommand(program) {
  const lock = program.command('lock').description('Lock or unlock snapshots to prevent modification');

  lock
    .command('add <name>')
    .description('Lock a snapshot')
    .option('-r, --reason <reason>', 'Reason for locking')
    .action((name, opts) => {
      try {
        lockSnapshot(name, opts.reason || '');
        console.log(`🔒 Snapshot '${name}' locked.`);
        if (opts.reason) console.log(`   Reason: ${opts.reason}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  lock
    .command('remove <name>')
    .description('Unlock a snapshot')
    .action((name) => {
      try {
        unlockSnapshot(name);
        console.log(`🔓 Snapshot '${name}' unlocked.`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  lock
    .command('list')
    .description('List all locked snapshots')
    .action(() => {
      const locks = listLocked();
      console.log(formatLockList(locks));
    });

  lock
    .command('status <name>')
    .description('Check lock status of a snapshot')
    .action((name) => {
      if (isLocked(name)) {
        const info = getLockInfo(name);
        console.log(`🔒 '${name}' is locked.`);
        if (info.reason) console.log(`   Reason: ${info.reason}`);
        console.log(`   Since: ${info.lockedAt}`);
      } else {
        console.log(`🔓 '${name}' is not locked.`);
      }
    });
}

module.exports = { registerLockCommand };
