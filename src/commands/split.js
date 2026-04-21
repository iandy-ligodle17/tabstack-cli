const { loadSession, saveSession } = require('../storage');

/**
 * Split a session into multiple smaller sessions by chunk size or domain.
 */
async function splitSession(name, options = {}) {
  const session = await loadSession(name);
  const tabs = session.tabs || [];

  if (tabs.length === 0) {
    throw new Error(`Session "${name}" has no tabs to split.`);
  }

  let chunks = [];

  if (options.byDomain) {
    const domainMap = {};
    for (const tab of tabs) {
      let domain = 'unknown';
      try {
        domain = new URL(tab.url).hostname.replace(/^www\./, '');
      } catch (_) {}
      if (!domainMap[domain]) domainMap[domain] = [];
      domainMap[domain].push(tab);
    }
    chunks = Object.entries(domainMap).map(([domain, domainTabs]) => ({
      suffix: domain,
      tabs: domainTabs,
    }));
  } else {
    const size = options.size || 10;
    for (let i = 0; i < tabs.length; i += size) {
      chunks.push({
        suffix: `part${Math.floor(i / size) + 1}`,
        tabs: tabs.slice(i, i + size),
      });
    }
  }

  const savedNames = [];
  for (const chunk of chunks) {
    const newName = `${name}-${chunk.suffix}`;
    const newSession = {
      ...session,
      name: newName,
      tabs: chunk.tabs,
      createdAt: new Date().toISOString(),
      splitFrom: name,
    };
    await saveSession(newName, newSession);
    savedNames.push(newName);
  }

  return savedNames;
}

function formatSplitResult(originalName, savedNames) {
  const lines = [`Split "${originalName}" into ${savedNames.length} session(s):`, ''];
  for (const name of savedNames) {
    lines.push(`  • ${name}`);
  }
  return lines.join('\n');
}

module.exports = { splitSession, formatSplitResult };
