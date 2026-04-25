#!/usr/bin/env node
'use strict';

const { bookmarkTab, removeBookmark, getBookmarks, formatBookmarks } = require('./commands/bookmark');
const { loadSession } = require('./storage');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage:');
  console.log('  tabstack bookmark <session> <index> [label]   Add a bookmark');
  console.log('  tabstack bookmark <session> --list            List bookmarks');
  console.log('  tabstack bookmark <session> --remove <index>  Remove a bookmark');
}

if (args.length < 2) {
  printUsage();
  process.exit(1);
}

const sessionName = args[0];
const subcommand = args[1];

try {
  if (subcommand === '--list') {
    const bookmarks = getBookmarks(sessionName);
    const session = loadSession(sessionName);
    console.log(`Bookmarks in '${sessionName}':\n`);
    console.log(formatBookmarks(bookmarks, session ? session.tabs : []));

  } else if (subcommand === '--remove') {
    const index = parseInt(args[2], 10);
    if (isNaN(index)) {
      console.error('Error: --remove requires a numeric index');
      process.exit(1);
    }
    const removed = removeBookmark(sessionName, index);
    console.log(`Removed bookmark [${index}]: ${removed.label}`);

  } else {
    const index = parseInt(subcommand, 10);
    if (isNaN(index)) {
      printUsage();
      process.exit(1);
    }
    const label = args[2] || undefined;
    const bm = bookmarkTab(sessionName, index, label);
    console.log(`Bookmarked tab [${index}]: ${bm.label}`);
    console.log(`  URL: ${bm.url}`);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
