const { loadSession, saveSession, listSessions } = require('../storage');

/**
 * Clone a session under a new name, optionally with a URL filter.
 * @param {string} sourceName - existing session to clone
 * @param {string} targetName - name for the new session
 * @param {object} options
 * @param {string} [options.filter] - only include URLs containing this string
 * @returns {object} the newly saved session
 */
async function cloneSession(sourceName, targetName, options = {}) {
  const existing = await listSessions();
  if (!existing.includes(sourceName)) {
    throw new Error(`Session "${sourceName}" not found.`);
  }
  if (existing.includes(targetName)) {
    throw new Error(`Session "${targetName}" already exists.`);
  }

  const source = await loadSession(sourceName);

  let tabs = source.tabs || [];
  if (options.filter) {
    const needle = options.filter.toLowerCase();
    tabs = tabs.filter(tab => tab.url && tab.url.toLowerCase().includes(needle));
  }

  const cloned = {
    ...source,
    name: targetName,
    tabs,
    clonedFrom: sourceName,
    createdAt: new Date().toISOString(),
  };

  await saveSession(targetName, cloned);
  return cloned;
}

module.exports = { cloneSession };
