const { loadSession } = require('../storage');

/**
 * Build a digest (summary report) of a session's URL patterns,
 * domain distribution, and tab metadata.
 */
function digestSession(session) {
  const tabs = session.tabs || [];
  const domainMap = {};
  const schemes = {};
  let titledCount = 0;

  for (const tab of tabs) {
    // Count schemes
    try {
      const url = new URL(tab.url);
      const scheme = url.protocol.replace(':', '');
      schemes[scheme] = (schemes[scheme] || 0) + 1;

      const domain = url.hostname;
      domainMap[domain] = (domainMap[domain] || 0) + 1;
    } catch {
      schemes['invalid'] = (schemes['invalid'] || 0) + 1;
    }

    if (tab.title && tab.title.trim().length > 0) {
      titledCount++;
    }
  }

  const sortedDomains = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1]);

  return {
    name: session.name,
    totalTabs: tabs.length,
    uniqueDomains: sortedDomains.length,
    topDomains: sortedDomains.slice(0, 5),
    schemes,
    titledCount,
    untitledCount: tabs.length - titledCount,
    createdAt: session.createdAt || null,
    tags: session.tags || [],
  };
}

function formatDigest(digest) {
  const lines = [];
  lines.push(`Session: ${digest.name}`);
  if (digest.createdAt) {
    lines.push(`Created: ${new Date(digest.createdAt).toLocaleString()}`);
  }
  if (digest.tags.length > 0) {
    lines.push(`Tags: ${digest.tags.join(', ')}`);
  }
  lines.push(`Total tabs: ${digest.totalTabs}`);
  lines.push(`Unique domains: ${digest.uniqueDomains}`);
  lines.push(`Titled: ${digest.titledCount}  Untitled: ${digest.untitledCount}`);

  const schemeStr = Object.entries(digest.schemes)
    .map(([k, v]) => `${k}(${v})`).join(', ');
  lines.push(`Schemes: ${schemeStr}`);

  if (digest.topDomains.length > 0) {
    lines.push('Top domains:');
    for (const [domain, count] of digest.topDomains) {
      lines.push(`  ${domain}: ${count}`);
    }
  }

  return lines.join('\n');
}

async function digest(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) {
    throw new Error(`Session "${sessionName}" not found`);
  }
  const result = digestSession(session);
  return formatDigest(result);
}

module.exports = { digest, digestSession, formatDigest };
