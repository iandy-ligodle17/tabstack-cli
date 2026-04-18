const { loadSession, saveSession } = require('../storage');

async function tagSession(name, tags, options = {}) {
  const session = await loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }

  const currentTags = session.tags || [];

  if (options.remove) {
    session.tags = currentTags.filter(t => !tags.includes(t));
  } else if (options.set) {
    session.tags = [...new Set(tags)];
  } else {
    // append mode
    session.tags = [...new Set([...currentTags, ...tags])];
  }

  session.updatedAt = new Date().toISOString();
  await saveSession(name, session);
  return session.tags;
}

async function getSessionTags(name) {
  const session = await loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }
  return session.tags || [];
}

module.exports = { tagSession, getSessionTags };
