const { loadSession, listSessions } = require('../storage');

const DEFAULT_MAX_SESSIONS = 50;
const DEFAULT_MAX_TABS_PER_SESSION = 200;

function getQuotaConfig() {
  return {
    maxSessions: parseInt(process.env.TABSTACK_MAX_SESSIONS || DEFAULT_MAX_SESSIONS, 10),
    maxTabsPerSession: parseInt(process.env.TABSTACK_MAX_TABS || DEFAULT_MAX_TABS_PER_SESSION, 10),
  };
}

async function checkQuota(sessionName = null) {
  const config = getQuotaConfig();
  const sessions = await listSessions();
  const sessionCount = sessions.length;

  const result = {
    sessionCount,
    maxSessions: config.maxSessions,
    sessionsOk: sessionCount < config.maxSessions,
    tabs: null,
  };

  if (sessionName) {
    const session = await loadSession(sessionName);
    if (!session) {
      throw new Error(`Session "${sessionName}" not found`);
    }
    const tabCount = session.tabs ? session.tabs.length : 0;
    result.tabs = {
      sessionName,
      tabCount,
      maxTabs: config.maxTabsPerSession,
      tabsOk: tabCount < config.maxTabsPerSession,
    };
  }

  return result;
}

function formatQuota(result) {
  const sessionBar = buildBar(result.sessionCount, result.maxSessions);
  const lines = [
    'Quota Usage',
    '-----------',
    `Sessions: ${result.sessionCount}/${result.maxSessions} ${sessionBar} ${result.sessionsOk ? '✓' : '✗ LIMIT REACHED'}`,
  ];

  if (result.tabs) {
    const tabBar = buildBar(result.tabs.tabCount, result.tabs.maxTabs);
    lines.push(
      `Tabs in "${result.tabs.sessionName}": ${result.tabs.tabCount}/${result.tabs.maxTabs} ${tabBar} ${result.tabs.tabsOk ? '✓' : '✗ LIMIT REACHED'}`,
    );
  }

  return lines.join('\n');
}

function buildBar(current, max, width = 20) {
  const filled = Math.min(Math.round((current / max) * width), width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

module.exports = { checkQuota, formatQuota, getQuotaConfig, buildBar };
