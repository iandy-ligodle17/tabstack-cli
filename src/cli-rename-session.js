#!/usr/bin/env node
'use strict';

const { renameSession, formatRenameResult } = require('./commands/rename-session');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack rename-session <old-name> <new-name>');
  console.log('');
  console.log('Arguments:');
  console.log('  old-name   Current name of the session');
  console.log('  new-name   New name for the session');
  console.log('');
  console.log('Example:');
  console.log('  tabstack rename-session work work-2024');
}

if (args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

const [oldName, newName] = args;

if (!oldName || !newName) {
  console.error('Error: Both old and new session names are required.');
  console.error('');
  printUsage();
  process.exit(1);
}

renameSession(oldName, newName)
  .then(() => {
    console.log(formatRenameResult(oldName, newName));
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
