const { loadSession, saveSession, deleteSession, listSessions } = require('../storage');

async function renameSession(oldName, newName) {
  if (!oldName || !newName) {
    throw new Error('Both old and new session names are required');
  }

  if (oldName === newName) {
    throw new Error('New name must be different from the old name');
  }

  const existing = await listSessions();
  if (!existing.includes(oldName)) {
    throw new Error(`Session "${oldName}" not found`);
  }

  if (existing.includes(newName)) {
    throw new Error(`Session "${newName}" already exists`);
  }

  const session = await loadSession(oldName);
  const renamed = {
    ...session,
    name: newName,
    renamedAt: new Date().toISOString(),
    previousName: oldName
  };

  await saveSession(newName, renamed);
  await deleteSession(oldName);

  return renamed;
}

function formatRenameResult(oldName, newName) {
  return `Session "${oldName}" renamed to "${newName}" successfully.`;
}

module.exports = { renameSession, formatRenameResult };
