const { diffSnapshots, formatDiff } = require('../diff');
const chalk = require('chalk');

/**
 * Command handler for diff operation
 * @param {string} snapshot1 - First snapshot name
 * @param {string} snapshot2 - Second snapshot name or 'current' for current env
 * @param {Object} options - Command options
 */
async function diffCommand(snapshot1, snapshot2, options = {}) {
  try {
    let diffResult;

    if (snapshot2 === 'current') {
      // Compare snapshot with current environment
      const { loadSnapshot } = require('../snapshot');
      const snap1 = await loadSnapshot(snapshot1);
      const snap2 = {
        timestamp: new Date().toISOString(),
        variables: process.env
      };
      
      const { compareSnapshots } = require('../diff');
      diffResult = {
        name1: snapshot1,
        name2: 'current',
        timestamp1: snap1.timestamp,
        timestamp2: snap2.timestamp,
        diff: compareSnapshots(snap1, snap2)
      };
    } else {
      // Compare two snapshots
      diffResult = await diffSnapshots(snapshot1, snapshot2);
    }

    // Display header
    console.log(chalk.bold('\nComparing snapshots:'));
    console.log(chalk.gray(`  ${diffResult.name1} (${new Date(diffResult.timestamp1).toLocaleString()})`));
    console.log(chalk.gray(`  ${diffResult.name2} (${new Date(diffResult.timestamp2).toLocaleString()})`));

    const { diff } = diffResult;
    const hasChanges = 
      Object.keys(diff.added).length > 0 ||
      Object.keys(diff.removed).length > 0 ||
      Object.keys(diff.modified).length > 0;

    if (!hasChanges) {
      console.log(chalk.green('\n✓ No differences found'));
      return;
    }

    // Display added variables
    if (Object.keys(diff.added).length > 0) {
      console.log(chalk.green('\n+ Added:'));
      Object.entries(diff.added).forEach(([key, value]) => {
        console.log(chalk.green(`  + ${key}=${value}`));
      });
    }

    // Display removed variables
    if (Object.keys(diff.removed).length > 0) {
      console.log(chalk.red('\n- Removed:'));
      Object.entries(diff.removed).forEach(([key, value]) => {
        console.log(chalk.red(`  - ${key}=${value}`));
      });
    }

    // Display modified variables
    if (Object.keys(diff.modified).length > 0) {
      console.log(chalk.yellow('\n~ Modified:'));
      Object.entries(diff.modified).forEach(([key, { old, new: newVal }]) => {
        console.log(chalk.yellow(`  ~ ${key}`));
        console.log(chalk.red(`    - ${old}`));
        console.log(chalk.green(`    + ${newVal}`));
      });
    }

    // Display summary
    console.log(chalk.bold('\nSummary:'));
    console.log(`  Added: ${Object.keys(diff.added).length}`);
    console.log(`  Removed: ${Object.keys(diff.removed).length}`);
    console.log(`  Modified: ${Object.keys(diff.modified).length}`);
    console.log(`  Unchanged: ${Object.keys(diff.unchanged).length}`);
    console.log();

  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = diffCommand;
