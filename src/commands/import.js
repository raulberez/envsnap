const path = require('path');
const { importSnapshot } = require('../import');
const { recordAction } = require('../audit');

function registerImportCommand(program) {
  program
    .command('import <file> <name>')
    .description('import a snapshot from an .env, JSON, or shell export file')
    .option('-f, --format <format>', 'force file format: env, json, shell')
    .option('--overwrite', 'overwrite existing snapshot with the same name', false)
    .action(async (file, name, opts) => {
      try {
        const resolvedPath = path.resolve(process.cwd(), file);
        const options = {
          overwrite: opts.overwrite,
        };
        if (opts.format) {
          const valid = ['env', 'json', 'shell'];
          if (!valid.includes(opts.format)) {
            console.error(`Invalid format "${opts.format}". Choose from: ${valid.join(', ')}`);
            process.exit(1);
          }
          options.format = opts.format;
        }

        const snapshot = importSnapshot(resolvedPath, name, options);
        const varCount = Object.keys(snapshot.vars).length;
        console.log(`Imported snapshot "${name}" with ${varCount} variable${varCount !== 1 ? 's' : ''} from ${file}`);

        try {
          await recordAction('import', { name, source: file, varCount });
        } catch (_) {
          // audit logging is best-effort
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerImportCommand };
