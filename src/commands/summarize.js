const { loadSession } = require('../storage');

/**
 * Summarize a session: tab count, unique domains, tags, notes presence.
 */
function summarizeSession(session) {
  const tabs = session.tabs || [];
  const domains = new Set(
    tabs.map(tab => {
      try {
        return new URL(tab.url).hostname;
      } catch {
        return 'unknown';
      }
    })
  );

  return {
    name: session.name,
    tabCount: tabs.length,
    uniqueDomains: domains.size,
    topDomains: getTopDomains(tabs, 3),
    tags: session.tags || [],
    hasNotes: Boolean(session.notes && session.notes.trim().length > 0),
    hasPinnedTabs: tabs.some(t => t.pinned),
    createdAt: session.createdAt || null,
    updatedAt: session.updatedAt || null,
  };
}

function getTopDomains(tabs, n) {
  const counts = {};
  for (const tab of tabs) {
    try {
      const host = new URL(tab.url).hostname;
      counts[host] = (counts[host] || 0) + 1;
    } catch {
      // skip invalid URLs
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([domain, count]) => ({ domain, count }));
}

function formatSummary(summary) {
  const lines = [
    `Session:       ${summary.name}`,
    `Tabs:          ${summary.tabCount}`,
    `Unique domains:${summary.uniqueDomains}`,
    `Top domains:   ${summary.topDomains.map(d => `${d.domain} (${d.count})`).join(', ') || 'none'}`,
    `Tags:          ${summary.tags.length ? summary.tags.join(', ') : 'none'}`,
    `Has notes:     ${summary.hasNotes ? 'yes' : 'no'}`,
    `Has pinned:    ${summary.hasPinnedTabs ? 'yes' : 'no'}`,
  ];
  if (summary.createdAt) lines.push(`Created:       ${new Date(summary.createdAt).toLocaleString()}`);
  if (summary.updatedAt) lines.push(`Updated:       ${new Date(summary.updatedAt).toLocaleString()}`);
  return lines.join('\n');
}

async function summarize(name) {
  const session = await loadSession(name);
  const summary = summarizeSession(session);
  return formatSummary(summary);
}

module.exports = { summarize, summarizeSession, formatSummary, getTopDomains };
