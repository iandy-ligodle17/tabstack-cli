const { loadSession, saveSession, listSessions } = require('../storage');

async function copySession(sourceName, destName, options = {}) {
  if (!sourceName) {
    throw new Error('Source session name is required');
  }
  if (!destName) {
    throw new Error('Destination session name is required');
  }
  if (sourceName === destName) {
    throw new Error('Source and destination names must be different');
  }

  const session = await loadSession(sourceName);
  if (!session) {
    throw new Error(`Session "${sourceName}" not found`);
  }

  const existing = await listSessions();
  if (existing.includes(destName) && !options.force) {
    throw new Error(`Session "${destName}" already exists. Use --force to overwrite`);
  }

  const copiedSession = {
    ...session,
    name: destName,
    copiedFrom: sourceName,
    createdAt: new Date().toISOString(),
  };

  await saveSession(destName, copiedSession);

  return {
    source: sourceName,
    destination: destName,
    tabCount: session.tabs ? session.tabs.length : 0,
  };
}

module.exports = { copySession };
