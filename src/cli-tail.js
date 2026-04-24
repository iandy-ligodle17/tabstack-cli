#!/usr/bin/env node
'use strict';

const { tailSession } = require('./commands/tail');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack tail <session> <count> [--save]');
  console.log('');
  console.log('Keep only the last N tabs of a session.');
  console.log('');
  console.log('Arguments:');
  console.log('  session   Name of the session to tail');
  console.log('  count     Number of tabs to keep from the end');
  console.log('');
  console.log('Options:');
  console.log('  --save    Overwrite the session with the trimmed result');
  console.log('');
  console.log('Examples:');
  console.log('  tabstack tail work 5');
  console.log('  tabstack tail research 10 --save');
}

if (args.length < 2 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(args.length < 2 ? 1 : 0);
}

const [name, rawCount, ...flags] = args;
const count = parseInt(rawCount, 10);
const save = flags.includes('--save');

if (isNaN(count) || count < 1) {
  console.error('Error: count must be a positive integer');
  process.exit(1);
}

tailSession(name, count, { save })
  .then(result => {
    console.log(result.message);
    if (save && result.changed) {
      console.log(`\nSession "${name}" updated.`);
    }
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
