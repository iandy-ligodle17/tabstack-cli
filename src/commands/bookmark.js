const { loadSession, saveSession } = require('../storage');

function bookmarkTab(sessionName, tabIndex, label) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  const tabs = session.tabs;
  if (tabIndex < 0 || tabIndex >= tabs.length) {
    throw new Error(`Tab index ${tabIndex} out of range (0-${tabs.length - 1})`);
  }

  if (!session.bookmarks) session.bookmarks = {};
  session.bookmarks[tabIndex] = {
    label: label || tabs[tabIndex].title || tabs[tabIndex].url,
    url: tabs[tabIndex].url,
    addedAt: new Date().toISOString()
  };

  saveSession(sessionName, session);
  return session.bookmarks[tabIndex];
}

function removeBookmark(sessionName, tabIndex) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  if (!session.bookmarks || !(tabIndex in session.bookmarks)) {
    throw new Error(`No bookmark at index ${tabIndex}`);
  }

  const removed = session.bookmarks[tabIndex];
  delete session.bookmarks[tabIndex];
  saveSession(sessionName, session);
  return removed;
}

function getBookmarks(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);
  return session.bookmarks || {};
}

function formatBookmarks(bookmarks, tabs) {
  const entries = Object.entries(bookmarks);
  if (entries.length === 0) return 'No bookmarks.';
  return entries
    .map(([idx, bm]) => `  [${idx}] ${bm.label}\n      ${bm.url}\n      Added: ${bm.addedAt}`)
    .join('\n');
}

module.exports = { bookmarkTab, removeBookmark, getBookmarks, formatBookmarks };
