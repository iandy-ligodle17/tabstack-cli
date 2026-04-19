#!/usr/bin/env node
const { cleanupSessions, formatCleanupResult } = require('./commands/cleanup');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const minTabsArg = args.find(a => a.startsWith('--min-tabs='));
const minTabs = minTabsArg ? parseInt(minTabsArg.split('=')[1], 10) : 1;

if (args.includes('--help')) {
  console.log(`usage: tabstack cleanup [options]

options:
  --dry-run          show what would be removed without deleting
  --min-tabs=<n>     remove sessions with fewer than n tabs (default: 1)
  --help             show this help`);
  process.exit(0);
}

if (isNaN(minTabs) || minTabs < 0) {
  console.error('error: --min-tabs must be a non-negative integer');
  process.exit(1);
}

cleanupSessions({ dryRun, minTabs })
  .then(result => {
    console.log(formatCleanupResult(result));
  })
  .catch(err => {
    console.error('cleanup failed:', err.message);
    process.exit(1);
  });
