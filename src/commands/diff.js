const { loadSession } = require('../storage');

function diffSessions(nameA, nameB) {
  const sessionA = loadSession(nameA);
  const sessionB = loadSession(nameB);

  if (!sessionA) throw new Error(`Session "${nameA}" not found`);
  if (!sessionB) throw new Error(`Session "${nameB}" not found`);

  const urlsA = new Set(sessionA.tabs.map(t => t.url));
  const urlsB = new Set(sessionB.tabs.map(t => t.url));

  const onlyInA = sessionA.tabs.filter(t => !urlsB.has(t.url));
  const onlyInB = sessionB.tabs.filter(t => !urlsA.has(t.url));
  const inBoth = sessionA.tabs.filter(t => urlsB.has(t.url));

  return { onlyInA, onlyInB, inBoth };
}

function formatDiff(nameA, nameB, diff) {
  const lines = [];
  lines.push(`Diff: "${nameA}" vs "${nameB}"`);
  lines.push('');

  if (diff.onlyInA.length === 0 && diff.onlyInB.length === 0) {
    lines.push('No differences found — sessions are identical.');
    return lines.join('\n');
  }

  if (diff.onlyInA.length > 0) {
    lines.push(`Only in "${nameA}" (${diff.onlyInA.length}):`);
    diff.onlyInA.forEach(t => lines.push(`  - ${t.title || t.url}`));
    lines.push('');
  }

  if (diff.onlyInB.length > 0) {
    lines.push(`Only in "${nameB}" (${diff.onlyInB.length}):`);
    diff.onlyInB.forEach(t => lines.push(`  + ${t.title || t.url}`));
    lines.push('');
  }

  lines.push(`Shared tabs: ${diff.inBoth.length}`);
  return lines.join('\n');
}

module.exports = { diffSessions, formatDiff };
