const { loadSession, saveSession } = require('../storage');

async function toggleFavorite(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  session.favorite = !session.favorite;
  session.updatedAt = new Date().toISOString();
  await saveSession(sessionName, session);

  return { name: sessionName, favorite: session.favorite };
}

async function listFavorites(allSessions) {
  return allSessions.filter(s => s.favorite === true);
}

function formatFavorites(sessions) {
  if (!sessions.length) return 'No favorite sessions saved.';
  const lines = sessions.map(s => {
    const count = s.tabs ? s.tabs.length : 0;
    return `  ★ ${s.name} (${count} tab${count !== 1 ? 's' : ''})`;
  });
  return ['Favorite sessions:', ...lines].join('\n');
}

module.exports = { toggleFavorite, listFavorites, formatFavorites };
