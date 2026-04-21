#!/usr/bin/env node
'use strict';

const { compress, formatCompressResult } = require('./commands/compress');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack compress <session-name> [--dry-run]');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run   Show what would be removed without saving changes');
}

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

const dryRun = args.includes('--dry-run');
const name = args.find(a => !a.startsWith('--'));

if (!name) {
  console.error('Error: session name is required.');
  printUsage();
  process.exit(1);
}

(async () => {
  try {
    const result = await compress(name, { dryRun });
    const msg = formatCompressResult(result);
    console.log(dryRun ? `[dry-run] ${msg}` : msg);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
