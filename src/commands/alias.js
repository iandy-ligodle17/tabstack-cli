const { loadSession, saveSession, listSessions } = require('../storage');

async function setAlias(sessionName, alias) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  const sessions = await listSessions();
  for (const name of sessions) {
    if (name === sessionName) continue;
    const s = await loadSession(name);
    if (s && s.alias === alias) {
      throw new Error(`Alias '${alias}' is already used by session '${name}'`);
    }
  }

  session.alias = alias;
  await saveSession(sessionName, session);
  return { sessionName, alias };
}

async function removeAlias(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  if (!session.alias) throw new Error(`Session '${sessionName}' has no alias`);

  const oldAlias = session.alias;
  delete session.alias;
  await saveSession(sessionName, session);
  return { sessionName, removedAlias: oldAlias };
}

async function resolveAlias(aliasOrName) {
  const sessions = await listSessions();
  for (const name of sessions) {
    if (name === aliasOrName) return name;
    const session = await loadSession(name);
    if (session && session.alias === aliasOrName) return name;
  }
  return null;
}

module.exports = { setAlias, removeAlias, resolveAlias };
