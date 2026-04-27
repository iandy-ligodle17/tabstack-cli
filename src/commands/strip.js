const { loadSession, saveSession } = require('../storage');

/**
 * Strip query strings and/or fragments from tab URLs in a session.
 * @param {string} sessionName
 * @param {object} options - { query: bool, fragment: bool, dryRun: bool }
 * @returns {object} result
 */
function stripUrls(session, { query = true, fragment = true } = {}) {
  return session.tabs.map(tab => {
    let url;
    try {
      url = new URL(tab.url);
    } catch {
      return tab;
    }
    if (query) url.search = '';
    if (fragment) url.hash = '';
    return { ...tab, url: url.toString() };
  });
}

function formatStripResult(original, stripped) {
  const changed = stripped.filter((t, i) => t.url !== original[i].url).length;
  return `Stripped ${changed} of ${original.length} tab(s).`;
}

async function stripSession(sessionName, options = {}) {
  const session = await loadSession(sessionName);
  const originalTabs = session.tabs;
  const strippedTabs = stripUrls(session, options);

  const result = {
    session: sessionName,
    original: originalTabs,
    stripped: strippedTabs,
    changed: strippedTabs.filter((t, i) => t.url !== originalTabs[i].url).length,
    message: formatStripResult(originalTabs, strippedTabs),
  };

  if (!options.dryRun) {
    await saveSession(sessionName, { ...session, tabs: strippedTabs });
  }

  return result;
}

module.exports = { stripSession, stripUrls, formatStripResult };
