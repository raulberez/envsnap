const { setComment, getComment, deleteComment, listComments, formatComment } = require('../snapshot-comment');

function registerCommentCommand(program) {
  const cmd = program.command('comment').description('manage comments on snapshots');

  cmd
    .command('set <name> <text>')
    .description('set or update a comment on a snapshot')
    .action((name, text) => {
      const entry = setComment(name, text);
      console.log(`Comment set for "${name}": ${entry.text}`);
    });

  cmd
    .command('get <name>')
    .description('show the comment for a snapshot')
    .action((name) => {
      const entry = getComment(name);
      console.log(formatComment(name, entry));
    });

  cmd
    .command('delete <name>')
    .description('remove the comment from a snapshot')
    .action((name) => {
      const removed = deleteComment(name);
      if (removed) {
        console.log(`Comment removed from "${name}".`);
      } else {
        console.error(`No comment found for "${name}".`);
        process.exitCode = 1;
      }
    });

  cmd
    .command('list')
    .description('list all snapshot comments')
    .action(() => {
      const all = listComments();
      const names = Object.keys(all);
      if (names.length === 0) {
        console.log('No comments found.');
        return;
      }
      names.forEach((name) => {
        console.log(formatComment(name, all[name]));
      });
    });
}

module.exports = { registerCommentCommand };
