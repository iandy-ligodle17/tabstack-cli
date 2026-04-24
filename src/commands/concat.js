const { loadSession, saveSession } = require('../storage');

/**
 * Concatenate multiple sessions into one.
 * Tabs are appended in order: session1 tabs, then session2 tabs, etc.
 */
async function concatSessions(sessionNames, outputName, options = {}) {
  if (!sessionNames || sessionNames.length < 2) {
    throw new Error('At least two session names are required');
  }

  const allTabs = [];
  const loadedSessions = [];

  for (const name of sessionNames) {
    const session = await loadSession(name);
    if (!session) {
      throw new Error(`Session not found: ${name}`);
    }
    loadedSessions.push(session);
    allTabs.push(...(session.tabs || []));
  }

  const result = {
    name: outputName,
    tabs: allTabs,
    createdAt: new Date().toISOString(),
    tags: options.tags || [],
    meta: {
      concatSources: sessionNames,
      totalSources: sessionNames.length,
    },
  };

  await saveSession(outputName, result);
  return result;
}

function formatConcatResult(result, sourceNames) {
  const lines = [
    `Concatenated ${sourceNames.length} sessions into "${result.name}"`,
    `Total tabs: ${result.tabs.length}`,
    '',
    'Sources:',
  ];
  sourceNames.forEach((name, i) => {
    lines.push(`  ${i + 1}. ${name}`);
  });
  return lines.join('\n');
}

module.exports = { concatSessions, formatConcatResult };
