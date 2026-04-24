const { loadSession, saveSession } = require('../storage');

function formatTailResult(session, count, originalCount) {
  const removed = originalCount - session.tabs.length;
  return [
    `Session: ${session.name}`,
    `Original tabs: ${originalCount}`,
    `Kept last ${count}: ${session.tabs.length}`,
    `Removed: ${removed}`,
    '',
    'Remaining tabs:',
    ...session.tabs.map((t, i) => `  ${i + 1}. ${t.title || t.url}`)
  ].join('\n');
}

async function tailSession(name, count, { save = false } = {}) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('Count must be a positive integer');
  }

  const session = await loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }

  const originalCount = session.tabs.length;

  if (count >= originalCount) {
    return {
      session,
      originalCount,
      changed: false,
      message: `Session has ${originalCount} tabs, nothing to trim`
    };
  }

  const trimmed = {
    ...session,
    tabs: session.tabs.slice(-count),
    updatedAt: new Date().toISOString()
  };

  if (save) {
    await saveSession(trimmed.name, trimmed);
  }

  return {
    session: trimmed,
    originalCount,
    changed: true,
    message: formatTailResult(trimmed, count, originalCount)
  };
}

module.exports = { tailSession, formatTailResult };
