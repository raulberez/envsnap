const { saveProfile, deleteProfile, loadProfiles, getProfile, formatProfileList } = require('../profile');

function registerProfileCommand(program) {
  const profile = program
    .command('profile')
    .description('Manage named profiles (groups of snapshots)');

  profile
    .command('save <name> <snapshots...>')
    .description('Save a profile with one or more snapshot names')
    .action((name, snapshots) => {
      try {
        saveProfile(name, snapshots);
        console.log(`Profile '${name}' saved with snapshots: ${snapshots.join(', ')}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  profile
    .command('delete <name>')
    .description('Delete a profile by name')
    .action((name) => {
      try {
        deleteProfile(name);
        console.log(`Profile '${name}' deleted.`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  profile
    .command('show <name>')
    .description('Show details of a profile')
    .action((name) => {
      const p = getProfile(name);
      if (!p) {
        console.error(`Profile '${name}' not found.`);
        process.exit(1);
      }
      console.log(`Profile: ${name}`);
      console.log(`Snapshots: ${p.snapshots.join(', ')}`);
      console.log(`Created: ${p.createdAt}`);
    });

  profile
    .command('list')
    .description('List all profiles')
    .action(() => {
      const profiles = loadProfiles();
      console.log(formatProfileList(profiles));
    });
}

module.exports = { registerProfileCommand };
