const path = require('path');
const fs = require('fs');
const { getSnapshotsDir } = require('../snapshot');

function registerSnapshotCommand(program) {
  program
    .command('save <name>')
    .description('Save current environment variables as a named snapshot')
    .option('-f, --file <path>', 'Read from a .env file instead of process.env')
    .option('--filter <prefix>', 'Only include variables matching a prefix')
    .action((name, options) => {
      try {
        const snapshotsDir = getSnapshotsDir();

        if (!fs.existsSync(snapshotsDir)) {
          fs.mkdirSync(snapshotsDir, { recursive: true });
        }

        let envVars = {};

        if (options.file) {
          const filePath = path.resolve(options.file);
          if (!fs.existsSync(filePath)) {
            console.error(`Error: File not found: ${filePath}`);
            process.exit(1);
          }
          const content = fs.readFileSync(filePath, 'utf-8');
          envVars = parseEnvFile(content);
        } else {
          envVars = { ...process.env };
        }

        if (options.filter) {
          const prefix = options.filter;
          envVars = Object.fromEntries(
            Object.entries(envVars).filter(([key]) => key.startsWith(prefix))
          );
        }

        const snapshot = {
          name,
          createdAt: new Date().toISOString(),
          vars: envVars,
        };

        const snapshotPath = path.join(snapshotsDir, `${name}.json`);
        fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

        console.log(`Snapshot "${name}" saved with ${Object.keys(envVars).length} variable(s).`);
      } catch (err) {
        console.error(`Error saving snapshot: ${err.message}`);
        process.exit(1);
      }
    });
}

function parseEnvFile(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key) vars[key] = value;
  }
  return vars;
}

module.exports = { registerSnapshotCommand, parseEnvFile };
