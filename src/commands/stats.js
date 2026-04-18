const { listSessions, loadSession } = require('../storage');

async function stats(options = {}) {
  const sessions = await listSessions();

  if (sessions.length === 0) {
    return { totalSessions: 0, totalTabs: 0, avgTabs: 0, largest: null, smallest: null, tags: {} };
  }

  let totalTabs = 0;
  let largest = null;
  let smallest = null;
  const tagCounts = {};

  for (const name of sessions) {
    const session = await loadSession(name);
    const tabCount = session.tabs ? session.tabs.length : 0;
    totalTabs += tabCount;

    if (!largest || tabCount > largest.count) {
      largest = { name, count: tabCount };
    }
    if (!smallest || tabCount < smallest.count) {
      smallest = { name, count: tabCount };
    }

    if (session.tags && Array.isArray(session.tags)) {
      for (const tag of session.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }

  const avgTabs = parseFloat((totalTabs / sessions.length).toFixed(2));

  const result = {
    totalSessions: sessions.length,
    totalTabs,
    avgTabs,
    largest,
    smallest,
    tags: tagCounts,
  };

  if (options.verbose) {
    result.sessions = sessions;
  }

  return result;
}

module.exports = { stats };
