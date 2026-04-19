const { listSessions, loadSession, deleteSession } = require('../storage');

async function cleanupSessions({ dryRun = false, minTabs = 1 } = {}) {
  const sessions = await listSessions();
  const removed = [];
  const errors = [];

  for (const name of sessions) {
    try {
      const session = await loadSession(name);
      const tabCount = session.tabs ? session.tabs.length : 0;

      if (tabCount < minTabs) {
        if (!dryRun) {
          await deleteSession(name);
        }
        removed.push({ name, tabCount });
      }
    } catch (err) {
      errors.push({ name, error: err.message });
    }
  }

  return { removed, errors, dryRun };
}

function formatCleanupResult({ removed, errors, dryRun }) {
  const lines = [];
  const prefix = dryRun ? '[dry-run] would remove' : 'removed';

  if (removed.length === 0) {
    lines.push('nothing to clean up');
  } else {
    for (const { name, tabCount } of removed) {
      lines.push(`${prefix}: ${name} (${tabCount} tab${tabCount === 1 ? '' : 's'})`);
    }
    lines.push(`\ntotal: ${removed.length} session${removed.length === 1 ? '' : 's'}`);
  }

  if (errors.length > 0) {
    lines.push('\nerrors:');
    for (const { name, error } of errors) {
      lines.push(`  ${name}: ${error}`);
    }
  }

  return lines.join('\n');
}

module.exports = { cleanupSessions, formatCleanupResult };
