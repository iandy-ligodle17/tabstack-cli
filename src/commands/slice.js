const { loadSession, saveSession } = require('../storage');

/**
 * Slice a session: extract a contiguous range of tabs into a new session.
 * @param {string} name - source session name
 * @param {number} start - start index (inclusive, 0-based)
 * @param {number} end - end index (exclusive)
 * @param {string} [dest] - destination session name (defaults to name-slice)
 * @returns {object} result
 */
async function sliceSession(name, start, end, dest) {
  const session = await loadSession(name);
  const tabs = session.tabs || [];

  if (start < 0 || start >= tabs.length) {
    throw new Error(`Start index ${start} is out of range (0-${tabs.length - 1})`);
  }

  const normalizedEnd = end === undefined ? tabs.length : Math.min(end, tabs.length);

  if (normalizedEnd <= start) {
    throw new Error(`End index ${normalizedEnd} must be greater than start index ${start}`);
  }

  const sliced = tabs.slice(start, normalizedEnd);
  const destName = dest || `${name}-slice`;

  const newSession = {
    ...session,
    name: destName,
    tabs: sliced,
    createdAt: new Date().toISOString(),
    slicedFrom: name,
    sliceRange: [start, normalizedEnd],
  };

  await saveSession(destName, newSession);

  return {
    source: name,
    dest: destName,
    start,
    end: normalizedEnd,
    count: sliced.length,
  };
}

function formatSliceResult(result) {
  return [
    `Sliced "${result.source}" [${result.start}:${result.end}] → "${result.dest}"`,
    `Saved ${result.count} tab(s).`,
  ].join('\n');
}

module.exports = { sliceSession, formatSliceResult };
