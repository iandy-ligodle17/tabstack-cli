const { loadSession, saveSession } = require('../storage');

/**
 * Trim a session by removing tabs matching a pattern or beyond a max count
 */
async function trimSession(name, options = {}) {
  const { maxTabs, pattern } = options;

  const session = await loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }

  let tabs = [...session.tabs];
  const originalCount = tabs.length;

  if (pattern) {
    const regex = new RegExp(pattern, 'i');
    tabs = tabs.filter(tab => !regex.test(tab.url) && !regex.test(tab.title || ''));
  }

  if (maxTabs && tabs.length > maxTabs) {
    tabs = tabs.slice(0, maxTabs);
  }

  const removedCount = originalCount - tabs.length;

  await saveSession(name, { ...session, tabs });

  return {
    name,
    originalCount,
    newCount: tabs.length,
    removedCount,
  };
}

module.exports = { trimSession };
