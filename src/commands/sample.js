const { loadSession, saveSession } = require('../storage');

/**
 * Randomly sample N tabs from a session, optionally saving to a new session.
 */
function sampleTabs(tabs, n) {
  if (n >= tabs.length) return [...tabs];
  const shuffled = [...tabs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function formatSampleResult(original, sampled, sessionName, outputName) {
  const lines = [
    `Session: ${sessionName}`,
    `Original tabs: ${original}`,
    `Sampled tabs: ${sampled.length}`,
    '',
    ...sampled.map((t, i) => `  ${i + 1}. ${t.title || t.url}`),
  ];
  if (outputName) {
    lines.push('');
    lines.push(`Saved as: ${outputName}`);
  }
  return lines.join('\n');
}

async function sampleSession(sessionName, n, outputName) {
  const session = await loadSession(sessionName);
  if (!session || !Array.isArray(session.tabs)) {
    throw new Error(`Session "${sessionName}" not found or has no tabs.`);
  }

  const count = parseInt(n, 10);
  if (isNaN(count) || count < 1) {
    throw new Error(`Invalid sample size: ${n}. Must be a positive integer.`);
  }

  const sampled = sampleTabs(session.tabs, count);

  if (outputName) {
    const newSession = {
      ...session,
      name: outputName,
      tabs: sampled,
      createdAt: new Date().toISOString(),
      sampledFrom: sessionName,
    };
    await saveSession(outputName, newSession);
  }

  return {
    original: session.tabs.length,
    sampled,
    formatted: formatSampleResult(session.tabs.length, sampled, sessionName, outputName),
  };
}

module.exports = { sampleSession, sampleTabs, formatSampleResult };
