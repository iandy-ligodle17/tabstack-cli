const { loadSession, saveSession } = require('../storage');

/**
 * Move all tabs from a source session into a target session, emptying the source.
 * @param {string} sourceName
 * @param {string} targetName
 * @returns {{ moved: number, target: object, source: object }}
 */
async function drainSession(sourceName, targetName) {
  const source = await loadSession(sourceName);
  const target = await loadSession(targetName);

  if (!source.tabs || source.tabs.length === 0) {
    return { moved: 0, target, source };
  }

  const movedCount = source.tabs.length;

  // Merge tabs, avoiding exact URL duplicates
  const existingUrls = new Set((target.tabs || []).map(t => t.url));
  const newTabs = source.tabs.filter(t => !existingUrls.has(t.url));
  const skipped = source.tabs.length - newTabs.length;

  target.tabs = [...(target.tabs || []), ...newTabs];
  target.updatedAt = new Date().toISOString();

  source.tabs = [];
  source.updatedAt = new Date().toISOString();

  await saveSession(targetName, target);
  await saveSession(sourceName, source);

  return { moved: movedCount, skipped, target, source };
}

/**
 * Format the result of a drain operation for display.
 */
function formatDrainResult({ moved, skipped, target, source }) {
  const lines = [];
  lines.push(`Drained ${moved} tab(s) (${skipped} duplicate(s) skipped).`);
  lines.push(`Source now has ${source.tabs.length} tab(s).`);
  lines.push(`Target now has ${target.tabs.length} tab(s).`);
  return lines.join('\n');
}

module.exports = { drainSession, formatDrainResult };
