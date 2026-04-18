const { listSessions, loadSession } = require('../storage');

async function searchSessions(query, options = {}) {
  if (!query || query.trim() === '') {
    throw new Error('Search query cannot be empty');
  }

  const sessions = await listSessions();
  if (sessions.length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const results = [];

  for (const sessionName of sessions) {
    const session = await loadSession(sessionName);
    const tabs = session.tabs || [];

    const matchingTabs = tabs.filter(tab => {
      const urlMatch = tab.url && tab.url.toLowerCase().includes(lowerQuery);
      const titleMatch = tab.title && tab.title.toLowerCase().includes(lowerQuery);
      return urlMatch || titleMatch;
    });

    if (options.sessionName && sessionName.toLowerCase().includes(lowerQuery)) {
      results.push({ sessionName, matchingTabs: tabs, matchType: 'session' });
    } else if (matchingTabs.length > 0) {
      results.push({ sessionName, matchingTabs, matchType: 'tabs' });
    }
  }

  return results;
}

module.exports = { searchSessions };
