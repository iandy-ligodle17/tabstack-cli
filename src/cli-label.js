#!/usr/bin/env node

const { addLabel, removeLabel, listLabels, formatLabels } = require('./commands/label');

const [,, subcommand, sessionName, label] = process.argv;

function printUsage() {
  console.log('Usage:');
  console.log('  tabstack label add <session> <label>');
  console.log('  tabstack label remove <session> <label>');
  console.log('  tabstack label list <session>');
  process.exit(1);
}

async function main() {
  if (!subcommand || !sessionName) return printUsage();

  try {
    if (subcommand === 'add') {
      if (!label) return printUsage();
      const result = await addLabel(sessionName, label);
      if (result.added) {
        console.log(`Label "${result.label}" added to session "${sessionName}".`);
      } else {
        console.log(`Label "${result.label}" already exists on session "${sessionName}".`);
      }
    } else if (subcommand === 'remove') {
      if (!label) return printUsage();
      const result = await removeLabel(sessionName, label);
      if (result.removed) {
        console.log(`Label "${result.label}" removed from session "${sessionName}".`);
      } else {
        console.log(`Label "${result.label}" not found on session "${sessionName}".`);
      }
    } else if (subcommand === 'list') {
      const labels = await listLabels(sessionName);
      console.log(`Labels for "${sessionName}": ${formatLabels(labels)}`);
    } else {
      printUsage();
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
