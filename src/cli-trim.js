#!/usr/bin/env node
const { program } = require('commander');
const { trimSession } = require('./commands/trim');

program
  .name('tabstack trim')
  .description('Remove tabs from a session by pattern or count limit')
  .argument('<name>', 'session name to trim')
  .option('-p, --pattern <regex>', 'remove tabs whose URL or title matches this regex')
  .option('-m, --max-tabs <number>', 'keep only the first N tabs', parseInt)
  .action(async (name, options) => {
    try {
      const result = await trimSession(name, {
        pattern: options.pattern,
        maxTabs: options.maxTabs,
      });
      console.log(`Trimmed session "${result.name}":`);
      console.log(`  Before: ${result.originalCount} tabs`);
      console.log(`  After:  ${result.newCount} tabs`);
      console.log(`  Removed: ${result.removedCount} tabs`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
