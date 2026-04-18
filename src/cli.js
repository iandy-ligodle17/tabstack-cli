#!/usr/bin/env node
const { program } = require('commander');
const { capture } = require('./commands/capture');
const { restore } = require('./commands/restore');
const { listSessions } = require('./commands/list');
const { deleteSession } = require('./commands/delete');
const { rename } = require('./commands/rename');
const { exportSession } = require('./commands/export');
const { importSession } = require('./commands/import');
const { search } = require('./commands/search');
const { info } = require('./commands/info');
const { copy } = require('./commands/copy');
const { merge } = require('./commands/merge');
const { tag } = require('./commands/tag');
const { stats } = require('./commands/stats');
const { dedupe } = require('./commands/dedupe');

program.name('tabstack').description('Save and restore browser tab sessions').version('1.0.0');

program.command('capture [name]').description('Capture current browser tabs').action(async (name) => {
  try { const r = await capture(name); console.log(`Saved session "${r.name}" with ${r.count} tab(s).`); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('restore <name>').description('Restore a saved session').action(async (name) => {
  try { await restore(name); console.log(`Restored session "${name}".`); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('list').description('List all saved sessions').action(async () => {
  try { const sessions = await listSessions(); sessions.forEach(s => console.log(s)); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('delete <name>').description('Delete a session').action(async (name) => {
  try { await deleteSession(name); console.log(`Deleted session "${name}".`); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('rename <old> <new>').description('Rename a session').action(async (oldName, newName) => {
  try { await rename(oldName, newName); console.log(`Renamed "${oldName}" to "${newName}".`); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('export <name> <file>').description('Export session to JSON file').action(async (name, file) => {
  try { await exportSession(name, file); console.log(`Exported "${name}" to ${file}.`); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('import <file> [name]').description('Import session from JSON file').action(async (file, name) => {
  try { const r = await importSession(file, name); console.log(`Imported session "${r.name}".`); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('search <query>').description('Search tabs across sessions').action(async (query) => {
  try { const r = await search(query); r.forEach(m => console.log(`[${m.session}] ${m.title} - ${m.url}`)); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('info <name>').description('Show session details').action(async (name) => {
  try { const r = await info(name); console.log(JSON.stringify(r, null, 2)); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('copy <src> <dest>').description('Copy a session').action(async (src, dest) => {
  try { await copy(src, dest); console.log(`Copied "${src}" to "${dest}".`); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('merge <a> <b> <dest>').description('Merge two sessions').action(async (a, b, dest) => {
  try { const r = await merge(a, b, dest); console.log(`Merged into "${dest}" with ${r.count} tab(s).`); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('stats').description('Show overall stats').action(async () => {
  try { const r = await stats(); console.log(JSON.stringify(r, null, 2)); }
  catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
});

program.command('dedupe <name>').description('Remove duplicate tabs from a session')
  .option('--dry-run', 'preview without saving').option('--title-only', 'dedupe by title')
  .action(async (name, options) => {
    try {
      const r = await dedupe(name, { dryRun: options.dryRun, titleOnly: options.titleOnly });
      if (!r.changed) { console.log(`No duplicates found in "${name}".`); return; }
      const action = options.dryRun ? '[dry run] Would remove' : 'Removed';
      console.log(`${action} ${r.removed} duplicate(s) from "${name}". Tabs: ${r.original} → ${r.deduped}`);
    } catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
  });

program.parse();
