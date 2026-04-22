#!/usr/bin/env node
'use strict';

const { reverseTabs, formatReverseResult } = require('./commands/reverse');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack reverse <session> [--output <name>]');
  console.log('');
  console.log('Options:');
  console.log('  --output <name>   Save reversed tabs to a new session instead of overwriting');
  console.log('');
  console.log('Examples:');
  console.log('  tabstack reverse work');
  console.log('  tabstack reverse work --output work-reversed');
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(0);
}

const sessionName = args[0];
const outputIndex = args.indexOf('--output');
const output = outputIndex !== -1 ? args[outputIndex + 1] : undefined;

if (output === undefined && outputIndex !== -1) {
  console.error('Error: --output requires a session name');
  process.exit(1);
}

reverseTabs(sessionName, { output })
  .then((result) => {
    console.log(formatReverseResult(result));
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
