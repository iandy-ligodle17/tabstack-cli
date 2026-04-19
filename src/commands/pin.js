const { loadSession, saveSession } = require('../storage');

async function pinTab(sessionName, tabIndex) {
  const session = await loadSession(sessionName);

  if (!session || !session.tabs) {
    throw new Error(`Session "${sessionName}" not found or has no tabs`);
  }

  const idx = parseInt(tabIndex, 10);
  if (isNaN(idx) || idx < 0 || idx >= session.tabs.length) {
    throw new Error(`Invalid tab index: ${tabIndex}. Session has ${session.tabs.length} tabs (0-indexed).`);
  }

  const tab = session.tabs[idx];
  tab.pinned = !tab.pinned;

  await saveSession(sessionName, session);

  return { tab, pinned: tab.pinned };
}

async function getPinnedTabs(sessionName) {
  const session = await loadSession(sessionName);

  if (!session || !session.tabs) {
    throw new Error(`Session "${sessionName}" not found or has no tabs`);
  }

  return session.tabs.filter(tab => tab.pinned === true);
}

module.exports = { pinTab, getPinnedTabs };
