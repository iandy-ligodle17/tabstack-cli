const { loadSession, saveSession } = require('../storage');

/**
 * Remove tabs whose URLs match a given pattern or domain from a session.
 * @param {string} sessionName
 * @param {string} pattern - substring or domain to match against tab URLs
 * @param {object} options
 * @param {boolean} options.dryRun - if true, don't persist changes
 * @returns {{ removed: string[], remaining: number, session: object }}
 */
async function pruneTabs(sessionName, pattern, { dryRun = false } = {}) {
  if (!pattern || pattern.trim() === '') {
    throw new Error('A pattern is required to prune tabs.');
  }

  const session = await loadSession(sessionName);
  const lowerPattern = pattern.toLowerCase();

  const kept = [];
  const removed = [];

  for (const tab of session.tabs) {
    const url = (tab.url || '').toLowerCase();
    const title = (tab.title || '').toLowerCase();
    if (url.includes(lowerPattern) || title.includes(lowerPattern)) {
      removed.push(tab.url);
    } else {
      kept.push(tab);
    }
  }

  if (removed.length === 0) {
    return { removed: [], remaining: session.tabs.length, session };
  }

  const pruned = { ...session, tabs: kept, updatedAt: new Date().toISOString() };

  if (!dryRun) {
    await saveSession(sessionName, pruned);
  }

  return { removed, remaining: kept.length, session: pruned };
}

function formatPruneResult({ removed, remaining, dryRun }) {
  const lines = [];
  if (removed.length === 0) {
    lines.push('No tabs matched the pattern. Nothing pruned.');
  } else {
    lines.push(`${dryRun ? '[dry-run] Would remove' : 'Removed'} ${removed.length} tab(s):`);
    for (const url of removed) {
      lines.push(`  - ${url}`);
    }
    lines.push(`Remaining tabs: ${remaining}`);
  }
  return lines.join('\n');
}

module.exports = { pruneTabs, formatPruneResult };
