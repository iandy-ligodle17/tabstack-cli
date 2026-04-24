#!/usr/bin/env node
'use strict';

const { sliceSession, formatSliceResult } = require('./commands/slice');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack slice <session> <start> <end> [dest]');
  console.log('');
  console.log('  Extract a contiguous range of tabs into a new session.');
  console.log('');
  console.log('Arguments:');
  console.log('  session   Name of the source session');
  console.log('  start     Start index (0-based, inclusive)');
  console.log('  end       End index (exclusive)');
  console.log('  dest      Name for the new session (default: <session>-slice)');
  console.log('');
  console.log('Examples:');
  console.log('  tabstack slice work 0 5');
  console.log('  tabstack slice work 2 8 work-morning');
}

if (args.length < 3) {
  printUsage();
  process.exit(1);
}

const [name, rawStart, rawEnd, dest] = args;
const start = parseInt(rawStart, 10);
const end = parseInt(rawEnd, 10);

if (isNaN(start) || isNaN(end)) {
  console.error('Error: start and end must be integers.');
  process.exit(1);
}

sliceSession(name, start, end, dest)
  .then((result) => {
    console.log(formatSliceResult(result));
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
