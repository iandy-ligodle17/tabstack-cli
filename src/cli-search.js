#!/usr/bin/env node
const { program } = require('commander');
const { searchSessions } = require('./commands/search');

program
  .name('tabstack search')
  .description('Search across saved tab sessions')
  .argument('<query>', 'search term to match against tab URLs and titles')
  .option('-s, --session-name', 'also match against session names')
  .action(async (query, options) => {
    try {
      const results = await searchSessions(query, options);
      if (results.length === 0) {
        console.log(`No matches found for "${query}"`);
        return;
      }
      results.forEach(({ sessionName, matchingTabs, matchType }) => {
        console.log(`\nSession: ${sessionName} (${matchType} match)`);
        matchingTabs.forEach(tab => {
          console.log(`  [${tab.title || 'No title'}] ${tab.url}`);
        });
      });
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
