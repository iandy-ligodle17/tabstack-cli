#!/usr/bin/env node
const { program } = require('commander');
const { captureSession } = require('./commands/capture');
const { restoreSession } = require('./commands/restore');
const { listSessions } = require('./commands/list');
const { deleteSession } = require('./commands/delete');
const { renameSession } = require('./commands/rename');
const { exportSession } = require('./commands/export');
const { importSession } = require('./commands/import');
const { searchSessions } = require('./commands/search');

program.name('tabstack').description('Save and restore browser tab sessions').version('1.0.0');

program
  .command('capture <name>')
  .description('Capture current browser tabs into a named session')
  .action(async (name) => {
    try { await captureSession(name); console.log(`Session "${name}" saved.`); }
    catch (err) { console.error('Error:', err.message); process.exit(1); }
  });

program
  .command('restore <name>')
  .description('Restore a saved session by name')
  .action(async (name) => {
    try { await restoreSession(name); console.log(`Session "${name}" restored.`); }
    catch (err) { console.error('Error:', err.message); process.exit(1); }
  });

program
  .command('list')
  .description('List all saved sessions')
  .action(async () => {
    try { await listSessions(); }
    catch (err) { console.error('Error:', err.message); process.exit(1); }
  });

program
  .command('delete <name>')
  .description('Delete a saved session')
  .action(async (name) => {
    try { await deleteSession(name); console.log(`Session "${name}" deleted.`); }
    catch (err) { console.error('Error:', err.message); process.exit(1); }
  });

program
  .command('rename <oldName> <newName>')
  .description('Rename a saved session')
  .action(async (oldName, newName) => {
    try { await renameSession(oldName, newName); console.log(`Renamed "${oldName}" to "${newName}".`); }
    catch (err) { console.error('Error:', err.message); process.exit(1); }
  });

program
  .command('export <name>')
  .description('Export a session to a JSON file')
  .option('-o, --output <path>', 'output file path')
  .action(async (name, options) => {
    try { await exportSession(name, options.output); }
    catch (err) { console.error('Error:', err.message); process.exit(1); }
  });

program
  .command('import <file>')
  .description('Import a session from a JSON file')
  .option('-n, --name <name>', 'override session name')
  .action(async (file, options) => {
    try { await importSession(file, options.name); }
    catch (err) { console.error('Error:', err.message); process.exit(1); }
  });

program
  .command('search <query>')
  .description('Search across saved tab sessions by URL or title')
  .option('-s, --session-name', 'also match against session names')
  .action(async (query, options) => {
    try {
      const results = await searchSessions(query, options);
      if (results.length === 0) { console.log(`No matches found for "${query}"`); return; }
      results.forEach(({ sessionName, matchingTabs, matchType }) => {
        console.log(`\nSession: ${sessionName} (${matchType} match)`);
        matchingTabs.forEach(tab => console.log(`  [${tab.title || 'No title'}] ${tab.url}`));
      });
    } catch (err) { console.error('Error:', err.message); process.exit(1); }
  });

program.parse(process.argv);
