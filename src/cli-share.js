#!/usr/bin/env node
const { program } = require('commander');
const { shareSession } = require('./commands/share');

program
  .name('tabstack-share')
  .description('Generate a shareable link for a tab session')
  .argument('<name>', 'session name')
  .option('--json', 'output as JSON')
  .option('--base-url <url>', 'custom base URL for the share link')
  .action(async (name, options) => {
    try {
      const result = await shareSession(name, {
        json: options.json,
        baseUrl: options.baseUrl,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
