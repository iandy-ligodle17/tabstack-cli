#!/usr/bin/env node
const { program } = require('commander');
const { snapshotSession, listSnapshots, restoreSnapshot } = require('./commands/snapshot');
const { listSessions } = require('./storage');
const { openTabs } = require('./browser');

program
  .name('tabstack-snapshot')
  .description('Take and manage tab snapshots');

program
  .command('take <name>')
  .description('Take a snapshot of current tabs')
  .option('-c, --count <n>', 'number of snapshots to take', '1')
  .option('-i, --interval <seconds>', 'seconds between snapshots', '30')
  .action(async (name, opts) => {
    try {
      const count = parseInt(opts.count, 10);
      const interval = parseInt(opts.interval, 10);
      const snapshots = await snapshotSession(name, { count, interval });
      console.log(`Saved ${snapshots.length} snapshot(s):`);
      snapshots.forEach(s => console.log(`  - ${s}`));
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program
  .command('list <name>')
  .description('List snapshots for a session')
  .action(async (name) => {
    try {
      const all = await listSessions();
      const snaps = await listSnapshots(name, all);
      if (!snaps.length) {
        console.log(`No snapshots found for '${name}'`);
      } else {
        snaps.forEach(s => console.log(s));
      }
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program
  .command('restore <snapshotName>')
  .description('Restore a specific snapshot')
  .action(async (snapshotName) => {
    try {
      const session = await restoreSnapshot(snapshotName);
      await openTabs(session.tabs);
      console.log(`Restored snapshot '${snapshotName}' with ${session.tabs.length} tab(s)`);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
