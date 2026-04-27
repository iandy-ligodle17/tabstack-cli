#!/usr/bin/env node
'use strict';

const { mask, formatMaskResult } = require('./commands/mask');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack mask <session-name> [--save]');
  console.log('');
  console.log('Mask sensitive URL parameters (tokens, passwords, API keys) in a session.');
  console.log('');
  console.log('Options:');
  console.log('  --save    Overwrite the session with masked URLs');
  console.log('  --help    Show this help message');
}

if (args.includes('--help') || args.length === 0) {
  printUsage();
  process.exit(0);
}

const name = args[0];
const shouldSave = args.includes('--save');

if (!name) {
  console.error('Error: session name is required.');
  printUsage();
  process.exit(1);
}

mask(name, { save: shouldSave })
  .then(({ session, maskedCount }) => {
    console.log(formatMaskResult(name, maskedCount));
    if (!shouldSave && maskedCount > 0) {
      console.log('Tip: use --save to persist the masked session.');
    }
    if (maskedCount > 0) {
      console.log('\nAffected tabs:');
      session.tabs
        .filter(t => t.url.includes('***'))
        .forEach(t => console.log(`  ${t.title || '(no title)'} — ${t.url}`));
    }
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
