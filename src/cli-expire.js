#!/usr/bin/env node
'use strict';

const { expireCommand, formatExpiry, isExpired } = require('./commands/expire');
const { loadSession } = require('./storage');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage:');
  console.log('  tabstack expire <session> [days]   Set expiry in days (default: 30)');
  console.log('  tabstack expire <session> --clear  Remove expiry from session');
  console.log('  tabstack expire <session> --check  Show current expiry status');
  process.exit(0);
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
}

const name = args[0];
const flag = args.find(a => a.startsWith('--'));
const dayArg = args[1] && !args[1].startsWith('--') ? args[1] : undefined;

async function main() {
  try {
    if (flag === '--check') {
      const session = await loadSession(name);
      const status = formatExpiry(session);
      const expired = isExpired(session);
      console.log(`Session "${name}": ${status}`);
      if (expired) {
        console.warn('Warning: this session has expired.');
        process.exit(1);
      }
      return;
    }

    const opts = { clear: flag === '--clear' };
    const message = await expireCommand(name, dayArg, opts);
    console.log(message);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
