const { loadSession, saveSession } = require('../storage');

/**
 * Enforce a maximum tab count on a session, removing from the end (or start).
 * @param {string} name - session name
 * @param {number} max - maximum number of tabs to keep
 * @param {object} opts
 * @param {boolean} opts.fromStart - remove from the beginning instead of end
 * @param {boolean} opts.dryRun - don't persist changes
 * @returns {object} result
 */
async function limitSession(name, max, opts = {}) {
  if (!Number.isInteger(max) || max < 1) {
    throw new Error('max must be a positive integer');
  }

  const session = await loadSession(name);
  const original = session.tabs.length;

  if (original <= max) {
    return {
      name,
      original,
      kept: original,
      removed: 0,
      tabs: session.tabs,
      changed: false,
    };
  }

  const kept = opts.fromStart
    ? session.tabs.slice(original - max)
    : session.tabs.slice(0, max);

  const removed = original - kept.length;

  if (!opts.dryRun) {
    await saveSession(name, { ...session, tabs: kept });
  }

  return {
    name,
    original,
    kept: kept.length,
    removed,
    tabs: kept,
    changed: true,
  };
}

function formatLimitResult(result) {
  if (!result.changed) {
    return `Session "${result.name}" already has ${result.original} tab(s) — within limit.`;
  }
  return [
    `Session "${result.name}":`,
    `  Before : ${result.original} tab(s)`,
    `  After  : ${result.kept} tab(s)`,
    `  Removed: ${result.removed} tab(s)`,
  ].join('\n');
}

module.exports = { limitSession, formatLimitResult };
