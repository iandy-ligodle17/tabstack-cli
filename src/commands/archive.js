const { loadSession, saveSession, deleteSession, listSessions } = require('../storage');

async function archiveSession(name, options = {}) {
  const session = await loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }

  const archivedName = `archived/${name}`;
  const existing = await listSessions();

  if (existing.includes(archivedName) && !options.force) {
    throw new Error(`Archived session "${archivedName}" already exists. Use --force to overwrite.`);
  }

  const archivedSession = {
    ...session,
    archivedAt: new Date().toISOString(),
    originalName: name,
  };

  await saveSession(archivedName, archivedSession);

  if (!options.keep) {
    await deleteSession(name);
  }

  return archivedName;
}

async function unarchiveSession(name, options = {}) {
  const archivedName = name.startsWith('archived/') ? name : `archived/${name}`;
  const session = await loadSession(archivedName);
  if (!session) {
    throw new Error(`Archived session "${archivedName}" not found`);
  }

  const targetName = options.as || session.originalName || name.replace(/^archived\//, '');
  const existing = await listSessions();

  if (existing.includes(targetName) && !options.force) {
    throw new Error(`Session "${targetName}" already exists. Use --force to overwrite.`);
  }

  const { archivedAt, originalName, ...restoredSession } = session;
  await saveSession(targetName, restoredSession);
  await deleteSession(archivedName);

  return targetName;
}

async function listArchived() {
  const all = await listSessions();
  return all.filter(name => name.startsWith('archived/'));
}

module.exports = { archiveSession, unarchiveSession, listArchived };
