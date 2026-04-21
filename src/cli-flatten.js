#!/usr/bin/env node
'use strict';

const { flatten, formatFlattenResult } = require('./commands/flatten');

const args = process.argv.slice(2);

function printUsage() {
  console.log(`Usage: tabstack flatten <session> [options]

Options:
  --keep-last      Keep the last tab per domain instead of the first
  --dedupe-path    Deduplicate by full URL path, not just origin
  --output <name>  Save result to a different session name
  --dry-run        Preview changes without saving

Examples:
  tabstack flatten work
  tabstack flatten work --keep-last
  tabstack flatten work --output work-flat
  tabstack flatten research --dedupe-path`);
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printUsage();
  process.exit(0);
}

const name = args[0];
const keepLast = args.includes('--keep-last');
const dedupePath = args.includes('--dedupe-path');
const dryRun = args.includes('--dry-run');
const outputIdx = args.indexOf('--output');
const output = outputIdx !== -1 ? args[outputIdx + 1] : null;

if (output !== null && !output) {
  console.error('Error: --output requires a session name');
  process.exit(1);
}

(async () => {
  try {
    const options = { keepLast, dedupePath, output };

    if (dryRun) {
      const { loadSession } = require('./storage');
      const { flattenSession } = require('./commands/flatten');
      const session = await loadSession(name);
      const result = flattenSession(session, options);
      console.log('[dry-run] ' + formatFlattenResult(session, result));
    } else {
      const { original, flattened } = await flatten(name, options);
      console.log(formatFlattenResult(original, flattened));
      console.log(`Saved to: ${output || name}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
