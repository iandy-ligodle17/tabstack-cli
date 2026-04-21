const { loadSession, saveSession } = require('../storage');

/**
 * Compress a session by removing duplicate URLs and trimming whitespace
 * from tab titles/URLs.
 */
function compressSession(session) {
  const seen = new Set();
  const originalCount = session.tabs.length;

  const compressed = session.tabs.reduce((acc, tab) => {
    const normalizedUrl = (tab.url || '').trim().replace(/\/$/, '');
    if (!normalizedUrl) return acc;
    if (seen.has(normalizedUrl)) return acc;
    seen.add(normalizedUrl);
    acc.push({
      ...tab,
      url: normalizedUrl,
      title: (tab.title || '').trim() || normalizedUrl,
    });
    return acc;
  }, []);

  return {
    session: { ...session, tabs: compressed },
    removedCount: originalCount - compressed.length,
    originalCount,
  };
}

function formatCompressResult({ originalCount, removedCount, session }) {
  const kept = originalCount - removedCount;
  if (removedCount === 0) {
    return `Session "${session.name}" is already clean — ${kept} tab(s), nothing removed.`;
  }
  return `Session "${session.name}": ${originalCount} → ${kept} tab(s) (removed ${removedCount} duplicate/empty).`;
}

async function compress(name, { dryRun = false } = {}) {
  const session = await loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found.`);

  const result = compressSession(session);

  if (!dryRun && result.removedCount > 0) {
    await saveSession(result.session.name, result.session);
  }

  return result;
}

module.exports = { compress, compressSession, formatCompressResult };
