#!/usr/bin/env node
'use strict';

const { swapTabs, formatSwapResult } = require('./commands/swap');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack swap <session> <indexA> <indexB>');
  console.log('');
  console.log('Swap two tabs by their zero-based positions within a session.');
  console.log('');
  console.log('Arguments:');
  console.log('  session   Name of the session to modify');
  console.log('  indexA    Zero-based index of the first tab');
  console.log('  indexB    Zero-based index of the second tab');
  console.log('');
  console.log('Example:');
  console.log('  tabstack swap work 0 3');
}

if (args.length < 3 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(args.length < 3 ? 1 : 0);
}

const [sessionName, rawA, rawB] = args;
const indexA = parseInt(rawA, 10);
const indexB = parseInt(rawB, 10);

if (isNaN(indexA) || isNaN(indexB)) {
  console.error('Error: indexA and indexB must be integers.');
  printUsage();
  process.exit(1);
}

swapTabs(sessionName, indexA, indexB)
  .then((updated) => {
    console.log(formatSwapResult(sessionName, indexA, indexB, updated));
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
