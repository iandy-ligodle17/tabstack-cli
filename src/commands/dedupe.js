const { loadSession, saveSession } = require('../storage');

async function dedupe(sessionName, options = {}) {
  const session = await loadSession(sessionName);
  if (!session) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  const original = session.tabs || [];
  const seen = new Set();
  const deduped = [];

  for (const tab of original) {
    const key = options.titleOnly ? tab.title : tab.url;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(tab);
    }
  }

  const removed = original.length - deduped.length;

  if (removed === 0) {
    return { sessionName, original: original.length, deduped: deduped.length, removed, changed: false };
  }

  if (!options.dryRun) {
    await saveSession(sessionName, { ...session, tabs: deduped });
  }

  return { sessionName, original: original.length, deduped: deduped.length, removed, changed: true };
}

module.exports = { dedupe };
