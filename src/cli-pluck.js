#!/usr/bin/env node
'use strict';

const { pluckTabs, formatPluckResult } = require('./commands/pluck');

function printUsage() {
  console.log('Usage: tabstack pluck <session> <indices> <dest>');
  console.log('');
  console.log('Arguments:');
  console.log('  session   Source session name');
  console.log('  indices   Comma-separated 0-based tab indices (e.g. 0,2,4)');
  console.log('  dest      Destination session name');
  console.log('');
  console.log('Examples:');
  console.log('  tabstack pluck work 0,2,4 focus');
  console.log('  tabstack pluck research 0 quick-ref');
}

async function main(argv) {
  const [sessionName, indicesArg, destName] = argv;

  if (!sessionName || !indicesArg || !destName) {
    printUsage();
    process.exit(1);
  }

  const indices = indicesArg
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      const n = parseInt(s, 10);
      if (isNaN(n)) {
        console.error(`Invalid index: "${s}"`);
        process.exit(1);
      }
      return n;
    });

  if (indices.length === 0) {
    console.error('No valid indices provided.');
    process.exit(1);
  }

  try {
    const result = await pluckTabs(sessionName, indices, destName);
    console.log(formatPluckResult(result));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main(process.argv.slice(2));
