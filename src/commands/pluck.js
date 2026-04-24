const { loadSession, saveSession } = require('../storage');

/**
 * Pluck specific tabs by index from a session into a new session.
 * @param {string} sessionName - source session
 * @param {number[]} indices - 0-based tab indices to pluck
 * @param {string} destName - destination session name
 * @returns {object} result with plucked tabs and dest session name
 */
async function pluckTabs(sessionName, indices, destName) {
  const session = await loadSession(sessionName);
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error(`Session "${sessionName}" not found or has no tabs`);
  }

  const max = session.tabs.length;
  const invalid = indices.filter(i => i < 0 || i >= max);
  if (invalid.length > 0) {
    throw new Error(`Indices out of range: ${invalid.join(', ')} (session has ${max} tabs)`);
  }

  const unique = [...new Set(indices)];
  const plucked = unique.map(i => session.tabs[i]);

  const destSession = {
    name: destName,
    tabs: plucked,
    createdAt: new Date().toISOString(),
    pluckedFrom: sessionName,
  };

  await saveSession(destName, destSession);
  return { plucked, destName, sourceSession: sessionName };
}

/**
 * Format the result of a pluck operation for display.
 */
function formatPluckResult(result) {
  const lines = [
    `Plucked ${result.plucked.length} tab(s) from "${result.sourceSession}" into "${result.destName}":`,
  ];
  result.plucked.forEach((tab, i) => {
    lines.push(`  ${i + 1}. ${tab.title || tab.url}`);
  });
  return lines.join('\n');
}

module.exports = { pluckTabs, formatPluckResult };
