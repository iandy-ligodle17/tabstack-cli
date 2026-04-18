const { loadSession } = require('../storage');

async function infoCommand(sessionName, options = {}) {
  if (!sessionName) {
    throw new Error('Session name is required');
  }

  const session = await loadSession(sessionName);

  if (!session) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  const tabs = session.tabs || [];
  const createdAt = session.createdAt ? new Date(session.createdAt) : null;
  const updatedAt = session.updatedAt ? new Date(session.updatedAt) : null;

  const info = {
    name: sessionName,
    tabCount: tabs.length,
    createdAt: createdAt ? createdAt.toLocaleString() : 'unknown',
    updatedAt: updatedAt ? updatedAt.toLocaleString() : 'unknown',
    tabs,
  };

  if (options.json) {
    return info;
  }

  const lines = [
    `Session: ${info.name}`,
    `Tabs: ${info.tabCount}`,
    `Created: ${info.createdAt}`,
    `Updated: ${info.updatedAt}`,
    '',
    'URLs:',
    ...tabs.map((tab, i) => `  ${i + 1}. ${tab.title || tab.url}\n     ${tab.url}`),
  ];

  return lines.join('\n');
}

module.exports = { infoCommand };
