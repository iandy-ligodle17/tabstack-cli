const { loadSession, saveSession, deleteSession, listSessions } = require('../storage');

async function renameSession(oldName, newName, options = {}) {
  if (!oldName || !newName) {
    throw new Error('Both old and new session names are required');
  }

  if (oldName === newName) {
    throw new Error('New name must be different from the current name');
  }

  const existing = await listSessions();
  if (!existing.includes(oldName)) {
    throw new Error(`Session "${oldName}" not found`);
  }

  if (existing.includes(newName) && !options.force) {
    throw new Error(`Session "${newName}" already exists. Use --force to overwrite`);
  }

  const session = await loadSession(oldName);
  const renamedSession = {
    ...session,
    name: newName,
    renamedAt: new Date().toISOString(),
    previousName: oldName,
  };

  await saveSession(newName, renamedSession);
  await deleteSession(oldName);

  return renamedSession;
}

module.exports = { renameSession };
