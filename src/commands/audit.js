import { Command } from 'commander';
import path from 'path';
import os from 'os';
import { loadAuditLog, formatAuditLog, clearAuditLog } from '../audit.js';

export function registerAuditCommand(program) {
  const audit = program
    .command('audit')
    .description('view or manage the audit log of envsnap actions');

  audit
    .command('log')
    .description('display recorded actions')
    .option('-n, --limit <number>', 'max number of entries to show', '20')
    .option('--json', 'output as JSON')
    .option(
      '-d, --dir <path>',
      'snapshots directory',
      path.join(os.homedir(), '.envsnap')
    )
    .action(async (opts) => {
      try {
        const entries = await loadAuditLog(opts.dir);
        const limit = parseInt(opts.limit, 10);
        const slice = entries.slice(-limit);

        if (opts.json) {
          console.log(JSON.stringify(slice, null, 2));
        } else {
          if (slice.length === 0) {
            console.log('No audit entries found.');
            return;
          }
          console.log(formatAuditLog(slice));
        }
      } catch (err) {
        console.error('Error reading audit log:', err.message);
        process.exit(1);
      }
    });

  audit
    .command('clear')
    .description('clear the audit log')
    .option(
      '-d, --dir <path>',
      'snapshots directory',
      path.join(os.homedir(), '.envsnap')
    )
    .action(async (opts) => {
      try {
        await clearAuditLog(opts.dir);
        console.log('Audit log cleared.');
      } catch (err) {
        console.error('Error clearing audit log:', err.message);
        process.exit(1);
      }
    });

  return audit;
}
