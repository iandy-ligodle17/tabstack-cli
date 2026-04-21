const { loadSession, saveSession } = require('../storage');

/**
 * Split a session into chunks of N tabs each.
 * Returns an array of new session names created.
 */
async function chunkSession(name, size, options = {}) {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error('Chunk size must be a positive integer');
  }

  const session = await loadSession(name);
  const tabs = session.tabs || [];

  if (tabs.length === 0) {
    throw new Error(`Session "${name}" has no tabs to chunk`);
  }

  const chunks = [];
  for (let i = 0; i < tabs.length; i += size) {
    chunks.push(tabs.slice(i, i + size));
  }

  const prefix = options.prefix || `${name}-chunk`;
  const created = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkName = `${prefix}-${i + 1}`;
    const chunkSession = {
      ...session,
      name: chunkName,
      tabs: chunks[i],
      createdAt: new Date().toISOString(),
      meta: {
        ...(session.meta || {}),
        chunkedFrom: name,
        chunkIndex: i + 1,
        totalChunks: chunks.length,
      },
    };
    await saveSession(chunkName, chunkSession);
    created.push(chunkName);
  }

  return created;
}

function formatChunkResult(created, originalName, size) {
  const lines = [
    `Chunked "${originalName}" into ${created.length} session(s) of up to ${size} tab(s) each:`,
    ...created.map((name, i) => `  [${i + 1}] ${name}`),
  ];
  return lines.join('\n');
}

module.exports = { chunkSession, formatChunkResult };
