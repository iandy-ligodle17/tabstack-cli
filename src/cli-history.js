#!/usr/bin/env node
const { program } = require('commander');
const { historyCommand } = require('./commands/history');

program
  .name('tabstack history')
  .description('Show recently saved sessions sorted by date')
  .option('-n, --limit <number>', 'max number of sessions to show', '10')
  .action(async (options) => {
    const limit = parseInt(options.limit, 10);
    if (isNaN(limit) || limit < 1) {
      console.error('Error: --limit must be a positive integer');
      process.exit(1);
    }
    try {
      const output = await historyCommand({ limit });
      console.log(output);
    } catch (err) {
      console.error('Error fetching history:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
