#!/usr/bin/env node
'use strict';

const { runNormalize, formatNormalizeResult } = require('./commands/normalize');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack normalize <session> [--dry-run]');
  console.log('');
  console.log('Normalize URLs in a session by removing tracking parameters');
  console.log('and cleaning up trailing slashes.');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run   Preview changes without saving');
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(0);
}

const sessionName = args[0];
const dryRun = args.includes('--dry-run');

(async () => {
  try {
    const { stats } = await runNormalize(sessionName, { dryRun });
    const output = formatNormalizeResult(stats, sessionName);
    console.log(output);
    if (dryRun && stats.changed > 0) {
      console.log('(dry run — no changes saved)');
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Session not found: ${sessionName}`);
    } else {
      console.error(`Error: ${err.message}`);
    }
    process.exit(1);
  }
})();
