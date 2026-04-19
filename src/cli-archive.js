#!/usr/bin/env node
const { program } = require('commander');
const { archiveSession, unarchiveSession, listArchived } = require('./commands/archive');

program
  .command('archive <name>')
  .description('Archive a session (moves it to archived/)')
  .option('--keep', 'Keep the original session after archiving')
  .option('--force', 'Overwrite existing archived session')
  .action(async (name, opts) => {
    try {
      const archived = await archiveSession(name, opts);
      console.log(`Session "${name}" archived as "${archived}"`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('unarchive <name>')
  .description('Restore an archived session')
  .option('--as <newName>', 'Restore under a different name')
  .option('--force', 'Overwrite existing session')
  .action(async (name, opts) => {
    try {
      const restored = await unarchiveSession(name, opts);
      console.log(`Session restored as "${restored}"`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('list-archived')
  .description('List all archived sessions')
  .action(async () => {
    try {
      const sessions = await listArchived();
      if (sessions.length === 0) {
        console.log('No archived sessions found.');
      } else {
        sessions.forEach(s => console.log(s.replace('archived/', '')));
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
