const { loadSession } = require('../storage');

/**
 * Count how often each domain appears across a session's tabs.
 * @param {object} session
 * @returns {Array<{domain: string, count: number, urls: string[]}>}
 */
function getDomainFrequency(session) {
  const map = new Map();

  for (const tab of session.tabs || []) {
    let domain;
    try {
      domain = new URL(tab.url).hostname.replace(/^www\./, '');
    } catch {
      domain = 'unknown';
    }

    if (!map.has(domain)) {
      map.set(domain, { domain, count: 0, urls: [] });
    }
    const entry = map.get(domain);
    entry.count += 1;
    entry.urls.push(tab.url);
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/**
 * Format frequency results for terminal output.
 * @param {Array<{domain: string, count: number, urls: string[]}>} freq
 * @param {object} opts
 * @param {number} [opts.top] - limit to top N domains
 * @param {boolean} [opts.verbose] - show individual URLs
 * @returns {string}
 */
function formatFrequency(freq, opts = {}) {
  const { top, verbose } = opts;
  const items = top ? freq.slice(0, top) : freq;

  if (items.length === 0) return 'No tabs found.';

  const maxCount = items[0].count;
  const barWidth = 20;

  const lines = items.map(({ domain, count, urls }) => {
    const filled = Math.round((count / maxCount) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    const line = `${bar} ${count.toString().padStart(4)}  ${domain}`;
    if (verbose) {
      const urlLines = urls.map(u => `         ${u}`).join('\n');
      return `${line}\n${urlLines}`;
    }
    return line;
  });

  return lines.join('\n');
}

async function frequencyCommand(sessionName, opts = {}) {
  const session = await loadSession(sessionName);
  const freq = getDomainFrequency(session);
  return { freq, output: formatFrequency(freq, opts) };
}

module.exports = { getDomainFrequency, formatFrequency, frequencyCommand };
