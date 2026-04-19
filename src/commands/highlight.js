const { loadSession, saveSession } = require('../storage');

function highlightTab(session, index) {
  if (index < 0 || index >= session.tabs.length) {
    throw new Error(`Tab index ${index} out of range`);
  }
  const tab = session.tabs[index];
  tab.highlighted = !tab.highlighted;
  return tab.highlighted;
}

function getHighlightedTabs(session) {
  return session.tabs.filter(t => t.highlighted);
}

function formatHighlighted(tabs) {
  if (tabs.length === 0) return 'No highlighted tabs.';
  return tabs.map((t, i) => `  ★ [${i}] ${t.title || t.url}`).join('\n');
}

async function toggleHighlight(sessionName, index) {
  const session = await loadSession(sessionName);
  const isNowHighlighted = highlightTab(session, index);
  await saveSession(sessionName, session);
  const tab = session.tabs[index];
  const state = isNowHighlighted ? 'highlighted' : 'unhighlighted';
  return `Tab "${tab.title || tab.url}" ${state}.`;
}

async function listHighlighted(sessionName) {
  const session = await loadSession(sessionName);
  const tabs = getHighlightedTabs(session);
  return formatHighlighted(tabs);
}

async function clearHighlights(sessionName) {
  const session = await loadSession(sessionName);
  const count = session.tabs.filter(t => t.highlighted).length;
  session.tabs.forEach(t => { delete t.highlighted; });
  await saveSession(sessionName, session);
  return `Cleared ${count} highlight(s) from "${sessionName}".`;
}

module.exports = { highlightTab, getHighlightedTabs, formatHighlighted, toggleHighlight, listHighlighted, clearHighlights };
