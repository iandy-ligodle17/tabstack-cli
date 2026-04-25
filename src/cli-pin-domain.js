#!/usr/bin/env node
'use strict';

const { pinDomain, formatPinDomainResult } = require('./commands/pin-domain');

function printUsage() {
  console.log('Usage: tabstack pin-domain <session> <domain>');
  console.log('');
  console.log('  Moves all tabs from <domain> to the top of the session.');
  console.log('');
  console.log('Examples:');
  console.log('  tabstack pin-domain work github.com');
  console.log('  tabstack pin-domain research arxiv.org');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  if (args.length < 2) {
    console.error('Error: session name and domain are required.');
    printUsage();
    process.exit(1);
  }

  const [sessionName, domain] = args;

  try {
    const result = await pinDomain(sessionName, domain);
    console.log(formatPinDomainResult(result));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
