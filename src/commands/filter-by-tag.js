const { listSessions, loadSession } = require('../storage');

async function filterByTag(tags, options = {}) {
  const names = await listSessions();
  const results = [];

  for (const name of names) {
    const session = await loadSession(name);
    if (!session) continue;
    const sessionTags = session.tags || [];

    const match = options.matchAll
      ? tags.every(t => sessionTags.includes(t))
      : tags.some(t => sessionTags.includes(t));

    if (match) {
      results.push({
        name,
        tags: sessionTags,
        tabCount: (session.tabs || []).length,
        createdAt: session.createdAt,
      });
    }
  }

  return results;
}

module.exports = { filterByTag };
