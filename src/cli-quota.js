#!/usr/bin/env node
'use strict';

const { checkQuota, formatQuota } = require('./commands/quota');

const args = process.argv.slice(2);
const sessionName = args.find(a => !a.startsWith('--')) || null;
const jsonFlag = args.includes('--json');

async function main() {
  try {
    const result = await checkQuota(sessionName);

    if (jsonFlag) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }

    console.log(formatQuota(result));

    const overLimit = !result.sessionsOk || (result.tabs && !result.tabs.tabsOk);
    process.exit(overLimit ? 1 : 0);
  } catch (err) {
    console.error('Error checking quota:', err.message);
    process.exit(1);
  }
}

main();
