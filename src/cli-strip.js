#!/usr/bin/env node
'use strict';

const { stripSession } = require('./commands/strip');

const args = process.argv.slice(2);

function printUsage() {
  console.log(`
Usage: tabstack strip <session> [options]

Strip query strings and/or fragments from tab URLs in a session.

Options:
  --no-query      Keep query strings (default: strip them)
  --no-fragment   Keep fragments/hashes (default: strip them)
  --dry-run       Preview changes without saving
  --help          Show this help message
`.trim());
}

if (args.includes('--help') || args.length === 0) {
  printUsage();
  process.exit(0);
}

const sessionName = args[0];
const query = !args.includes('--no-query');
const fragment = !args.includes('--no-fragment');
const dryRun = args.includes('--dry-run');

(async () => {
  try {
    const result = await stripSession(sessionName, { query, fragment, dryRun });
    if (dryRun) {
      console.log(`[dry-run] ${result.message}`);
      result.stripped.forEach((tab, i) => {
        if (tab.url !== result.original[i].url) {
          console.log(`  ${result.original[i].url}`);
          console.log(`  → ${tab.url}`);
        }
      });
    } else {
      console.log(result.message);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
