const { pinSnapshot, unpinSnapshot, listPinned, formatPinList } = require('../pin');
const { recordAction } = require('../audit');

function registerPinCommand(program) {
  const pin = program.command('pin').description('Pin or unpin snapshots to protect them from pruning');

  pin
    .command('add <name>')
    .description('Pin a snapshot')
    .option('-n, --note <note>', 'Optional note for the pin')
    .action((name, opts) => {
      try {
        const result = pinSnapshot(name, opts.note || '');
        console.log(`📌 Pinned "${name}"${opts.note ? ` — ${opts.note}` : ''}`);
        recordAction('pin', name, { note: opts.note || '' });
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  pin
    .command('remove <name>')
    .description('Unpin a snapshot')
    .action((name) => {
      try {
        unpinSnapshot(name);
        console.log(`🔓 Unpinned "${name}"`);
        recordAction('unpin', name, {});
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  pin
    .command('list')
    .description('List all pinned snapshots')
    .action(() => {
      try {
        const pins = listPinned();
        console.log(formatPinList(pins));
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  return pin;
}

module.exports = { registerPinCommand };
