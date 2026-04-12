const { addBookmark, removeBookmark, listBookmarks, formatBookmarks, getBookmark } = require('../snapshot-bookmark');

function registerBookmarkCommand(program) {
  const cmd = program.command('bookmark').description('manage snapshot bookmarks');

  cmd
    .command('add <snapshot> [label]')
    .description('bookmark a snapshot with an optional label')
    .action((snapshot, label) => {
      try {
        const bm = addBookmark(snapshot, label);
        console.log(`Bookmarked "${snapshot}" as "${bm.label}"`);
      } catch (err) {
        console.error('Error adding bookmark:', err.message);
        process.exit(1);
      }
    });

  cmd
    .command('remove <snapshot>')
    .description('remove a bookmark')
    .action((snapshot) => {
      const removed = removeBookmark(snapshot);
      if (removed) {
        console.log(`Removed bookmark for "${snapshot}"`);
      } else {
        console.error(`No bookmark found for "${snapshot}"`);
        process.exit(1);
      }
    });

  cmd
    .command('get <snapshot>')
    .description('show bookmark details for a snapshot')
    .action((snapshot) => {
      const bm = getBookmark(snapshot);
      if (!bm) {
        console.error(`No bookmark found for "${snapshot}"`);
        process.exit(1);
      }
      console.log(`${snapshot}: "${bm.label}" — created ${bm.createdAt}`);
    });

  cmd
    .command('list')
    .description('list all bookmarks')
    .action(() => {
      const bookmarks = listBookmarks();
      console.log(formatBookmarks(bookmarks));
    });
}

module.exports = { registerBookmarkCommand };
