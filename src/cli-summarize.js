#!/usr/bin/env node
'use strict';

const { summarize } = require('./commands/summarize');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack summarize <session-name>');
  console.log('');
  console.log('Print a summary of a saved session including tab count,');
  console.log('unique domains, tags, notes, and pinned tab status.');
  console.log('');
  console.log('Example:');
  console.log('  tabstack summarize work');
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

const name = args[0];

summarize(name)
  .then(output => {
    console.log(output);
  })
  .catch(err => {
    if (err.code === 'ENOENT') {
      console.error(`Error: session "${name}" not found.`);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  });
