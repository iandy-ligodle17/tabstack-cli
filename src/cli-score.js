#!/usr/bin/env node
'use strict';

const { runScore } = require('./commands/score');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack score <session>');
  console.log('');
  console.log('Score and rank tabs in a session by heuristic importance.');
  console.log('');
  console.log('Examples:');
  console.log('  tabstack score work');
  console.log('  tabstack score research');
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

const sessionName = args[0];

runScore(sessionName).catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
