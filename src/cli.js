#!/usr/bin/env node

const { program } = require('commander');
const { captureSession } = require('./commands/capture');
const { restoreSession } = require('./commands/restore');
const { listSessions } = require('./commands/list');
const { deleteSession } = require('./commands/delete');
const { renameSession } = require('./commands/rename');
const { exportSession } = require('./commands/export');
const { importSession } = require('./commands/import');

program.name('tabstack').description('Save and restore browser tab sessions').version('1.0.0');

program
  .command('capture [name]')
  .description('Capture current browser tabs as a session')
  .action(async (name) => {
    try {
      const result = await captureSession(name);
      console.log(`Saved session "${result.name}" with ${result.tabCount} tab(s).`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('restore <name>')
  .description('Restore a saved session')
  .action(async (name) => {
    try {
      await restoreSession(name);
      console.log(`Restored session "${name}".`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all saved sessions')
  .action(async () => {
    try {
      await listSessions();
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('delete <name>')
  .description('Delete a saved session')
  .action(async (name) => {
    try {
      await deleteSession(name);
      console.log(`Deleted session "${name}".`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('rename <oldName> <newName>')
  .description('Rename a saved session')
  .action(async (oldName, newName) => {
    try {
      await renameSession(oldName, newName);
      console.log(`Renamed session "${oldName}" to "${newName}".`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('export <name>')
  .description('Export a session to a JSON file')
  .option('-o, --output <path>', 'output file path')
  .action(async (name, options) => {
    try {
      const { filePath } = await exportSession(name, options);
      console.log(`Exported session "${name}" to ${filePath}.`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('import <file>')
  .description('Import a session from a JSON file')
  .option('-n, --name <name>', 'override the session name')
  .action(async (file, options) => {
    try {
      const { sessionName, tabCount } = await importSession(file, { name: options.name });
      console.log(`Imported session "${sessionName}" with ${tabCount} tab(s).`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
