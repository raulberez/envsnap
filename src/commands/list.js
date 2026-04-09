import { listSnapshots, formatList } from '../list.js';

/**
 * Registers the `list` command with the CLI program.
 * @param {import('commander').Command} program
 * @param {{ listSnapshots?: Function, formatList?: Function }} [deps] - injectable deps for testing
 */
export function registerListCommand(
  program,
  deps = {}
) {
  const _listSnapshots = deps.listSnapshots ?? listSnapshots;
  const _formatList = deps.formatList ?? formatList;

  program
    .command('list')
    .description('List all saved environment snapshots')
    .option('--json', 'Output as JSON', false)
    .option('-p, --project <name>', 'Filter snapshots by project name')
    .action(async (options) => {
      try {
        const snapshots = await _listSnapshots({ project: options.project });

        if (snapshots.length === 0) {
          console.log('No snapshots found.');
          return;
        }

        if (options.json) {
          console.log(JSON.stringify(snapshots, null, 2));
        } else {
          const formatted = _formatList(snapshots);
          console.log(formatted);
        }
      } catch (err) {
        console.error(`Error listing snapshots: ${err.message}`);
        process.exit(1);
      }
    });
}
