#!/usr/bin/env node
'use strict';

const { limitSession, formatLimitResult } = require('./commands/limit');

function printUsage() {
  console.log(`
Usage: tabstack limit <session> <max> [options]

Enforce a maximum number of tabs on a saved session.
Extra tabs are removed from the end unless --from-start is given.

Arguments:
  session     Name of the session to limit
  max         Maximum number of tabs to keep (positive integer)

Options:
  --from-start   Remove tabs from the beginning instead of the end
  --dry-run      Preview changes without saving
  --help         Show this help message
`.trim());
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length < 2) {
    printUsage();
    process.exit(args.includes('--help') ? 0 : 1);
  }

  const [name, rawMax, ...flags] = args;
  const max = parseInt(rawMax, 10);

  if (isNaN(max) || max < 1) {
    console.error('Error: max must be a positive integer');
    process.exit(1);
  }

  const fromStart = flags.includes('--from-start');
  const dryRun = flags.includes('--dry-run');

  try {
    const result = await limitSession(name, max, { fromStart, dryRun });
    console.log(formatLimitResult(result));
    if (dryRun && result.changed) {
      console.log('(dry run — no changes saved)');
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
