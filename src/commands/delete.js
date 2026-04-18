const { deleteSession, listSessions } = require('../storage');

async function deleteCommand(sessionName, options = {}) {
  if (!sessionName) {
    const sessions = await listSessions();
    if (sessions.length === 0) {
      console.log('No sessions found.');
      return { deleted: false, reason: 'no_sessions' };
    }
    console.error('Error: session name is required.');
    console.log('Available sessions:');
    sessions.forEach(s => console.log(`  - ${s}`));
    return { deleted: false, reason: 'no_name' };
  }

  try {
    const sessions = await listSessions();
    if (!sessions.includes(sessionName)) {
      console.error(`Error: session "${sessionName}" not found.`);
      if (sessions.length > 0) {
        console.log('Available sessions:');
        sessions.forEach(s => console.log(`  - ${s}`));
      }
      return { deleted: false, reason: 'not_found' };
    }

    await deleteSession(sessionName);
    console.log(`Session "${sessionName}" deleted.`);
    return { deleted: true, sessionName };
  } catch (err) {
    console.error(`Error deleting session: ${err.message}`);
    return { deleted: false, reason: 'error', error: err };
  }
}

module.exports = { deleteCommand };
