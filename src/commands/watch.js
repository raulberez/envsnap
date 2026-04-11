const { watchEnvFile } = require('../watch');

function registerWatchCommand(program) {
  program
    .command('watch')
    .description('Watch a .env file and auto-snapshot on changes')
    .option('-f, --file <path>', 'Path to .env file to watch', '.env')
    .option('-l, --label <label>', 'Label prefix for auto-snapshots', 'watch')
    .option('-i, --interval <ms>', 'Polling interval in milliseconds', '2000')
    .action((options) => {
      const interval = parseInt(options.interval, 10);
      if (isNaN(interval) || interval < 100) {
        console.error('Error: interval must be a number >= 100');
        process.exit(1);
      }

      const watcher = watchEnvFile({
        envFile: options.file,
        label: options.label,
        interval,
        onSnapshot: (name, vars) => {
          const count = Object.keys(vars || {}).length;
          console.log(`[envsnap] Snapshot saved: ${name} (${count} vars)`);
        },
        onError: (err) => {
          console.error(`[envsnap] Watch error: ${err.message}`);
        },
      });

      console.log(`Watching ${watcher.filePath} every ${interval}ms (label: ${options.label})`);
      console.log('Press Ctrl+C to stop.');

      process.on('SIGINT', () => {
        watcher.stop();
        console.log('\nWatch stopped.');
        process.exit(0);
      });
    });
}

module.exports = { registerWatchCommand };
