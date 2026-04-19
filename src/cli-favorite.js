#!/usr/bin/env node
const { toggleFavorite, listFavorites, formatFavorites } = require('./commands/favorite');
const { listSessions, loadSession } = require('./storage');

const [,, subcommand, sessionName] = process.argv;

async function main() {
  if (subcommand === 'toggle') {
    if (!sessionName) {
      console.error('Usage: tabstack favorite toggle <session>');
      process.exit(1);
    }
    try {
      const result = await toggleFavorite(sessionName);
      const state = result.favorite ? 'added to' : 'removed from';
      console.log(`"${result.name}" ${state} favorites.`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  } else if (subcommand === 'list' || !subcommand) {
    try {
      const names = await listSessions();
      const sessions = await Promise.all(
        names.map(async name => ({ name, ...(await loadSession(name)) }))
      );
      const favorites = await listFavorites(sessions);
      console.log(formatFavorites(favorites));
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown subcommand: ${subcommand}`);
    console.error('Usage: tabstack favorite [list|toggle <session>]');
    process.exit(1);
  }
}

main();
