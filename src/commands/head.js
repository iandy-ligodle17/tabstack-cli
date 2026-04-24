const { loadSession, saveSession } = require('../storage');

/**
 * Return the first N tabs from a session.
 * @param {string} sessionName
 * @param {number} count
 * @param {object} options
 * @param {string} [options.output] - save result to a new session name
 * @returns {object} result
 */
async function headSession(sessionName, count, options = {}) {
  const session = await loadSession(sessionName);

  if (!session || !Array.isArray(session.tabs)) {
    throw new Error(`Session "${sessionName}" not found or invalid.`);
  }

  if (count < 1) {
    throw new Error('Count must be a positive integer.');
  }

  const sliced = session.tabs.slice(0, count);

  const result = {
    ...session,
    tabs: sliced,
    updatedAt: new Date().toISOString(),
  };

  if (options.output) {
    await saveSession(options.output, result);
  }

  return result;
}

function formatHeadResult(result, original, count, outputName) {
  const lines = [];
  lines.push(`Showing first ${count} of ${original} tab(s):`);
  result.tabs.forEach((tab, i) => {
    lines.push(`  ${i + 1}. ${tab.title || tab.url}`);
  });
  if (outputName) {
    lines.push(`Saved to session "${outputName}".`);
  }
  return lines.join('\n');
}

module.exports = { headSession, formatHeadResult };
