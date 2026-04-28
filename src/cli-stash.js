#!/usr/bin/env node
'use strict';

const { stashSession, popStash, listStashes, formatStashList } = require('./commands/stash');

const [,, subcommand, sessionName] = process.argv;

function printUsage() {
  console.log('Usage:');
  console.log('  tabstack-stash <session>        Stash a session');
  console.log('  tabstack-stash pop <session>    Restore latest stash');
  console.log('  tabstack-stash list             List all stashes');
}

if (!subcommand) {
  printUsage();
  process.exit(1);
}

try {
  if (subcommand === 'list') {
    const stashes = listStashes();
    console.log(formatStashList(stashes));
  } else if (subcommand === 'pop') {
    if (!sessionName) {
      console.error('Error: session name required for pop');
      process.exit(1);
    }
    const removed = popStash(sessionName);
    console.log(`Restored stash "${removed}" into session "${sessionName}".`);
  } else {
    // treat subcommand as the session name to stash
    const name = subcommand;
    const stashName = stashSession(name);
    console.log(`Session "${name}" stashed as "${stashName}".`);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
