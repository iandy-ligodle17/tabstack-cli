const { loadSession, saveSession } = require('../storage');

/**
 * Extract tabs matching a pattern (URL or title) into a new session.
 * @param {string} sourceName - source session name
 * @param {string} pattern - substring or regex string to match against URL or title
 * @param {string} destName - destination session name
 * @param {object} options
 * @param {boolean} options.regex - treat pattern as a regular expression
 * @param {boolean} options.remove - remove matched tabs from source session
 * @returns {{ extracted: number, remaining: number }}
 */
async function extractTabs(sourceName, pattern, destName, options = {}) {
  const session = await loadSession(sourceName);
  const tabs = session.tabs || [];

  let matcher;
  if (options.regex) {
    const re = new RegExp(pattern, 'i');
    matcher = (tab) => re.test(tab.url) || re.test(tab.title || '');
  } else {
    const lower = pattern.toLowerCase();
    matcher = (tab) =>
      (tab.url && tab.url.toLowerCase().includes(lower)) ||
      (tab.title && tab.title.toLowerCase().includes(lower));
  }

  const matched = tabs.filter(matcher);
  const rest = tabs.filter((t) => !matcher(t));

  if (matched.length === 0) {
    return { extracted: 0, remaining: tabs.length };
  }

  await saveSession(destName, { ...session, tabs: matched, name: destName });

  if (options.remove) {
    await saveSession(sourceName, { ...session, tabs: rest });
  }

  return { extracted: matched.length, remaining: rest.length };
}

function formatExtractResult({ extracted, remaining }, destName, remove) {
  const lines = [`Extracted ${extracted} tab(s) into "${destName}".`];
  if (remove) {
    lines.push(`${remaining} tab(s) remain in the source session.`);
  }
  return lines.join('\n');
}

module.exports = { extractTabs, formatExtractResult };
