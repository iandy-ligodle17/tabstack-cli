#!/usr/bin/env node
'use strict';

const { concatSessions, formatConcatResult } = require('./commands/concat');

function printUsage() {
  console.log(`
Usage: tabstack concat <session1> <session2> [..more] --output <name>

Concatenate two or more sessions into a single new session.
Tabs are appended in the order the sessions are listed.

Options:
  --output, -o   Name for the resulting session (required)
  --tags         Comma-separated tags to attach to the new session
  --help, -h     Show this help message

Examples:
  tabstack concat work personal --output combined
  tabstack concat mon tue wed --output week --tags work,weekly
`.trim());
}

async function main(argv) {
  const args = argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const outputIdx = args.findIndex(a => a === '--output' || a === '-o');
  if (outputIdx === -1 || !args[outputIdx + 1]) {
    console.error('Error: --output <name> is required');
    process.exit(1);
  }

  const outputName = args[outputIdx + 1];

  const tagsIdx = args.findIndex(a => a === '--tags');
  const tags = tagsIdx !== -1 && args[tagsIdx + 1]
    ? args[tagsIdx + 1].split(',')
    : [];

  const sessionNames = args.filter((a, i) => {
    if (a.startsWith('--')) return false;
    if (i > 0 && (args[i - 1] === '--output' || args[i - 1] === '-o' || args[i - 1] === '--tags')) return false;
    return true;
  });

  if (sessionNames.length < 2) {
    console.error('Error: provide at least two session names to concatenate');
    process.exit(1);
  }

  try {
    const result = await concatSessions(sessionNames, outputName, { tags });
    console.log(formatConcatResult(result, sessionNames));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main(process.argv);
