const { setNote, getNote, deleteNote, listNotes, formatNotesList } = require('../snapshot-notes');

function registerNotesCommand(program) {
  const notes = program
    .command('notes')
    .description('manage notes attached to snapshots');

  notes
    .command('set <snapshot> <note>')
    .description('attach a note to a snapshot')
    .action((snapshot, note) => {
      const entry = setNote(snapshot, note);
      console.log(`Note set for "${snapshot}": ${entry.text}`);
    });

  notes
    .command('get <snapshot>')
    .description('show note for a snapshot')
    .action((snapshot) => {
      const note = getNote(snapshot);
      if (!note) {
        console.log(`No note found for "${snapshot}".`);
        return;
      }
      console.log(`${snapshot} (${note.updatedAt.slice(0, 10)}): ${note.text}`);
    });

  notes
    .command('delete <snapshot>')
    .description('remove note from a snapshot')
    .action((snapshot) => {
      const removed = deleteNote(snapshot);
      if (removed) {
        console.log(`Note deleted for "${snapshot}".`);
      } else {
        console.log(`No note found for "${snapshot}".`);
      }
    });

  notes
    .command('list')
    .description('list all snapshot notes')
    .action(() => {
      const all = listNotes();
      console.log(formatNotesList(all));
    });
}

module.exports = { registerNotesCommand };
