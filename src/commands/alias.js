const { addAlias, removeAlias, listAliases, formatAliasList } = require('../alias');

function registerAliasCommand(program) {
  const cmd = program.command('alias').description('manage snapshot aliases');

  cmd
    .command('add <alias> <snapshot>')
    .description('create an alias pointing to a snapshot')
    .action((alias, snapshot) => {
      try {
        addAlias(alias, snapshot);
        console.log(`Alias "${alias}" -> "${snapshot}" saved.`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('remove <alias>')
    .description('remove an alias')
    .action((alias) => {
      try {
        removeAlias(alias);
        console.log(`Alias "${alias}" removed.`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('list')
    .description('list all aliases')
    .action(() => {
      try {
        const aliases = listAliases();
        console.log(formatAliasList(aliases));
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerAliasCommand };
