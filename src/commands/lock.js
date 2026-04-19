const { loadSession, saveSession } = require('../storage');

async function lockSession(name, password) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);

  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  session.locked = true;
  session.passwordHash = hash;
  await saveSession(name, session);
  return session;
}

async function unlockSession(name, password) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  if (!session.locked) throw new Error(`Session "${name}" is not locked`);

  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (hash !== session.passwordHash) throw new Error('Incorrect password');

  session.locked = false;
  delete session.passwordHash;
  await saveSession(name, session);
  return session;
}

async function isLocked(name) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  return !!session.locked;
}

module.exports = { lockSession, unlockSession, isLocked };
