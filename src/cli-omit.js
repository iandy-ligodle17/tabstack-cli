#!/usr/bin/env node
'use strict';

const { omitCommand } = require('./commands/omit');

function printUsage() {
  console.log('Usage: tabstack omit <session> <index1> [index2 ...] [--output <name>]');
  console.log('');
  console.log('Remove tabs at given indices from a session.');
  console.log('');
  console.log('Options:');
  console.log('  --output <name>   Save result as a new session instead of overwriting');
  console.log('');
  console.log('Examples:');
  console.log('  tabstack omit work 2');
  console.log('  tabstack omit work 0 3 5');
  console.log('  tabstack omit work 1 --output work-trimmed');
}

async function main(argv) {
  const args = argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const sessionName = args[0];
  const outputIdx = args.indexOf('--output');
  let output;
  let rest = args.slice(1);

  if (outputIdx !== -1) {
    output = args[outputIdx + 1];
    rest = rest.filter((_, i) => {
      const absI = i + 1;
      return absI !== outputIdx && absI !== outputIdx + 1;
    });
  }

  const indices = rest.map(s => parseInt(s, 10)).filter(n => !isNaN(n));

  if (indices.length === 0) {
    console.error('Error: no valid indices provided');
    printUsage();
    process.exit(1);
  }

  try {
    const { message } = await omitCommand(sessionName, indices, { output });
    console.log(message);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main(process.argv);
