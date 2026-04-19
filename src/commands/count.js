const { loadSession } = require('../storage');

function countTabs(sessionName) {
  const session = loadSession(sessionName);
  if (!session) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  const total = session.tabs.length;
  const pinned = session.tabs.filter(t => t.pinned).length;
  const unpinned = total - pinned;

  const domains = {};
  for (const tab of session.tabs) {
    try {
      const domain = new URL(tab.url).hostname;
      domains[domain] = (domains[domain] || 0) + 1;
    } catch {
      domains['unknown'] = (domains['unknown'] || 0) + 1;
    }
  }

  const uniqueDomains = Object.keys(domains).length;

  return { total, pinned, unpinned, uniqueDomains, domains };
}

function formatCount(result, sessionName) {
  const lines = [
    `Session: ${sessionName}`,
    `Total tabs:     ${result.total}`,
    `Pinned:         ${result.pinned}`,
    `Unpinned:       ${result.unpinned}`,
    `Unique domains: ${result.uniqueDomains}`,
  ];
  return lines.join('\n');
}

module.exports = { countTabs, formatCount };
