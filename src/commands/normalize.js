const { loadSession, saveSession } = require('../storage');

/**
 * Normalize URLs in a session (strip tracking params, trailing slashes, etc.)
 */
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'source'
    ];
    trackingParams.forEach(p => parsed.searchParams.delete(p));
    // Remove trailing slash from pathname (unless root)
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeSession(session) {
  const before = session.tabs.length;
  const normalized = session.tabs.map(tab => ({
    ...tab,
    url: normalizeUrl(tab.url)
  }));
  const changed = normalized.filter((tab, i) => tab.url !== session.tabs[i].url).length;
  return {
    session: { ...session, tabs: normalized },
    stats: { total: before, changed }
  };
}

function formatNormalizeResult(stats, sessionName) {
  const lines = [
    `Session: ${sessionName}`,
    `Total tabs: ${stats.total}`,
    `URLs normalized: ${stats.changed}`
  ];
  if (stats.changed === 0) {
    lines.push('No changes needed.');
  }
  return lines.join('\n');
}

async function runNormalize(sessionName, options = {}) {
  const session = await loadSession(sessionName);
  const { session: normalized, stats } = normalizeSession(session);
  if (!options.dryRun) {
    await saveSession(sessionName, normalized);
  }
  return { session: normalized, stats };
}

module.exports = { normalizeUrl, normalizeSession, formatNormalizeResult, runNormalize };
