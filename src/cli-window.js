#!/usr/bin/env node
'use strict';

const { splitIntoWindows, getWindow, assignWindows, formatWindowResult } = require('./commands/window');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage:');
  console.log('  tabstack window <session> --size <n>');
  console.log('  tabstack window <session> --get <index>');
  console.log('  tabstack window <session> --assign <json>');
  process.exit(0);
}

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printUsage();
}

const sessionName = args[0];
if (!sessionName) {
  console.error('Error: session name required');
  process.exit(1);
}

(async () => {
  try {
    const sizeIdx = args.indexOf('--size');
    const getIdx = args.indexOf('--get');
    const assignIdx = args.indexOf('--assign');

    if (sizeIdx !== -1) {
      const size = parseInt(args[sizeIdx + 1], 10);
      if (isNaN(size)) {
        console.error('Error: --size requires a numeric argument');
        process.exit(1);
      }
      const windows = await splitIntoWindows(sessionName, size);
      console.log(formatWindowResult(windows));
    } else if (getIdx !== -1) {
      const index = parseInt(args[getIdx + 1], 10);
      if (isNaN(index)) {
        console.error('Error: --get requires a numeric index');
        process.exit(1);
      }
      const tabs = await getWindow(sessionName, index);
      tabs.forEach((t, i) => console.log(`${i + 1}. ${t.title || t.url}`));
    } else if (assignIdx !== -1) {
      const raw = args[assignIdx + 1];
      let map;
      try {
        map = JSON.parse(raw);
      } catch {
        console.error('Error: --assign requires valid JSON');
        process.exit(1);
      }
      await assignWindows(sessionName, map);
      console.log(`Window assignments saved to session "${sessionName}".`);
    } else {
      printUsage();
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
