#!/usr/bin/env node
'use strict';

const { cloneSession } = require('./commands/clone');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack clone <source> <target> [--filter <string>]');
  console.log('');
  console.log('  source   Name of the session to clone');
  console.log('  target   Name for the new cloned session');
  console.log('  --filter Only include tabs whose URL contains <string>');
}

if (args.length < 2) {
  printUsage();
  process.exit(1);
}

const [source, target, ...rest] = args;

const filterIndex = rest.indexOf('--filter');
const filter = filterIndex !== -1 ? rest[filterIndex + 1] : undefined;

if (filterIndex !== -1 && !filter) {
  console.error('Error: --filter requires a value.');
  process.exit(1);
}

cloneSession(source, target, { filter })
  .then(session => {
    const count = session.tabs.length;
    console.log(`Cloned "${source}" → "${target}" (${count} tab${count !== 1 ? 's' : ''})`);
    if (filter) {
      console.log(`Filter applied: "${filter}"`);
    }
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
