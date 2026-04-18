const { loadSession, listSessions } = require('../storage');
const { openTabs } = require('../browser');

async function restore(sessionName, options = {}) {
  if (!sessionName) {
    const sessions = await listSessions();
    if (sessions.length === 0) {
      console.log('No saved sessions found.');
      return;
    }
    console.log('Available sessions:');
    sessions.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    console.log('\nUsage: tabstack restore <session-name>');
    return;
  }

  let session;
  try {
    session = await loadSession(sessionName);
  } catch (err) {
    console.error(`Session "${sessionName}" not found.`);
    process.exit(1);
  }

  const urls = session.tabs.map(tab => tab.url);
  console.log(`Restoring session "${sessionName}" with ${urls.length} tab(s)...`);

  try {
    await openTabs(urls, options);
    console.log('Done.');
  } catch (err) {
    console.error('Failed to open tabs:', err.message);
    process.exit(1);
  }
}

module.exports = { restore };
