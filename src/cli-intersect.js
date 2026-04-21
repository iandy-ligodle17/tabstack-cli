#!/usr/bin/env node
'use strict';

const { intersectSessions, formatIntersect } = require('./commands/intersect');
const { saveSession } = require('./storage');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage: tabstack intersect <session1> <session2> [session3...] [--save <name>]');
  console.log('');
  console.log('Find tabs that appear in ALL of the specified sessions.');
  console.log('');
  console.log('Options:');
  console.log('  --save <name>   Save the intersected tabs as a new session');
  console.log('  --help          Show this help message');
}

if (args.includes('--help') || args.length === 0) {
  printUsage();
  process.exit(0);
}

const saveIdx = args.indexOf('--save');
let saveName = null;
let sessionNames = [...args];

if (saveIdx !== -1) {
  saveName = args[saveIdx + 1];
  if (!saveName) {
    console.error('Error: --save requires a session name');
    process.exit(1);
  }
  sessionNames = args.filter((_, i) => i !== saveIdx && i !== saveIdx + 1);
}

if (sessionNames.length < 2) {
  console.error('Error: at least two session names are required');
  printUsage();
  process.exit(1);
}

(async () => {
  try {
    const result = await intersectSessions(sessionNames);
    console.log(formatIntersect(result));

    if (saveName) {
      await saveSession(saveName, { tabs: result.tabs });
      console.log(`\nSaved intersection as session: ${saveName}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();
