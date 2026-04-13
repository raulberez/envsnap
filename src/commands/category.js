const {
  setCategory,
  getCategory,
  removeCategory,
  listByCategory,
  getAllCategories,
} = require('../snapshot-category');

function registerCategoryCommand(program) {
  const cat = program
    .command('category')
    .description('manage snapshot categories');

  cat
    .command('set <snapshot> <category>')
    .description('assign a category to a snapshot')
    .action((snapshot, category) => {
      setCategory(snapshot, category);
      console.log(`Set category "${category}" on snapshot "${snapshot}".`);
    });

  cat
    .command('get <snapshot>')
    .description('get the category of a snapshot')
    .action((snapshot) => {
      const category = getCategory(snapshot);
      if (category) {
        console.log(`${snapshot}: ${category}`);
      } else {
        console.log(`No category set for "${snapshot}".`);
      }
    });

  cat
    .command('remove <snapshot>')
    .description('remove the category from a snapshot')
    .action((snapshot) => {
      removeCategory(snapshot);
      console.log(`Removed category from "${snapshot}".`);
    });

  cat
    .command('list [category]')
    .description('list snapshots by category, or list all categories')
    .action((category) => {
      if (category) {
        const snaps = listByCategory(category);
        if (snaps.length === 0) {
          console.log(`No snapshots in category "${category}".`);
        } else {
          console.log(`Snapshots in "${category}":`);
          snaps.forEach((s) => console.log(`  ${s}`));
        }
      } else {
        const all = getAllCategories();
        if (all.length === 0) {
          console.log('No categories defined.');
        } else {
          console.log('Categories:');
          all.forEach((c) => console.log(`  ${c}`));
        }
      }
    });
}

module.exports = { registerCategoryCommand };
