#!/usr/bin/env node
'use strict';

const { splitSession, formatSplitResult } = require('./commands/split');

const args = process.argv.slice(2);

function printUsage() {
  console.log(`
Usage: tabstack split <session> [options]

Options:
  --size <n>      Split into chunks of n tabs (default: 10)
  --by-domain     Split tabs by their domain

Examples:
  tabstack split work --size 5
  tabstack split research --by-domain
`.trim());
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(0);
}

const sessionName = args[0];
const options = {};

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--by-domain') {
    options.byDomain = true;
  } else if (args[i] === '--size' && args[i + 1]) {
    const n = parseInt(args[i + 1], 10);
    if (isNaN(n) || n < 1) {
      console.error('Error: --size must be a positive integer.');
      process.exit(1);
    }
    options.size = n;
    i++;
  }
}

splitSession(sessionName, options)
  .then((savedNames) => {
    console.log(formatSplitResult(sessionName, savedNames));
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
