#!/usr/bin/env node

const { program } = require('commander');
const { importSession } = require('./commands/import');

program
  .name('tabstack import')
  .description('Import a session from a JSON file')
  .argument('<file>', 'path to the exported session JSON file')
  .option('-n, --name <name>', 'override the session name')
  .action(async (file, options) => {
    try {
      const { sessionName, tabCount } = await importSession(file, {
        name: options.name,
      });
      console.log(`Imported session "${sessionName}" with ${tabCount} tab(s).`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
