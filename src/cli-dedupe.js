#!/usr/bin/env node
const { program } = require('commander');
const { dedupe } = require('./commands/dedupe');

program
  .name('tabstack dedupe')
  .description('Remove duplicate tabs from a session')
  .argument('<session>', 'session name to deduplicate')
  .option('--dry-run', 'preview changes without saving')
  .option('--title-only', 'deduplicate by tab title instead of URL')
  .action(async (session, options) => {
    try {
      const result = await dedupe(session, {
        dryRun: options.dryRun,
        titleOnly: options.titleOnly,
      });

      if (!result.changed) {
        console.log(`No duplicates found in "${session}".`);
        return;
      }

      const action = options.dryRun ? '[dry run] Would remove' : 'Removed';
      console.log(`${action} ${result.removed} duplicate tab(s) from "${session}".`);
      console.log(`Tabs: ${result.original} → ${result.deduped}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
