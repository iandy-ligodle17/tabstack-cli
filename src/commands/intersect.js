const { loadSession } = require('../storage');

/**
 * Find tabs common to two or more sessions.
 * @param {string[]} sessionNames
 * @returns {{ tabs: object[], sources: string[] }}
 */
async function intersectSessions(sessionNames) {
  if (!sessionNames || sessionNames.length < 2) {
    throw new Error('At least two session names are required for intersection');
  }

  const loaded = await Promise.all(
    sessionNames.map(async (name) => {
      const session = await loadSession(name);
      if (!session) throw new Error(`Session not found: ${name}`);
      return { name, tabs: session.tabs || [] };
    })
  );

  const [first, ...rest] = loaded;

  const commonTabs = first.tabs.filter((tab) =>
    rest.every((s) =>
      s.tabs.some((t) => normalizeUrl(t.url) === normalizeUrl(tab.url))
    )
  );

  return {
    tabs: commonTabs,
    sources: sessionNames,
  };
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/$/, '');
  } catch {
    return url;
  }
}

function formatIntersect(result) {
  const { tabs, sources } = result;
  const lines = [];
  lines.push(`Intersection of: ${sources.join(', ')}`);
  lines.push(`Common tabs: ${tabs.length}`);
  if (tabs.length === 0) {
    lines.push('  (no common tabs found)');
  } else {
    tabs.forEach((t, i) => {
      lines.push(`  ${i + 1}. ${t.title || t.url}`);
      lines.push(`     ${t.url}`);
    });
  }
  return lines.join('\n');
}

module.exports = { intersectSessions, normalizeUrl, formatIntersect };
