const { loadSession, saveSession } = require('../storage');

const STASH_PREFIX = '__stash__';

function stashSession(name) {
  const session = loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }
  const stashName = `${STASH_PREFIX}${name}_${Date.now()}`;
  saveSession(stashName, { ...session, stashedFrom: name, stashedAt: new Date().toISOString() });
  return stashName;
}

function popStash(name) {
  const { listSessions, deleteSession } = require('../storage');
  const all = listSessions();
  const stashes = all
    .filter(s => s.startsWith(STASH_PREFIX + name + '_'))
    .sort();
  if (stashes.length === 0) {
    throw new Error(`No stash found for session "${name}"`);
  }
  const latest = stashes[stashes.length - 1];
  const stashed = loadSession(latest);
  const restored = { ...stashed };
  delete restored.stashedFrom;
  delete restored.stashedAt;
  saveSession(name, restored);
  deleteSession(latest);
  return latest;
}

function listStashes() {
  const { listSessions } = require('../storage');
  return listSessions()
    .filter(s => s.startsWith(STASH_PREFIX))
    .map(s => {
      const session = loadSession(s);
      return {
        stashName: s,
        originalName: session.stashedFrom,
        stashedAt: session.stashedAt,
        tabCount: (session.tabs || []).length
      };
    });
}

function formatStashList(stashes) {
  if (stashes.length === 0) return 'No stashes found.';
  return stashes
    .map((s, i) => `  [${i}] ${s.originalName} — ${s.tabCount} tab(s) — stashed at ${s.stashedAt}`)
    .join('\n');
}

module.exports = { stashSession, popStash, listStashes, formatStashList, STASH_PREFIX };
