#!/usr/bin/env node
const { program } = require('commander');
const { sortSession } = require('./commands/sort');

program
  .name('tabstack sort')
  .description('Sort tabs within a saved session')
  .argument('<name>', 'session name')
  .option('--by <field>', 'field to sort by: url, title, domain', 'url')
  .action(async (name, options) => {
    try {
      const session = await sortSession(name, options.by);
      console.log(`Sorted ${session.tabs.length} tabs in "${name}" by ${options.by}.`);
      session.tabs.forEach((tab, i) => {
        console.log(`  ${i + 1}. ${tab.title || tab.url}`);
      });
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
