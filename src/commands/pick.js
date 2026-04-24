const { loadSession, saveSession } = require('../storage');

/**
 * Pick specific tabs from a session by index and save as a new session.
 * @param {string} sourceName - source session name
 * @param {number[]} indices - 0-based tab indices to pick
 * @param {string} destName - destination session name
 * @returns {object} result with picked tabs and count
 */
async function pickTabs(sourceName, indices, destName) {
  const session = await loadSession(sourceName);
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error(`Session "${sourceName}" not found or invalid`);
  }

  const tabs = session.tabs;
  const uniqueIndices = [...new Set(indices)].sort((a, b) => a - b);

  const outOfRange = uniqueIndices.filter(i => i < 0 || i >= tabs.length);
  if (outOfRange.length > 0) {
    throw new Error(`Index out of range: ${outOfRange.join(', ')} (session has ${tabs.length} tabs)`);
  }

  const picked = uniqueIndices.map(i => tabs[i]);

  const newSession = {
    ...session,
    name: destName,
    tabs: picked,
    createdAt: new Date().toISOString(),
    pickedFrom: sourceName,
  };

  await saveSession(destName, newSession);

  return {
    source: sourceName,
    dest: destName,
    picked,
    count: picked.length,
  };
}

function formatPickResult(result) {
  const lines = [
    `Picked ${result.count} tab(s) from "${result.source}" → "${result.dest}"`,
    '',
  ];
  result.picked.forEach((tab, i) => {
    lines.push(`  [${i}] ${tab.title || tab.url}`);
  });
  return lines.join('\n');
}

module.exports = { pickTabs, formatPickResult };
