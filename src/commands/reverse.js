const { loadSession, saveSession } = require('../storage');

/**
 * Reverse the order of tabs in a session.
 * @param {string} sessionName
 * @param {object} options - { inPlace: bool, output: string }
 * @returns {object} result
 */
async function reverseTabs(sessionName, options = {}) {
  const session = await loadSession(sessionName);
  if (!session) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  if (!Array.isArray(session.tabs) || session.tabs.length === 0) {
    throw new Error(`Session "${sessionName}" has no tabs to reverse`);
  }

  const reversed = [...session.tabs].reverse();
  const targetName = options.output || sessionName;

  const updatedSession = {
    ...session,
    tabs: reversed,
    updatedAt: new Date().toISOString(),
  };

  await saveSession(targetName, updatedSession);

  return {
    sessionName: targetName,
    tabCount: reversed.length,
    inPlace: !options.output || options.output === sessionName,
  };
}

/**
 * Format the result of a reverse operation for display.
 * @param {object} result
 * @returns {string}
 */
function formatReverseResult(result) {
  const lines = [];
  lines.push(`Reversed ${result.tabCount} tab(s) in session "${result.sessionName}".`);
  if (!result.inPlace) {
    lines.push(`Saved reversed session as "${result.sessionName}".`);
  }
  return lines.join('\n');
}

module.exports = { reverseTabs, formatReverseResult };
