const { listSessions, loadSession } = require('../storage');

function getRecentSessions(limit = 5) {
  const sessions = listSessions();

  const withMeta = sessions.map(name => {
    try {
      const session = loadSession(name);
      return {
        name,
        savedAt: session.savedAt || null,
        tabCount: Array.isArray(session.tabs) ? session.tabs.length : 0
      };
    } catch {
      return { name, savedAt: null, tabCount: 0 };
    }
  });

  const sorted = withMeta
    .filter(s => s.savedAt)
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  return sorted.slice(0, limit);
}

function formatRecent(sessions) {
  if (sessions.length === 0) {
    return 'No recent sessions found.';
  }

  const lines = sessions.map((s, i) => {
    const date = new Date(s.savedAt).toLocaleString();
    return `  ${i + 1}. ${s.name} — ${s.tabCount} tab(s) — saved ${date}`;
  });

  return `Recent sessions:\n${lines.join('\n')}`;
}

module.exports = { getRecentSessions, formatRecent };
