const { omitTabs, formatOmitResult } = require('./omit');

function makeSession(urls) {
  return {
    name: 'test',
    tabs: urls.map(url => ({ url, title: url }))
  };
}

describe('omitTabs', () => {
  it('removes a single tab by index', () => {
    const session = makeSession(['https://a.com', 'https://b.com', 'https://c.com']);
    const result = omitTabs(session, [1]);
    expect(result.tabs).toHaveLength(2);
    expect(result.tabs[0].url).toBe('https://a.com');
    expect(result.tabs[1].url).toBe('https://c.com');
  });

  it('removes multiple tabs by index', () => {
    const session = makeSession(['https://a.com', 'https://b.com', 'https://c.com']);
    const result = omitTabs(session, [0, 2]);
    expect(result.tabs).toHaveLength(1);
    expect(result.tabs[0].url).toBe('https://b.com');
  });

  it('returns empty tabs if all are omitted', () => {
    const session = makeSession(['https://a.com', 'https://b.com']);
    const result = omitTabs(session, [0, 1]);
    expect(result.tabs).toHaveLength(0);
  });

  it('does not mutate original session', () => {
    const session = makeSession(['https://a.com', 'https://b.com']);
    omitTabs(session, [0]);
    expect(session.tabs).toHaveLength(2);
  });

  it('preserves other session fields', () => {
    const session = { ...makeSession(['https://a.com']), tags: ['work'] };
    const result = omitTabs(session, [0]);
    expect(result.tags).toEqual(['work']);
  });

  it('throws on invalid session', () => {
    expect(() => omitTabs(null, [0])).toThrow('Invalid session');
    expect(() => omitTabs({ tabs: 'bad' }, [0])).toThrow('Invalid session');
  });
});

describe('formatOmitResult', () => {
  it('formats output correctly', () => {
    const original = makeSession(['https://a.com', 'https://b.com', 'https://c.com']);
    const result = omitTabs(original, [1]);
    const msg = formatOmitResult(original, result, [1]);
    expect(msg).toContain('Omitted 1 tab(s)');
    expect(msg).toContain('https://b.com');
    expect(msg).toContain('Remaining tabs: 2');
  });
});
