const { loadSession, saveSession } = require('../storage');

async function renameTag(sessionName, oldTag, newTag) {
  if (!sessionName || !oldTag || !newTag) {
    throw new Error('Session name, old tag, and new tag are required');
  }

  const session = await loadSession(sessionName);

  if (!session.tags || session.tags.length === 0) {
    throw new Error(`Session "${sessionName}" has no tags`);
  }

  if (!session.tags.includes(oldTag)) {
    throw new Error(`Tag "${oldTag}" not found in session "${sessionName}"`);
  }

  if (session.tags.includes(newTag)) {
    throw new Error(`Tag "${newTag}" already exists in session "${sessionName}"`);
  }

  session.tags = session.tags.map(t => (t === oldTag ? newTag : t));
  await saveSession(sessionName, session);

  return { sessionName, oldTag, newTag, tags: session.tags };
}

module.exports = { renameTag };
