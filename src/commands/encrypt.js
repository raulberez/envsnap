const { encryptSnapshot, decryptSnapshot } = require('../encrypt');

function registerEncryptCommand(program) {
  program
    .command('encrypt <name>')
    .description('encrypt a snapshot with a passphrase')
    .requiredOption('-p, --passphrase <passphrase>', 'passphrase for encryption')
    .action((name, opts) => {
      try {
        const outPath = encryptSnapshot(name, opts.passphrase);
        console.log(`Snapshot "${name}" encrypted → ${outPath}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  program
    .command('decrypt <name>')
    .description('decrypt an encrypted snapshot and print its variables')
    .requiredOption('-p, --passphrase <passphrase>', 'passphrase used during encryption')
    .option('--json', 'output as JSON')
    .action((name, opts) => {
      try {
        const data = decryptSnapshot(name, opts.passphrase);
        if (opts.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          for (const [key, value] of Object.entries(data)) {
            console.log(`${key}=${value}`);
          }
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerEncryptCommand };
