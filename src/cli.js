#!/usr/bin/env node
const { program } = require('commander');
const { capture } = require('./commands/capture');
const { restore } = require('./commands/restore');
const { list } = require('./commands/list');
const { deleteSession } = require('./storage');

program
  .name('tabstack')
  .description('Save and restore browser tab sessions from the terminal')
  .version('1.0.0');

program
  .command('capture <name>')
  .description('Capture current browser tabs into a named session')
  .option('-b, --browser <browser>', 'browser to use (chrome, firefox)', 'chrome')
  .action((name, opts) => capture(name, opts));

program
  .command('restore <name>')
  .description('Restore a saved session by opening its tabs')
  .option('-b, --browser <browser>', 'browser to use', 'chrome')
  .action((name, opts) => restore(name, opts));

program
  .command('list')
  .description('List all saved sessions')
  .option('-v, --verbose', 'show tab count and date')
  .option('-u, --urls', 'show individual URLs (implies --verbose)')
  .action((opts) => {
    if (opts.urls) opts.verbose = true;
    list(opts);
  });

program
  .command('delete <name>')
  .description('Delete a saved session')
  .action(async (name) => {
    try {
      await deleteSession(name);
      console.log(`Deleted session "${name}".`);
    } catch (err) {
      console.error(`Could not delete "${name}": ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
