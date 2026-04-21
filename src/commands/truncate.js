const { loadSession, saveSession } = require('../storage');

/**
 * Truncate a session to a maximum number of tabs.
 * Optionally keep tabs from the start or end.
 */
async function truncateSession(sessionName, maxTabs, options = {}) {
  const { from = 'end' } = options;

  if (!Number.isInteger(maxTabs) || maxTabs < 1) {
    throw new Error('maxTabs must be a positive integer');
  }

  const session = await loadSession(sessionName);

  if (!session || !Array.isArray(session.tabs)) {
    throw new Error(`Session "${sessionName}" not found or invalid`);
  }

  const originalCount = session.tabs.length;

  if (originalCount <= maxTabs) {
    return {
      session,
      originalCount,
      newCount: originalCount,
      removed: 0,
      truncated: false,
    };
  }

  const tabs =
    from === 'start'
      ? session.tabs.slice(originalCount - maxTabs)
      : session.tabs.slice(0, maxTabs);

  const updated = {
    ...session,
    tabs,
    updatedAt: new Date().toISOString(),
  };

  await saveSession(sessionName, updated);

  return {
    session: updated,
    originalCount,
    newCount: tabs.length,
    removed: originalCount - tabs.length,
    truncated: true,
  };
}

function formatTruncateResult(result, sessionName) {
  if (!result.truncated) {
    return `Session "${sessionName}" already has ${result.originalCount} tab(s) — nothing to truncate.`;
  }
  return (
    `Truncated "${sessionName}": ${result.originalCount} → ${result.newCount} tab(s) ` +
    `(removed ${result.removed})`
  );
}

module.exports = { truncateSession, formatTruncateResult };
