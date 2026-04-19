#!/usr/bin/env node
const { program } = require('commander');
const { addNote, getNotes, clearNotes, removeNote } = require('./commands/notes');

program
  .command('add <session> <note>')
  .description('Add a note to a session')
  .action(async (session, note) => {
    try {
      const notes = await addNote(session, note);
      console.log(`Note added. Total notes: ${notes.length}`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

program
  .command('list <session>')
  .description('List notes for a session')
  .action(async (session) => {
    try {
      const notes = await getNotes(session);
      if (!notes.length) return console.log('No notes found.');
      notes.forEach((n, i) => console.log(`[${i}] ${n.text}  (${n.createdAt})`));
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

program
  .command('remove <session> <index>')
  .description('Remove a note by index')
  .action(async (session, index) => {
    try {
      await removeNote(session, parseInt(index, 10));
      console.log('Note removed.');
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

program
  .command('clear <session>')
  .description('Clear all notes from a session')
  .action(async (session) => {
    try {
      await clearNotes(session);
      console.log('All notes cleared.');
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
