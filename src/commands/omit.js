const { loadSession, saveSession } = require('../storage');

/**
 * Remove tabs at specific indices from a session.
 * @param {object} session
 * @param {number[]} indices - 0-based indices to remove
 * @returns {object} new session with tabs omitted
 */
function omitTabs(session, indices) {
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error('Invalid session');
  }
  const indexSet = new Set(indices);
  const kept = session.tabs.filter((_, i) => !indexSet.has(i));
  return { ...session, tabs: kept };
}

/**
 * Format the result of an omit operation for display.
 */
function formatOmitResult(original, result, indices) {
  const removed = original.tabs.filter((_, i) => indices.includes(i));
  const lines = [`Omitted ${removed.length} tab(s) from session:`];
  removed.forEach((tab, i) => {
    lines.push(`  - [${indices[i]}] ${tab.title || tab.url}`);
  });
  lines.push(`Remaining tabs: ${result.tabs.length}`);
  return lines.join('\n');
}

async function omitCommand(sessionName, indices, options = {}) {
  const session = await loadSession(sessionName);
  if (!session) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  if (!indices || indices.length === 0) {
    throw new Error('No indices provided');
  }

  const maxIndex = session.tabs.length - 1;
  for (const idx of indices) {
    if (idx < 0 || idx > maxIndex) {
      throw new Error(`Index ${idx} out of range (0-${maxIndex})`);
    }
  }

  const result = omitTabs(session, indices);

  const targetName = options.output || sessionName;
  await saveSession(targetName, result);

  return { result, message: formatOmitResult(session, result, indices) };
}

module.exports = { omitTabs, omitCommand, formatOmitResult };
