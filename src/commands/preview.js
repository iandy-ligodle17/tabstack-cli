const { loadSession } = require('../storage');

function previewSession(name, options = {}) {
  const session = loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }

  const { limit = null, domain = null } = options;

  let tabs = session.tabs || [];

  if (domain) {
    tabs = tabs.filter(tab => tab.url && tab.url.includes(domain));
  }

  if (limit && limit > 0) {
    tabs = tabs.slice(0, limit);
  }

  const result = {
    name: session.name || name,
    created: session.created || null,
    tags: session.tags || [],
    totalTabs: (session.tabs || []).length,
    previewTabs: tabs,
    showing: tabs.length,
  };

  return result;
}

function formatPreview(preview) {
  const lines = [];
  lines.push(`Session: ${preview.name}`);
  if (preview.created) {
    lines.push(`Created: ${new Date(preview.created).toLocaleString()}`);
  }
  if (preview.tags && preview.tags.length > 0) {
    lines.push(`Tags: ${preview.tags.join(', ')}`);
  }
  lines.push(`Tabs: ${preview.showing} of ${preview.totalTabs}`);
  lines.push('');
  preview.previewTabs.forEach((tab, i) => {
    const title = tab.title ? ` — ${tab.title}` : '';
    lines.push(`  ${i + 1}. ${tab.url}${title}`);
  });
  return lines.join('\n');
}

module.exports = { previewSession, formatPreview };
