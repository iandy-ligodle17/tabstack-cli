const { loadSession, saveSession } = require('../storage');

/**
 * Returns tabs with duplicate URLs removed, keeping first occurrence.
 * @param {object} session
 * @returns {object} new session with unique tabs
 */
function uniqueTabs(session) {
  const seen = new Set();
  const tabs = (session.tabs || []).filter(tab => {
    const url = (tab.url || '').trim().toLowerCase();
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  return { ...session, tabs };
}

/**
 * Formats the result of a unique operation.
 * @param {number} before
 * @param {number} after
 * @returns {string}
 */
function formatUniqueResult(before, after) {
  const removed = before - after;
  if (removed === 0) {
    return `No duplicate tabs found. Session unchanged (${before} tabs).`;
  }
  return `Removed ${removed} duplicate${removed !== 1 ? 's' : ''}. ${after} unique tab${after !== 1 ? 's' : ''} remaining.`;
}

/**
 * Runs the unique command: deduplicates tabs in a saved session by URL.
 * @param {string} sessionName
 * @param {object} options
 * @param {boolean} options.dryRun - preview without saving
 * @returns {Promise<string>} result message
 */
async function uniqueCommand(sessionName, options = {}) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found.`);

  const before = (session.tabs || []).length;
  const updated = uniqueTabs(session);
  const after = updated.tabs.length;
  const message = formatUniqueResult(before, after);

  if (!options.dryRun && after !== before) {
    await saveSession(sessionName, updated);
  }

  return message;
}

module.exports = { uniqueCommand, uniqueTabs, formatUniqueResult };
