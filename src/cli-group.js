#!/usr/bin/env node
const { groupTabs, listGroups, ungroup } = require('./commands/group');

const args = process.argv.slice(2);

function printUsage() {
  console.log('Usage:');
  console.log('  tabstack group <session> --name <group> --indices <i1,i2,...>');
  console.log('  tabstack group <session> --list');
  console.log('  tabstack group <session> --ungroup <group>');
}

async function main() {
  const sessionName = args[0];
  if (!sessionName) {
    printUsage();
    process.exit(1);
  }

  const listFlag = args.includes('--list');
  const ungroupIdx = args.indexOf('--ungroup');
  const nameIdx = args.indexOf('--name');
  const indicesIdx = args.indexOf('--indices');

  if (listFlag) {
    const groups = await listGroups(sessionName);
    for (const [groupName, tabs] of Object.entries(groups)) {
      console.log(`\n[${groupName}] (${tabs.length} tab${tabs.length !== 1 ? 's' : ''})`);
      tabs.forEach((t, i) => console.log(`  ${i + 1}. ${t.title || t.url}`));
    }
    return;
  }

  if (ungroupIdx !== -1) {
    const groupName = args[ungroupIdx + 1];
    if (!groupName) { console.error('Error: --ungroup requires a group name'); process.exit(1); }
    await ungroup(sessionName, groupName);
    console.log(`Removed group '${groupName}' from session '${sessionName}'.`);
    return;
  }

  if (nameIdx !== -1 && indicesIdx !== -1) {
    const groupName = args[nameIdx + 1];
    const indices = args[indicesIdx + 1].split(',').map(Number);
    if (!groupName) { console.error('Error: --name requires a value'); process.exit(1); }
    const result = await groupTabs(sessionName, groupName, indices);
    console.log(`Grouped ${result.count} tab(s) under '${result.groupName}' in session '${sessionName}'.`);
    return;
  }

  printUsage();
  process.exit(1);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
