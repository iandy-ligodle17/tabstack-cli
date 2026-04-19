#!/usr/bin/env node
const { scheduleSession, clearSchedule, getSchedule } = require('./commands/schedule');

const [,, subcommand, name, ...rest] = process.argv;

function printUsage() {
  console.log('Usage:');
  console.log('  tabstack schedule set <name> "<HH:MM> <daily|weekdays|weekends>"');
  console.log('  tabstack schedule clear <name>');
  console.log('  tabstack schedule get <name>');
}

if (!subcommand || !name) {
  printUsage();
  process.exit(1);
}

try {
  if (subcommand === 'set') {
    const cronLike = rest.join(' ');
    if (!cronLike) { printUsage(); process.exit(1); }
    const result = scheduleSession(name, cronLike);
    const { hour, minute, frequency } = result.schedule;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    console.log(`Scheduled "${name}" to restore at ${timeStr} (${frequency})`);
  } else if (subcommand === 'clear') {
    clearSchedule(name);
    console.log(`Cleared schedule for "${name}"`);
  } else if (subcommand === 'get') {
    const sched = getSchedule(name);
    if (!sched) {
      console.log(`No schedule set for "${name}"`);
    } else {
      const { hour, minute, frequency } = sched;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      console.log(`"${name}" is scheduled at ${timeStr} (${frequency})`);
    }
  } else {
    printUsage();
    process.exit(1);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
