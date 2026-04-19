const { loadSession, saveSession } = require('../storage');

async function groupTabs(sessionName, groupName, indices) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  const tabs = session.tabs || [];
  const invalidIndices = indices.filter(i => i < 0 || i >= tabs.length);
  if (invalidIndices.length > 0) {
    throw new Error(`Invalid tab indices: ${invalidIndices.join(', ')}`);
  }

  const updatedTabs = tabs.map((tab, i) => {
    if (indices.includes(i)) {
      return { ...tab, group: groupName };
    }
    return tab;
  });

  const updatedSession = { ...session, tabs: updatedTabs };
  await saveSession(sessionName, updatedSession);
  return { groupName, count: indices.length };
}

async function listGroups(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  const tabs = session.tabs || [];
  const groups = {};

  for (const tab of tabs) {
    const g = tab.group || '(ungrouped)';
    if (!groups[g]) groups[g] = [];
    groups[g].push(tab);
  }

  return groups;
}

async function ungroup(sessionName, groupName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session '${sessionName}' not found`);

  const tabs = session.tabs || [];
  const updatedTabs = tabs.map(tab =>
    tab.group === groupName ? { ...tab, group: undefined } : tab
  );

  await saveSession(sessionName, { ...session, tabs: updatedTabs });
  return updatedTabs.filter(t => !t.group || t.group !== groupName).length;
}

module.exports = { groupTabs, listGroups, ungroup };
