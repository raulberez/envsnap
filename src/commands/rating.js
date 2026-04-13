const { setRating, getRating, removeRating, listRatings, formatRating } = require('../snapshot-rating');

function registerRatingCommand(program) {
  const rating = program
    .command('rating')
    .description('manage star ratings for snapshots (1–5)');

  rating
    .command('set <name> <score>')
    .description('set a rating (1-5) for a snapshot')
    .action((name, score) => {
      try {
        const entry = setRating(name, parseInt(score, 10));
        console.log(`Rated "${name}": ${entry.score}/5`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  rating
    .command('get <name>')
    .description('show the rating for a snapshot')
    .action((name) => {
      const entry = getRating(name);
      console.log(formatRating(name, entry));
    });

  rating
    .command('remove <name>')
    .description('remove the rating for a snapshot')
    .action((name) => {
      const removed = removeRating(name);
      if (removed) {
        console.log(`Rating removed for "${name}".`);
      } else {
        console.log(`No rating found for "${name}".`);
      }
    });

  rating
    .command('list')
    .description('list all snapshot ratings')
    .action(() => {
      const all = listRatings();
      const entries = Object.entries(all);
      if (entries.length === 0) {
        console.log('No ratings recorded.');
        return;
      }
      entries
        .sort((a, b) => b[1].score - a[1].score)
        .forEach(([name, entry]) => console.log(formatRating(name, entry)));
    });
}

module.exports = { registerRatingCommand };
