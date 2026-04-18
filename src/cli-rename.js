const { program } = require('commander');
const { renameSession } = require('./commands/rename');

program
  .command('rename <oldName> <newName>')
  .description('Rename a saved tab session')
  .option('-f, --force', 'overwrite existing session with the new name')
  .action(async (oldName, newName, options) => {
    try {
      const result = await renameSession(oldName, newName, { force: options.force });
      console.log(`Session "${oldName}" renamed to "${result.name}"`);
      if (result.previousName) {
        console.log(`  tabs: ${result.tabs ? result.tabs.length : 0}`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

module.exports = { program };
