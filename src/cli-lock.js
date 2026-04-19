#!/usr/bin/env node
const { program } = require('commander');
const { lockSession, unlockSession, isLocked } = require('./commands/lock');

program
  .name('tabstack-lock')
  .description('Lock or unlock a saved tab session with a password');

program
  .command('lock <session>')
  .description('Lock a session with a password')
  .option('-p, --password <password>', 'Password to lock session')
  .action(async (session, opts) => {
    const password = opts.password || process.env.TABSTACK_PASSWORD;
    if (!password) {
      console.error('Error: password required (--password or TABSTACK_PASSWORD)');
      process.exit(1);
    }
    try {
      await lockSession(session, password);
      console.log(`Session "${session}" locked.`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('unlock <session>')
  .description('Unlock a session with a password')
  .option('-p, --password <password>', 'Password to unlock session')
  .action(async (session, opts) => {
    const password = opts.password || process.env.TABSTACK_PASSWORD;
    if (!password) {
      console.error('Error: password required (--password or TABSTACK_PASSWORD)');
      process.exit(1);
    }
    try {
      await unlockSession(session, password);
      console.log(`Session "${session}" unlocked.`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('status <session>')
  .description('Check if a session is locked')
  .action(async (session) => {
    try {
      const locked = await isLocked(session);
      console.log(`Session "${session}" is ${locked ? 'locked' : 'unlocked'}.`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
