const { listSessions, loadSession } = require('../storage');

async function list(options = {}) {
  const sessions = await listSessions();

  if (sessions.length === 0) {
    console.log('No saved sessions.');
    return;
  }

  if (options.verbose) {
    for (const name of sessions) {
      try {
        const session = await loadSession(name);
        const tabCount = session.tabs ? session.tabs.length : 0;
        const saved = session.savedAt ? new Date(session.savedAt).toLocaleString() : 'unknown';
        console.log(`\n${name}`);
        console.log(`  tabs   : ${tabCount}`);
        console.log(`  saved  : ${saved}`);
        if (options.urls) {
          session.tabs.forEach(tab => console.log(`    - ${tab.url}`));
        }
      } catch {
        console.log(`${name} (unreadable)`);
      }
    }
  } else {
    sessions.forEach(name => console.log(name));
  }
}

module.exports = { list };
