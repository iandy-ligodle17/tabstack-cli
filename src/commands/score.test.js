const { scoreTab, scoreSession, formatScore } = require('./score');

function makeSession(urls) {
  return {
    tabs: urls.map((url, i) => ({ url, title: `Tab ${i + 1}` })),
  };
}

describe('scoreTab', () => {
  test('gives higher score to github.com', () => {
    const tab = { url: 'https://github.com/user/repo', title: 'Some repo on GitHub' };
    expect(scoreTab(tab)).toBeGreaterThan(1.0);
  });

  test('gives lower score to localhost', () => {
    const tab = { url: 'http://localhost:3000', title: 'Local' };
    expect(scoreTab(tab)).toBeLessThan(1.0);
  });

  test('handles invalid url gracefully', () => {
    const tab = { url: 'not-a-url', title: '' };
    expect(scoreTab(tab)).toBe(0.5);
  });

  test('https bonus applied', () => {
    const http = scoreTab({ url: 'http://example.com', title: 'x' });
    const https = scoreTab({ url: 'https://example.com', title: 'x' });
    expect(https).toBeGreaterThan(http);
  });
});

describe('scoreSession', () => {
  test('returns empty result for empty session', () => {
    const result = scoreSession({ tabs: [] });
    expect(result.total).toBe(0);
    expect(result.average).toBe(0);
    expect(result.tabs).toHaveLength(0);
  });

  test('sorts tabs by score descending', () => {
    const session = makeSession([
      'http://localhost:3000',
      'https://github.com/user/repo',
    ]);
    const result = scoreSession(session);
    expect(result.tabs[0].url).toBe('https://github.com/user/repo');
  });

  test('computes average correctly', () => {
    const session = makeSession(['https://example.com', 'https://example.org']);
    const result = scoreSession(session);
    expect(result.average).toBeCloseTo(result.total / 2, 1);
  });
});

describe('formatScore', () => {
  test('includes session name', () => {
    const result = scoreSession(makeSession(['https://github.com/x']));
    const out = formatScore(result, 'work');
    expect(out).toContain('work');
  });

  test('includes score values', () => {
    const result = scoreSession(makeSession(['https://github.com/x']));
    const out = formatScore(result, 'work');
    expect(out).toMatch(/\[\d+\.\d+\]/);
  });
});
