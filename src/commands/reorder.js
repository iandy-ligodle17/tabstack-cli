const { loadSession, saveSession } = require('../storage');

function reorderTabs(session, indices) {
  const tabs = session.tabs;
  const n = tabs.length;

  for (const i of indices) {
    if (i < 0 || i >= n) {
      throw new Error(`Index ${i} out of range (session has ${n} tabs)`);
    }
  }

  const reordered = indices.map(i => tabs[i]);
  const remaining = tabs.filter((_, i) => !indices.includes(i));
  const newTabs = [...reordered, ...remaining];

  return { ...session, tabs: newTabs };
}

async function reorderSession(name, indices) {
  const session = await loadSession(name);

  if (!session.tabs || session.tabs.length === 0) {
    throw new Error(`Session "${name}" has no tabs`);
  }

  const updated = reorderTabs(session, indices);
  await saveSession(name, updated);
  return updated;
}

function parseIndices(str) {
  return str.split(',').map(s => {
    const n = parseInt(s.trim(), 10);
    if (isNaN(n)) throw new Error(`Invalid index: "${s.trim()}"`);
    return n;
  });
}

module.exports = { reorderTabs, reorderSession, parseIndices };
