#!/usr/bin/env node
'use strict';

const { zipSessions, formatZipResult } = require('./commands/zip');
const { ensureSessionsDir } = require('./storage');

function printUsage() {
  console.log('Usage: tabstack zip <session1> <session2> [more...] [--name <output>]');
  console.log('');
  console.log('Options:');
  console.log('  --name <output>   Name for the resulting zipped session');
  console.log('  --help            Show this help message');
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
  printUsage();
  process.exit(0);
}

const nameIdx = args.indexOf('--name');
let outputName = null;
let sessionArgs = [...args];

if (nameIdx !== -1) {
  outputName = args[nameIdx + 1];
  sessionArgs.splice(nameIdx, 2);
}

if (sessionArgs.length < 2) {
  console.error('Error: provide at least two session names');
  printUsage();
  process.exit(1);
}

const sessionsDir = ensureSessionsDir();

try {
  const result = zipSessions(sessionArgs, outputName, sessionsDir);
  console.log(formatZipResult(result));
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
