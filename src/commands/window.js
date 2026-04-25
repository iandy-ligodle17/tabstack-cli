const { loadSession, saveSession } = require('../storage');

/**
 * Split a session into multiple windows based on a tab count per window.
 */
async function splitIntoWindows(sessionName, windowSize) {
  const session = await loadSession(sessionName);
  const tabs = session.tabs || [];

  if (windowSize < 1) throw new Error('Window size must be at least 1');

  const windows = [];
  for (let i = 0; i < tabs.length; i += windowSize) {
    windows.push(tabs.slice(i, i + windowSize));
  }

  return windows;
}

/**
 * Get a specific window (chunk) from a session by index.
 */
async function getWindow(sessionName, windowIndex) {
  const session = await loadSession(sessionName);
  const tabs = session.tabs || [];
  const windows = session.windows || [tabs];

  if (windowIndex < 0 || windowIndex >= windows.length) {
    throw new Error(`Window index ${windowIndex} out of range (0-${windows.length - 1})`);
  }

  return windows[windowIndex];
}

/**
 * Assign tabs to named windows and persist.
 */
async function assignWindows(sessionName, windowMap) {
  const session = await loadSession(sessionName);
  session.windowMap = windowMap;
  await saveSession(sessionName, session);
  return session;
}

function formatWindowResult(windows) {
  return windows
    .map((tabs, i) => {
      const lines = [`Window ${i + 1} (${tabs.length} tab${tabs.length !== 1 ? 's' : ''}):`];
      tabs.forEach((t, j) => lines.push(`  ${j + 1}. ${t.title || t.url}`));
      return lines.join('\n');
    })
    .join('\n\n');
}

module.exports = { splitIntoWindows, getWindow, assignWindows, formatWindowResult };
