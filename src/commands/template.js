const { saveTemplate, deleteTemplate, applyTemplate, listTemplates, formatTemplateList } = require('../template');
const { getSnapshotsDir } = require('../snapshot');
const { takeSnapshot } = require('../snapshot');
const fs = require('fs');
const path = require('path');

function registerTemplateCommand(program) {
  const tmpl = program.command('template').description('manage snapshot templates');

  tmpl
    .command('save <name> <snapshot>')
    .description('save vars from a snapshot as a named template')
    .option('--base-dir <dir>', 'base directory', process.cwd())
    .action((name, snapshot, opts) => {
      const snapFile = path.join(getSnapshotsDir(opts.baseDir), `${snapshot}.json`);
      if (!fs.existsSync(snapFile)) {
        console.error(`Snapshot "${snapshot}" not found.`);
        process.exit(1);
      }
      const vars = JSON.parse(fs.readFileSync(snapFile, 'utf8'));
      saveTemplate(name, vars, opts.baseDir);
      console.log(`Template "${name}" saved with ${Object.keys(vars).length} vars.`);
    });

  tmpl
    .command('list')
    .description('list all saved templates')
    .option('--base-dir <dir>', 'base directory', process.cwd())
    .action((opts) => {
      const templates = listTemplates(opts.baseDir);
      console.log(formatTemplateList(templates));
    });

  tmpl
    .command('delete <name>')
    .description('delete a template')
    .option('--base-dir <dir>', 'base directory', process.cwd())
    .action((name, opts) => {
      try {
        deleteTemplate(name, opts.baseDir);
        console.log(`Template "${name}" deleted.`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  tmpl
    .command('apply <name> <output>')
    .description('create a snapshot from a template with optional overrides')
    .option('--set <pairs...>', 'override vars as KEY=VALUE')
    .option('--base-dir <dir>', 'base directory', process.cwd())
    .action((name, output, opts) => {
      const overrides = {};
      if (opts.set) {
        for (const pair of opts.set) {
          const [k, ...rest] = pair.split('=');
          overrides[k] = rest.join('=');
        }
      }
      try {
        const vars = applyTemplate(name, overrides, opts.baseDir);
        const outFile = path.join(getSnapshotsDir(opts.baseDir), `${output}.json`);
        fs.writeFileSync(outFile, JSON.stringify(vars, null, 2));
        console.log(`Snapshot "${output}" created from template "${name}" (${Object.keys(vars).length} vars).`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { registerTemplateCommand };
