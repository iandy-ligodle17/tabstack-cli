const { loadSession, saveSession } = require('../storage');

async function merge(sessionNames, targetName, options = {}) {
  if (!sessionNames || sessionNames.length < 2) {
    throw new Error('At least two session names are required to merge');
  }
  if (!targetName) {
    throw new Error('Target session name is required');
  }

  const allTabs = [];
  const seen = new Set();

  for (const name of sessionNames) {
    const session = await loadSession(name);
    if (!session) {
      throw new Error(`Session "${name}" not found`);
    }
    for (const tab of session.tabs) {
      const key = tab.url;
      if (options.dedupe && seen.has(key)) {
        continue;
      }
      seen.add(key);
      allTabs.push(tab);
    }
  }

  const merged = {
    name: targetName,
    tabs: allTabs,
    createdAt: new Date().toISOString(),
    mergedFrom: sessionNames,
  };

  await saveSession(targetName, merged);
  return merged;
}

module.exports = { merge };
