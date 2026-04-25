const { loadSession, saveSession } = require('../storage');

/**
 * Pin all tabs from a specific domain to the top of a session.
 */
async function pinDomain(sessionName, domain) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  const tabs = session.tabs || [];
  const normalized = domain.toLowerCase().replace(/^www\./, '');

  const pinned = [];
  const rest = [];

  for (const tab of tabs) {
    try {
      const host = new URL(tab.url).hostname.toLowerCase().replace(/^www\./, '');
      if (host === normalized || host.endsWith('.' + normalized)) {
        pinned.push({ ...tab, pinnedDomain: true });
      } else {
        rest.push(tab);
      }
    } catch {
      rest.push(tab);
    }
  }

  if (pinned.length === 0) {
    throw new Error(`No tabs found matching domain "${domain}"`);
  }

  const updated = { ...session, tabs: [...pinned, ...rest] };
  await saveSession(sessionName, updated);

  return { pinned: pinned.length, total: tabs.length, domain };
}

function formatPinDomainResult({ pinned, total, domain }) {
  return `Pinned ${pinned} tab(s) from "${domain}" to top (${total} total tabs).`;
}

module.exports = { pinDomain, formatPinDomainResult };
