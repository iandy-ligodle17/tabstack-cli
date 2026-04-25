const { getDomainFrequency, formatFrequency, frequencyCommand } = require('./frequency');

jest.mock('../storage');
const { loadSession } = require('../storage');

function makeSession(urls) {
  return { name: 'test', tabs: urls.map(url => ({ url, title: url })) };
}

describe('getDomainFrequency', () => {
  it('counts tabs per domain', () => {
    const session = makeSession([
      'https://github.com/foo',
      'https://github.com/bar',
      'https://www.google.com/search',
      'https://news.ycombinator.com/',
    ]);
    const freq = getDomainFrequency(session);
    expect(freq[0]).toMatchObject({ domain: 'github.com', count: 2 });
    expect(freq).toHaveLength(3);
  });

  it('strips www prefix from domains', () => {
    const session = makeSession(['https://www.example.com/page']);
    const freq = getDomainFrequency(session);
    expect(freq[0].domain).toBe('example.com');
  });

  it('handles invalid URLs gracefully', () => {
    const session = makeSession(['not-a-url']);
    const freq = getDomainFrequency(session);
    expect(freq[0].domain).toBe('unknown');
  });

  it('returns empty array for empty session', () => {
    const session = makeSession([]);
    expect(getDomainFrequency(session)).toEqual([]);
  });

  it('sorts by count descending', () => {
    const session = makeSession([
      'https://a.com/1', 'https://b.com/1', 'https://b.com/2', 'https://b.com/3',
    ]);
    const freq = getDomainFrequency(session);
    expect(freq[0].domain).toBe('b.com');
    expect(freq[1].domain).toBe('a.com');
  });
});

describe('formatFrequency', () => {
  it('returns no tabs message for empty array', () => {
    expect(formatFrequency([])).toBe('No tabs found.');
  });

  it('includes domain and count in output', () => {
    const freq = [{ domain: 'github.com', count: 3, urls: ['https://github.com/a'] }];
    const out = formatFrequency(freq);
    expect(out).toContain('github.com');
    expect(out).toContain('3');
  });

  it('respects top option', () => {
    const freq = [
      { domain: 'a.com', count: 5, urls: [] },
      { domain: 'b.com', count: 3, urls: [] },
      { domain: 'c.com', count: 1, urls: [] },
    ];
    const out = formatFrequency(freq, { top: 2 });
    expect(out).toContain('a.com');
    expect(out).toContain('b.com');
    expect(out).not.toContain('c.com');
  });

  it('shows urls in verbose mode', () => {
    const freq = [{ domain: 'x.com', count: 1, urls: ['https://x.com/page'] }];
    const out = formatFrequency(freq, { verbose: true });
    expect(out).toContain('https://x.com/page');
  });
});

describe('frequencyCommand', () => {
  it('loads session and returns freq and output', async () => {
    loadSession.mockResolvedValue(makeSession(['https://github.com/a', 'https://github.com/b']));
    const result = await frequencyCommand('mysession');
    expect(result.freq[0].domain).toBe('github.com');
    expect(typeof result.output).toBe('string');
  });
});
