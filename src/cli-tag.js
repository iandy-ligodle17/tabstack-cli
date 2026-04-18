#!/usr/bin/env node
const { program } = require('commander');
const { tagSession, getSessionTags } = require('./commands/tag');
const { filterByTag } = require('./commands/filter-by-tag');

program
  .command('add <session> <tags...>')
  .description('Add tags to a session')
  .action(async (session, tags) => {
    try {
      const updated = await tagSession(session, tags);
      console.log(`Tags for "${session}": ${updated.join(', ')}`);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

program
  .command('remove <session> <tags...>')
  .description('Remove tags from a session')
  .action(async (session, tags) => {
    try {
      const updated = await tagSession(session, tags, { remove: true });
      console.log(`Tags for "${session}": ${updated.join(', ') || '(none)'}`);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

program
  .command('list <session>')
  .description('List tags for a session')
  .action(async (session) => {
    try {
      const tags = await getSessionTags(session);
      console.log(tags.length ? tags.join(', ') : '(no tags)');
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

program
  .command('filter <tags...>')
  .description('Find sessions matching tags')
  .option('--all', 'require all tags to match')
  .action(async (tags, opts) => {
    try {
      const sessions = await filterByTag(tags, { matchAll: opts.all });
      if (!sessions.length) return console.log('No sessions found.');
      sessions.forEach(s => console.log(`${s.name} [${s.tags.join(', ')}] (${s.tabCount} tabs)`));
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
