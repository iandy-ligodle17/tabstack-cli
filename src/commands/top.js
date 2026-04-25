const { loadSession } = require('../storage');
const { extractDomain } = require('./sort');

/**
 * Return the top N tabs by domain frequency from a session.
 * @param {string} sessionName
 * @param {number} n
 * @returns {{ tabs: object[], dominated: string }}
 */
function topTabs(session, n = 5) {
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error('Invalid session: missing tabs array');
  }

  const domainCount = {};
  for (const tab of session.tabs) {
    const domain = extractDomain(tab.url);
    domainCount[domain] = (domainCount[domain] || 0) + 1;
  }

  const sorted = [...session.tabs].sort((a, b) => {
    const da = extractDomain(a.url);
    const db = extractDomain(b.url);
    return (domainCount[db] || 0) - (domainCount[da] || 0);
  });

  const top = sorted.slice(0, n);
  const dominated = Object.entries(domainCount)
    .sort((a, b) => b[1] - a[1])
    .map(([domain]) => domain)[0] || '';

  return { tabs: top, dominated };
}

/**
 * Format the top tabs result for CLI output.
 */
function formatTopResult({ tabs, dominated }, n) {
  if (tabs.length === 0) {
    return 'No tabs found.';
  }
  const lines = [`Top ${n} tab(s) — most frequent domain: ${dominated || 'n/a'}`, ''];
  tabs.forEach((tab, i) => {
    const domain = extractDomain(tab.url);
    lines.push(`  ${i + 1}. [${domain}] ${tab.title || tab.url}`);
    lines.push(`     ${tab.url}`);
  });
  return lines.join('\n');
}

module.exports = { topTabs, formatTopResult };
