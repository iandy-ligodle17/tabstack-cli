#!/usr/bin/env node
'use strict';

const { setReminder, getReminders, clearReminder, formatReminders, checkDueReminders } = require('./commands/remind');

const [,, subcommand, sessionName, ...rest] = process.argv;

function printUsage() {
  console.log('Usage:');
  console.log('  tabstack remind set <session> <date> <message>');
  console.log('  tabstack remind list <session>');
  console.log('  tabstack remind clear <session> <id>');
  console.log('  tabstack remind check <session>');
  process.exit(1);
}

if (!subcommand || !sessionName) printUsage();

try {
  switch (subcommand) {
    case 'set': {
      const dateStr = rest[0];
      const message = rest.slice(1).join(' ');
      if (!dateStr || !message) {
        console.error('Error: date and message are required');
        process.exit(1);
      }
      const reminder = setReminder(sessionName, message, dateStr);
      console.log(`Reminder set [id: ${reminder.id}] for ${new Date(reminder.date).toLocaleString()}`);
      break;
    }

    case 'list': {
      const reminders = getReminders(sessionName);
      console.log(formatReminders(reminders));
      break;
    }

    case 'clear': {
      const id = parseInt(rest[0], 10);
      if (isNaN(id)) {
        console.error('Error: valid numeric reminder ID required');
        process.exit(1);
      }
      clearReminder(sessionName, id);
      console.log(`Reminder ${id} removed from "${sessionName}"`);
      break;
    }

    case 'check': {
      const due = checkDueReminders(sessionName);
      if (!due.length) {
        console.log('No reminders are due.');
      } else {
        console.log(`${due.length} reminder(s) due:`);
        due.forEach(r => console.log(`  [${r.id}] ${r.message}`));
      }
      break;
    }

    default:
      printUsage();
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
