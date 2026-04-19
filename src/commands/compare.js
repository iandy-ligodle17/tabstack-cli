const { loadSession } = require('../storage');

function compareSessions(session1, session2) {
  const urls1 = new Set(session1.tabs.map(t => t.url));
  const urls2 = new Set(session2.tabs.map(t => t.url));

  const onlyInFirst = session1.tabs.filter(t => !urls2.has(t.url));
  const onlyInSecond = session2.tabs.filter(t => !urls1.has(t.url));
  const inBoth = session1.tabs.filter(t => urls2.has(t.url));

  return { onlyInFirst, onlyInSecond, inBoth };
}

function formatComparison(name1, name2, result) {
  const lines = [];
  lines.push(`Comparing "${name1}" vs "${name2}"`);
  lines.push(`  Shared tabs: ${result.inBoth.length}`);
  lines.push('');

  if (result.onlyInFirst.length > 0) {
    lines.push(`Only in "${name1}" (${result.onlyInFirst.length}):`);
    result.onlyInFirst.forEach(t => lines.push(`  - ${t.title || t.url}`));
    lines.push('');
  }

  if (result.onlyInSecond.length > 0) {
    lines.push(`Only in "${name2}" (${result.onlyInSecond.length}):`);
    result.onlyInSecond.forEach(t => lines.push(`  - ${t.title || t.url}`));
    lines.push('');
  }

  if (result.onlyInFirst.length === 0 && result.onlyInSecond.length === 0) {
    lines.push('Sessions are identical.');
  }

  return lines.join('\n');
}

async function compareCommand(name1, name2) {
  if (!name1 || !name2) {
    console.error('Usage: compare <session1> <session2>');
    process.exit(1);
  }

  const session1 = await loadSession(name1);
  const session2 = await loadSession(name2);

  if (!session1) { console.error(`Session not found: ${name1}`); process.exit(1); }
  if (!session2) { console.error(`Session not found: ${name2}`); process.exit(1); }

  const result = compareSessions(session1, session2);
  console.log(formatComparison(name1, name2, result));
}

module.exports = { compareSessions, formatComparison, compareCommand };
