#!/usr/bin/env node
'use strict';

const { pivotSession, formatPivotResult } = require('./commands/pivot');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack pivot <session> [--prefix <prefix>] [--save]');
  console.log('');
  console.log('Split a session into multiple sessions grouped by domain.');
  console.log('');
  console.log('Options:');
  console.log('  --prefix <name>  Prefix for generated session names (default: session name)');
  console.log('  --save           Persist the resulting sessions to disk');
}

if (!args.length || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(0);
}

const sessionName = args[0];
let prefix = sessionName;
let save = false;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--prefix' && args[i + 1]) {
    prefix = args[++i];
  } else if (args[i] === '--save') {
    save = true;
  } else {
    console.error(`Unknown option: ${args[i]}`);
    printUsage();
    process.exit(1);
  }
}

pivotSession(sessionName, { prefix, save })
  .then(results => {
    console.log(formatPivotResult(results));
    if (save) {
      console.log(`\nSaved ${results.length} session(s).`);
    }
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
