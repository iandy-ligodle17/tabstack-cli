const { loadSession, saveSession, listSessions } = require('../storage');

/**
 * Apply a named operation to multiple sessions at once.
 * @param {string[]} sessionNames
 * @param {string} operation  - 'tag', 'dedupe', 'trim', 'sort'
 * @param {object} options
 * @returns {object[]} results  array of { name, success, message }
 */
async function batchApply(sessionNames, operation, options = {}) {
  const results = [];

  for (const name of sessionNames) {
    try {
      const session = await loadSession(name);
      let updated = false;

      if (operation === 'tag') {
        const tag = options.tag;
        if (!tag) throw new Error('tag option required');
        session.tags = session.tags || [];
        if (!session.tags.includes(tag)) {
          session.tags.push(tag);
        }
        updated = true;
      } else if (operation === 'dedupe') {
        const before = session.tabs.length;
        const seen = new Set();
        session.tabs = session.tabs.filter(t => {
          if (seen.has(t.url)) return false;
          seen.add(t.url);
          return true;
        });
        updated = session.tabs.length !== before;
      } else if (operation === 'trim') {
        const max = options.max || 20;
        session.tabs = session.tabs.slice(0, max);
        updated = true;
      } else if (operation === 'sort') {
        session.tabs = session.tabs.slice().sort((a, b) =>
          (a.url || '').localeCompare(b.url || '')
        );
        updated = true;
      } else {
        throw new Error(`Unknown operation: ${operation}`);
      }

      if (updated) await saveSession(name, session);
      results.push({ name, success: true, message: 'ok' });
    } catch (err) {
      results.push({ name, success: false, message: err.message });
    }
  }

  return results;
}

/**
 * Run batchApply across ALL stored sessions.
 */
async function batchApplyAll(operation, options = {}) {
  const names = await listSessions();
  return batchApply(names, operation, options);
}

function formatBatchResult(results) {
  return results
    .map(r => `  [${r.success ? '✓' : '✗'}] ${r.name}: ${r.message}`)
    .join('\n');
}

module.exports = { batchApply, batchApplyAll, formatBatchResult };
