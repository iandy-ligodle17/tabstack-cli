const { digestSession, formatDigest } = require('./digest');

function makeSession(overrides = {}) {
  return {
    name: 'test-session',
    createdAt: '2024-01-15T10:00:00.000Z',
    tags: ['work'],
    tabs: [
      { url: 'https://github.com/user/repo', title: 'GitHub Repo' },
      { url: 'https://github.com/user/other', title: 'GitHub Other' },
      { url: 'https://docs.example.com/page', title: 'Docs' },
      { url: 'https://news.ycombinator.com', title: '' },
      { url: 'http://localhost:3000', title: 'Local Dev' },
    ],
    ...overrides,
  };
}

describe('digestSession', () => {
  test('returns correct total tab count', () => {
    const result = digestSession(makeSession());
    expect(result.totalTabs).toBe(5);
  });

  test('counts unique domains correctly', () => {
    const result = digestSession(makeSession());
    expect(result.uniqueDomains).toBe(4);
  });

  test('top domains sorted by frequency', () => {
    const result = digestSession(makeSession());
    expect(result.topDomains[0][0]).toBe('github.com');
    expect(result.topDomains[0][1]).toBe(2);
  });

  test('counts titled and untitled tabs', () => {
    const result = digestSession(makeSession());
    expect(result.titledCount).toBe(4);
    expect(result.untitledCount).toBe(1);
  });

  test('counts schemes', () => {
    const result = digestSession(makeSession());
    expect(result.schemes['https']).toBe(4);
    expect(result.schemes['http']).toBe(1);
  });

  test('handles empty tabs array', () => {
    const result = digestSession(makeSession({ tabs: [] }));
    expect(result.totalTabs).toBe(0);
    expect(result.uniqueDomains).toBe(0);
    expect(result.topDomains).toEqual([]);
  });

  test('includes tags and name', () => {
    const result = digestSession(makeSession());
    expect(result.name).toBe('test-session');
    expect(result.tags).toEqual(['work']);
  });

  test('handles invalid URLs gracefully', () => {
    const session = makeSession({ tabs: [{ url: 'not-a-url', title: 'Bad' }] });
    const result = digestSession(session);
    expect(result.schemes['invalid']).toBe(1);
  });
});

describe('formatDigest', () => {
  test('includes session name in output', () => {
    const digest = digestSession(makeSession());
    const output = formatDigest(digest);
    expect(output).toContain('test-session');
  });

  test('includes top domain in output', () => {
    const digest = digestSession(makeSession());
    const output = formatDigest(digest);
    expect(output).toContain('github.com');
  });

  test('includes tag info', () => {
    const digest = digestSession(makeSession());
    const output = formatDigest(digest);
    expect(output).toContain('work');
  });
});
