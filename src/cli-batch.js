#!/usr/bin/env node
'use strict';

const { batchApply, batchApplyAll, formatBatchResult } = require('./commands/batch');

const VALID_OPS = ['tag', 'dedupe', 'trim', 'sort'];

function printUsage() {
  console.log(`
Usage:
  tabstack batch <operation> [sessions...] [options]

Operations: ${VALID_OPS.join(', ')}

Options:
  --all            Apply to all sessions
  --tag <name>     Tag name (required for 'tag' operation)
  --max <n>        Max tabs to keep (for 'trim', default 20)

Examples:
  tabstack batch dedupe work research
  tabstack batch tag --all --tag archived
  tabstack batch trim --all --max 15
`.trim());
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const operation = args[0];
  if (!VALID_OPS.includes(operation)) {
    console.error(`Unknown operation: ${operation}`);
    console.error(`Valid operations: ${VALID_OPS.join(', ')}`);
    process.exit(1);
  }

  const rest = args.slice(1);
  const options = {};
  const sessions = [];
  let useAll = false;

  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--all') {
      useAll = true;
    } else if (rest[i] === '--tag' && rest[i + 1]) {
      options.tag = rest[++i];
    } else if (rest[i] === '--max' && rest[i + 1]) {
      options.max = parseInt(rest[++i], 10);
    } else if (!rest[i].startsWith('--')) {
      sessions.push(rest[i]);
    }
  }

  try {
    let results;
    if (useAll) {
      results = await batchApplyAll(operation, options);
    } else if (sessions.length > 0) {
      results = await batchApply(sessions, operation, options);
    } else {
      console.error('Provide session names or use --all');
      process.exit(1);
    }

    console.log(`Batch ${operation} results:`);
    console.log(formatBatchResult(results));
    const failed = results.filter(r => !r.success).length;
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
