/**
 * fold.js — collapse a session by grouping tabs under their domain,
 * keeping only the first N tabs per domain (default: 1).
 *
 * Useful for trimming bloated sessions where you have 10 tabs
 * open from the same site.
 */

const { loadSession, saveSession } = require('../storage');
const { extractDomain } = require('./sort');

/**
 * Fold a session: keep at most `limit` tabs per domain.
 *
 * @param {string} name - session name
 * @param {number} limit - max tabs to keep per domain (default 1)
 * @returns {{ kept: number, removed: number, session: object }}
 * @throws {RangeError} if limit is less than 1
 */
async function foldSession(name, limit = 1) {
  if (limit < 1) {
    throw new RangeError(`limit must be at least 1, got ${limit}`);
  }

  const session = await loadSession(name);
  const tabs = session.tabs || [];

  const domainCount = {};
  const kept = [];
  const removed = [];

  for (const tab of tabs) {
    const domain = extractDomain(tab.url);
    domainCount[domain] = (domainCount[domain] || 0) + 1;

    if (domainCount[domain] <= limit) {
      kept.push(tab);
    } else {
      removed.push(tab);
    }
  }

  const updatedSession = {
    ...session,
    tabs: kept,
    updatedAt: new Date().toISOString(),
  };

  await saveSession(name, updatedSession);

  return {
    kept: kept.length,
    removed: removed.length,
    removedTabs: removed,
    session: updatedSession,
  };
}

/**
 * Format a human-readable summary of the fold operation.
 *
 * @param {string} name
 * @param {{ kept: number, removed: number, removedTabs: object[] }} result
 * @param {object} [opts]
 * @param {boolean} [opts.verbose] - list removed URLs
 * @returns {string}
 */
function formatFoldResult(name, result, opts = {}) {
  const lines = [
    `Session "${name}" folded.`,
    `  Kept:    ${result.kept} tab(s)`,
    `  Removed: ${result.removed} tab(s)`,
  ];

  if (opts.verbose && result.removedTabs.length > 0) {
    lines.push('  Removed URLs:');
    for (const tab of result.removedTabs) {
      lines.push(`    - ${tab.url}`);
    }
  }

  return lines.join('\n');
}

module.exports = { foldSession, formatFoldResult };
