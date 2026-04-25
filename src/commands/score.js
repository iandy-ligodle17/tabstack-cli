const { loadSession } = require('../storage');

const DOMAIN_WEIGHTS = {
  'github.com': 1.5,
  'stackoverflow.com': 1.4,
  'docs.': 1.3,
  'localhost': 0.5,
};

function scoreTab(tab) {
  let score = 1.0;
  try {
    const url = new URL(tab.url);
    const hostname = url.hostname;
    for (const [pattern, weight] of Object.entries(DOMAIN_WEIGHTS)) {
      if (hostname.includes(pattern)) {
        score *= weight;
        break;
      }
    }
    if (tab.title && tab.title.length > 10) score += 0.2;
    if (url.protocol === 'https:') score += 0.1;
  } catch {
    score = 0.5;
  }
  return Math.round(score * 100) / 100;
}

function scoreSession(session) {
  const tabs = session.tabs || [];
  if (tabs.length === 0) return { tabs: [], total: 0, average: 0 };

  const scored = tabs.map((tab) => ({ ...tab, score: scoreTab(tab) }));
  scored.sort((a, b) => b.score - a.score);

  const total = scored.reduce((sum, t) => sum + t.score, 0);
  const average = Math.round((total / scored.length) * 100) / 100;

  return { tabs: scored, total: Math.round(total * 100) / 100, average };
}

function formatScore(result, sessionName) {
  const lines = [`Session: ${sessionName}`, `Average score: ${result.average}  Total: ${result.total}`, ''];
  result.tabs.forEach((tab, i) => {
    lines.push(`  ${i + 1}. [${tab.score}] ${tab.title || tab.url}`);
    lines.push(`       ${tab.url}`);
  });
  return lines.join('\n');
}

async function runScore(sessionName) {
  const session = await loadSession(sessionName);
  const result = scoreSession(session);
  console.log(formatScore(result, sessionName));
}

module.exports = { scoreTab, scoreSession, formatScore, runScore };
