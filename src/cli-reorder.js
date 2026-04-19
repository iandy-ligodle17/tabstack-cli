#!/usr/bin/env node
const { reorderSession, parseIndices } = require('./commands/reorder');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: tabstack reorder <session> <indices>');
  console.log('');
  console.log('Moves tabs at the given comma-separated indices to the front.');
  console.log('');
  console.log('Examples:');
  console.log('  tabstack reorder work 2,0,1   # bring tabs 2,0,1 to front');
  console.log('  tabstack reorder work 0       # no-op, tab 0 already first');
  process.exit(1);
}

const [name, indicesStr] = args;

let indices;
try {
  indices = parseIndices(indicesStr);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

reorderSession(name, indices)
  .then(session => {
    console.log(`Reordered tabs in "${name}":`);
    session.tabs.forEach((tab, i) => {
      console.log(`  ${i}. ${tab.title || tab.url}`);
    });
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
