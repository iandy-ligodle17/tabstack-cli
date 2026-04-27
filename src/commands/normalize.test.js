const { normalizeUrl, normalizeSession, formatNormalizeResult } = require('./normalize');

describe('normalizeUrl', () => {
  it('removes utm tracking params', () => {
    const url = 'https://example.com/page?utm_source=google&utm_medium=cpc';
    expect(normalizeUrl(url)).toBe('https://example.com/page');
  });

  it('removes fbclid param', () => {
    const url = 'https://example.com/?fbclid=abc123';
    expect(normalizeUrl(url)).toBe('https://example.com/');
  });

  it('preserves non-tracking query params', () => {
    const url = 'https://example.com/search?q=hello&page=2';
    expect(normalizeUrl(url)).toBe('https://example.com/search?q=hello&page=2');
  });

  it('removes trailing slash from path', () => {
    const url = 'https://example.com/about/';
    expect(normalizeUrl(url)).toBe('https://example.com/about');
  });

  it('preserves root trailing slash', () => {
    const url = 'https://example.com/';
    expect(normalizeUrl(url)).toBe('https://example.com/');
  });

  it('returns original url if invalid', () => {
    const url = 'not-a-url';
    expect(normalizeUrl(url)).toBe('not-a-url');
  });
});

describe('normalizeSession', () => {
  function makeSession(tabs) {
    return { name: 'test', tabs, createdAt: Date.now() };
  }

  it('normalizes all tabs', () => {
    const session = makeSession([
      { url: 'https://example.com/page?utm_source=x', title: 'A' },
      { url: 'https://other.com/about/', title: 'B' }
    ]);
    const { session: result, stats } = normalizeSession(session);
    expect(result.tabs[0].url).toBe('https://example.com/page');
    expect(result.tabs[1].url).toBe('https://other.com/about');
    expect(stats.changed).toBe(2);
    expect(stats.total).toBe(2);
  });

  it('reports zero changed when no normalization needed', () => {
    const session = makeSession([
      { url: 'https://example.com/page', title: 'A' }
    ]);
    const { stats } = normalizeSession(session);
    expect(stats.changed).toBe(0);
  });
});

describe('formatNormalizeResult', () => {
  it('shows summary with changes', () => {
    const result = formatNormalizeResult({ total: 5, changed: 3 }, 'work');
    expect(result).toContain('work');
    expect(result).toContain('5');
    expect(result).toContain('3');
  });

  it('shows no changes message when 0 changed', () => {
    const result = formatNormalizeResult({ total: 4, changed: 0 }, 'work');
    expect(result).toContain('No changes needed.');
  });
});
