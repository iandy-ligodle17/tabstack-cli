const { loadSession, saveSession } = require('../storage');

/**
 * Flatten a session by removing duplicate domains and optionally keeping
 * only the first tab per domain.
 */
function flattenSession(session, options = {}) {
  const { keepLast = false, dedupePath = false } = options;
  const seen = new Map();

  for (const tab of session.tabs) {
    let key;
    try {
      const url = new URL(tab.url);
      key = dedupePath ? url.origin + url.pathname : url.origin;
    } catch {
      key = tab.url;
    }

    if (!seen.has(key) || keepLast) {
      seen.set(key, tab);
    }
  }

  const flatTabs = Array.from(seen.values());
  return {
    ...session,
    tabs: flatTabs,
    metadata: {
      ...session.metadata,
      flattenedAt: new Date().toISOString(),
      originalCount: session.tabs.length,
      flattenedCount: flatTabs.length,
    },
  };
}

function formatFlattenResult(original, flattened) {
  const removed = original.tabs.length - flattened.tabs.length;
  return [
    `Session : ${original.name || 'unnamed'}`,
    `Before  : ${original.tabs.length} tabs`,
    `After   : ${flattened.tabs.length} tabs`,
    `Removed : ${removed} duplicate(s)`,
  ].join('\n');
}

async function flatten(name, options = {}) {
  const session = await loadSession(name);
  const result = flattenSession(session, options);
  const targetName = options.output || name;
  await saveSession(targetName, result);
  return { original: session, flattened: result };
}

module.exports = { flatten, flattenSession, formatFlattenResult };
