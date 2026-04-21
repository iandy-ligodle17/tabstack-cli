const { loadSession, saveSession } = require('../storage');

const DEFAULT_TTL_DAYS = 30;

function setExpiry(session, days) {
  const ttl = parseInt(days, 10);
  if (isNaN(ttl) || ttl <= 0) {
    throw new Error('Expiry must be a positive number of days');
  }
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttl);
  return {
    ...session,
    expiry: {
      expiresAt: expiresAt.toISOString(),
      ttlDays: ttl,
      setAt: new Date().toISOString()
    }
  };
}

function clearExpiry(session) {
  const updated = { ...session };
  delete updated.expiry;
  return updated;
}

function isExpired(session) {
  if (!session.expiry || !session.expiry.expiresAt) return false;
  return new Date() > new Date(session.expiry.expiresAt);
}

function formatExpiry(session) {
  if (!session.expiry) return 'No expiry set';
  const exp = new Date(session.expiry.expiresAt);
  const now = new Date();
  const diffMs = exp - now;
  if (diffMs < 0) return `Expired ${Math.abs(Math.round(diffMs / 86400000))} day(s) ago`;
  const daysLeft = Math.round(diffMs / 86400000);
  return `Expires in ${daysLeft} day(s) (${exp.toLocaleDateString()})`;
}

async function expireCommand(name, days, opts = {}) {
  const session = await loadSession(name);
  if (opts.clear) {
    const updated = clearExpiry(session);
    await saveSession(name, updated);
    return `Expiry cleared for session "${name}"`.trim();
  }
  const ttl = days !== undefined ? days : DEFAULT_TTL_DAYS;
  const updated = setExpiry(session, ttl);
  await saveSession(name, updated);
  return `Session "${name}" will expire in ${ttl} day(s) (${new Date(updated.expiry.expiresAt).toLocaleDateString()})`;
}

module.exports = { setExpiry, clearExpiry, isExpired, formatExpiry, expireCommand };
