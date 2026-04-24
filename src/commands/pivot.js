const { loadSession, saveSession } = require('../storage');

/**
 * Pivot a session: group tabs by domain and create one session per domain.
 * Returns an array of { name, session } objects.
 */
async function pivotSession(name, options = {}) {
  const session = await loadSession(name);
  const { prefix = name, save = false } = options;

  const groups = {};
  for (const tab of session.tabs) {
    let domain;
    try {
      domain = new URL(tab.url).hostname.replace(/^www\./, '');
    } catch {
      domain = 'unknown';
    }
    if (!groups[domain]) groups[domain] = [];
    groups[domain].push(tab);
  }

  const results = Object.entries(groups).map(([domain, tabs]) => ({
    domain,
    name: `${prefix}-${domain}`,
    session: {
      ...session,
      name: `${prefix}-${domain}`,
      tabs,
      createdAt: new Date().toISOString(),
    },
  }));

  if (save) {
    for (const r of results) {
      await saveSession(r.name, r.session);
    }
  }

  return results;
}

function formatPivotResult(results) {
  if (!results.length) return 'No tabs to pivot.';
  const lines = ['Pivot result:'];
  for (const r of results) {
    lines.push(`  ${r.name} — ${r.session.tabs.length} tab(s)`);
  }
  return lines.join('\n');
}

module.exports = { pivotSession, formatPivotResult };
