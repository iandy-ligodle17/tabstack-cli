const { loadSession, listSessions } = require('../storage');

function getHistory(sessions, limit = 10) {
  const sorted = sessions
    .filter(s => s.savedAt)
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
    .slice(0, limit);
  return sorted;
}

function formatHistory(sessions) {
  if (!sessions.length) return 'No session history found.';
  const lines = sessions.map((s, i) => {
    const date = new Date(s.savedAt).toLocaleString();
    const tabCount = (s.tabs || []).length;
    const tags = s.tags && s.tags.length ? ` [${s.tags.join(', ')}]` : '';
    return `${i + 1}. ${s.name}${tags} — ${tabCount} tab${tabCount !== 1 ? 's' : ''} — ${date}`;
  });
  return lines.join('\n');
}

async function historyCommand(options = {}) {
  const { limit = 10 } = options;
  const sessions = await listSessions();
  const enriched = await Promise.all(
    sessions.map(async name => {
      try {
        const data = await loadSession(name);
        return { name, ...data };
      } catch {
        return null;
      }
    })
  );
  const valid = enriched.filter(Boolean);
  const history = getHistory(valid, limit);
  return formatHistory(history);
}

module.exports = { historyCommand, getHistory, formatHistory };
