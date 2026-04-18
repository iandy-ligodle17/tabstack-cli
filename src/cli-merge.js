#!/usr/bin/env node
const { program } = require('commander');
const { merge } = require('./commands/merge');

program
  .name('tabstack merge')
  .description('Merge multiple saved sessions into one')
  .argument('<sessions...>', 'session names to merge')
  .requiredOption('-t, --target <name>', 'name for the merged session')
  .option('--dedupe', 'remove duplicate URLs', false)
  .action(async (sessions, options) => {
    try {
      const result = await merge(sessions, options.target, { dedupe: options.dedupe });
      console.log(`Merged ${sessions.length} sessions into "${result.name}" (${result.tabs.length} tabs)`);
      if (options.dedupe) {
        console.log('Duplicate URLs were removed.');
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
