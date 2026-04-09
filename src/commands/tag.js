const { addTag, removeTag, getSnapshotsByTag, getTagsForSnapshot, listAllTags } = require('../tag');

function registerTagCommand(program) {
  const tag = program
    .command('tag')
    .description('manage tags for snapshots');

  tag
    .command('add <snapshot> <tag>')
    .description('add a tag to a snapshot')
    .action((snapshot, tagName) => {
      addTag(snapshot, tagName);
      console.log(`Tagged "${snapshot}" with "${tagName}"`);
    });

  tag
    .command('remove <snapshot> <tag>')
    .description('remove a tag from a snapshot')
    .action((snapshot, tagName) => {
      removeTag(snapshot, tagName);
      console.log(`Removed tag "${tagName}" from "${snapshot}"`);
    });

  tag
    .command('list [tag]')
    .description('list snapshots by tag, or list all tags')
    .action((tagName) => {
      if (tagName) {
        const snapshots = getSnapshotsByTag(tagName);
        if (snapshots.length === 0) {
          console.log(`No snapshots found for tag "${tagName}"`);
        } else {
          console.log(`Snapshots tagged "${tagName}":`);
          snapshots.forEach(s => console.log(`  ${s}`));
        }
      } else {
        const all = listAllTags();
        const entries = Object.entries(all);
        if (entries.length === 0) {
          console.log('No tags defined.');
        } else {
          entries.forEach(([t, names]) => {
            console.log(`${t}: ${names.join(', ')}`);
          });
        }
      }
    });

  tag
    .command('show <snapshot>')
    .description('show all tags for a snapshot')
    .action((snapshot) => {
      const tags = getTagsForSnapshot(snapshot);
      if (tags.length === 0) {
        console.log(`No tags for "${snapshot}"`);
      } else {
        console.log(`Tags for "${snapshot}": ${tags.join(', ')}`);
      }
    });
}

module.exports = { registerTagCommand };
