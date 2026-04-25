const { loadSession } = require('../storage');

/**
 * Groups tabs into clusters by domain similarity.
 * @param {string} sessionName
 * @param {object} options - { minSize }
 * @returns {object} { clusters, unclustered }
 */
async function clusterTabs(sessionName, options = {}) {
  const session = await loadSession(sessionName);
  const { minSize = 2 } = options;

  const domainMap = {};

  for (const tab of session.tabs) {
    let domain;
    try {
      domain = new URL(tab.url).hostname.replace(/^www\./, '');
    } catch {
      domain = '__invalid__';
    }
    if (!domainMap[domain]) domainMap[domain] = [];
    domainMap[domain].push(tab);
  }

  const clusters = {};
  const unclustered = [];

  for (const [domain, tabs] of Object.entries(domainMap)) {
    if (tabs.length >= minSize) {
      clusters[domain] = tabs;
    } else {
      unclustered.push(...tabs);
    }
  }

  return { clusters, unclustered };
}

/**
 * Formats cluster result for display.
 * @param {object} result - { clusters, unclustered }
 * @returns {string}
 */
function formatClusterResult({ clusters, unclustered }) {
  const lines = [];
  const clusterEntries = Object.entries(clusters);

  if (clusterEntries.length === 0) {
    lines.push('No clusters found (try lowering --min-size).');
  } else {
    for (const [domain, tabs] of clusterEntries) {
      lines.push(`\n[${domain}] — ${tabs.length} tab(s)`);
      for (const tab of tabs) {
        lines.push(`  ${tab.title || tab.url}`);
      }
    }
  }

  if (unclustered.length > 0) {
    lines.push(`\n[unclustered] — ${unclustered.length} tab(s)`);
    for (const tab of unclustered) {
      lines.push(`  ${tab.title || tab.url}`);
    }
  }

  return lines.join('\n').trim();
}

module.exports = { clusterTabs, formatClusterResult };
