#!/usr/bin/env node
'use strict';

const { clusterTabs, formatClusterResult } = require('./commands/cluster');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack cluster <session> [--min-size <n>]');
  console.log('');
  console.log('Groups tabs in a session into clusters by domain.');
  console.log('');
  console.log('Options:');
  console.log('  --min-size <n>   Minimum tabs per cluster (default: 2)');
  console.log('  --help           Show this help message');
}

if (args.includes('--help') || args.length === 0) {
  printUsage();
  process.exit(0);
}

const sessionName = args[0];

let minSize = 2;
const minSizeIdx = args.indexOf('--min-size');
if (minSizeIdx !== -1 && args[minSizeIdx + 1]) {
  const parsed = parseInt(args[minSizeIdx + 1], 10);
  if (!isNaN(parsed) && parsed >= 1) {
    minSize = parsed;
  } else {
    console.error('Error: --min-size must be a positive integer.');
    process.exit(1);
  }
}

clusterTabs(sessionName, { minSize })
  .then((result) => {
    console.log(formatClusterResult(result));
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
