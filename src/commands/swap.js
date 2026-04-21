const { loadSession, saveSession } = require('../storage');

/**
 * Swap two tabs by index within a session.
 * @param {string} sessionName
 * @param {number} indexA
 * @param {number} indexB
 * @returns {object} updated session
 */
async function swapTabs(sessionName, indexA, indexB) {
  const session = await loadSession(sessionName);

  if (!session.tabs || session.tabs.length === 0) {
    throw new Error(`Session "${sessionName}" has no tabs.`);
  }

  const len = session.tabs.length;

  if (indexA < 0 || indexA >= len) {
    throw new Error(`Index ${indexA} is out of range (0-${len - 1}).`);
  }
  if (indexB < 0 || indexB >= len) {
    throw new Error(`Index ${indexB} is out of range (0-${len - 1}).`);
  }
  if (indexA === indexB) {
    return session;
  }

  const tabs = [...session.tabs];
  [tabs[indexA], tabs[indexB]] = [tabs[indexB], tabs[indexA]];

  const updated = { ...session, tabs };
  await saveSession(sessionName, updated);
  return updated;
}

/**
 * Format the result of a swap operation for display.
 * @param {string} sessionName
 * @param {number} indexA
 * @param {number} indexB
 * @param {object} session
 * @returns {string}
 */
function formatSwapResult(sessionName, indexA, indexB, session) {
  const tabA = session.tabs[indexB]; // after swap, A is now at B's old position
  const tabB = session.tabs[indexA];
  return [
    `Swapped tabs in "${sessionName}":`,
    `  [${indexA}] ${tabB.title || tabB.url}`,
    `  [${indexB}] ${tabA.title || tabA.url}`,
  ].join('\n');
}

module.exports = { swapTabs, formatSwapResult };
