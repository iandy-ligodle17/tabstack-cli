const { pivotSession, formatPivotResult } = require('./pivot');
const storage = require('../storage');

jest.mock('../storage');

function makeSession(tabs) {
  return { name: 'test', tabs, createdAt: '2024-01-01T00:00:00.000Z' };
}

describe('pivotSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('groups tabs by domain', async () => {
    storage.loadSession.mockResolvedValue(makeSession([
      { url: 'https://github.com/foo', title: 'Foo' },
      { url: 'https://github.com/bar', title: 'Bar' },
      { url: 'https://news.ycombinator.com/', title: 'HN' },
    ]));
    storage.saveSession.mockResolvedValue();

    const results = await pivotSession('test', { prefix: 'test', save: false });
    expect(results).toHaveLength(2);
    const gh = results.find(r => r.domain === 'github.com');
    expect(gh).toBeDefined();
    expect(gh.session.tabs).toHaveLength(2);
    const hn = results.find(r => r.domain === 'news.ycombinator.com');
    expect(hn.session.tabs).toHaveLength(1);
  });

  it('saves sessions when save=true', async () => {
    storage.loadSession.mockResolvedValue(makeSession([
      { url: 'https://example.com/a', title: 'A' },
      { url: 'https://other.com/b', title: 'B' },
    ]));
    storage.saveSession.mockResolvedValue();

    await pivotSession('test', { prefix: 'test', save: true });
    expect(storage.saveSession).toHaveBeenCalledTimes(2);
  });

  it('handles invalid URLs gracefully', async () => {
    storage.loadSession.mockResolvedValue(makeSession([
      { url: 'not-a-url', title: 'Bad' },
    ]));
    const results = await pivotSession('test');
    expect(results[0].domain).toBe('unknown');
  });

  it('returns empty result for empty session', async () => {
    storage.loadSession.mockResolvedValue(makeSession([]));
    const results = await pivotSession('test');
    expect(results).toHaveLength(0);
  });

  it('strips www. from domain', async () => {
    storage.loadSession.mockResolvedValue(makeSession([
      { url: 'https://www.example.com/page', title: 'Page' },
    ]));
    const results = await pivotSession('test');
    expect(results[0].domain).toBe('example.com');
  });
});

describe('formatPivotResult', () => {
  it('formats multiple results', () => {
    const results = [
      { name: 'test-github.com', domain: 'github.com', session: { tabs: [{}, {}] } },
      { name: 'test-example.com', domain: 'example.com', session: { tabs: [{}] } },
    ];
    const out = formatPivotResult(results);
    expect(out).toContain('test-github.com');
    expect(out).toContain('2 tab(s)');
    expect(out).toContain('1 tab(s)');
  });

  it('handles empty results', () => {
    expect(formatPivotResult([])).toBe('No tabs to pivot.');
  });
});
