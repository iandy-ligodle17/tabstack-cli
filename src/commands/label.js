const { loadSession, saveSession } = require('../storage');

async function addLabel(sessionName, label) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  if (!session.labels) session.labels = [];

  const normalized = label.trim().toLowerCase();
  if (!normalized) throw new Error('Label cannot be empty');

  if (session.labels.includes(normalized)) {
    return { session, label: normalized, added: false };
  }

  session.labels.push(normalized);
  await saveSession(sessionName, session);
  return { session, label: normalized, added: true };
}

async function removeLabel(sessionName, label) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  const normalized = label.trim().toLowerCase();
  if (!normalized) throw new Error('Label cannot be empty');

  const before = (session.labels || []).length;
  session.labels = (session.labels || []).filter(l => l !== normalized);

  if (session.labels.length === before) {
    return { session, label: normalized, removed: false };
  }

  await saveSession(sessionName, session);
  return { session, label: normalized, removed: true };
}

async function listLabels(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  return session.labels || [];
}

function formatLabels(labels) {
  if (!labels.length) return '(no labels)';
  return labels.map(l => `[${l}]`).join(' ');
}

module.exports = { addLabel, removeLabel, listLabels, formatLabels };
