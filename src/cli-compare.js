#!/usr/bin/env node
'use strict';

const { compareCommand } = require('./commands/compare');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: tabstack compare <session1> <session2>');
  console.log('');
  console.log('Compare two sessions and show tab differences.');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help   Show this help message');
  process.exit(0);
}

const [name1, name2] = args;

if (!name1 || !name2) {
  console.error('Error: two session names required');
  console.error('Usage: tabstack compare <session1> <session2>');
  process.exit(1);
}

compareCommand(name1, name2).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
