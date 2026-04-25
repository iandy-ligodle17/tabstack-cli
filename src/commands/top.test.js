const { topTabs, formatTopResult } = require('./top');

function makeSession(tabs) {
  return { name: 'test', tabs };
}

const sampleTabs = [
  { url: 'https://github.com/foo', title: 'Foo' },
  { url: 'https://github.com/bar', title: 'Bar' },
  { url: 'https://github.com/baz', title: 'Baz' },
  { url: 'https://news.ycombinator.com/item?id=1', title: 'HN 1' },
  { url: 'https://news.ycombinator.com/item?id=2', title: 'HN 2' },
  { url: 'https://example.com/', title: 'Example' },
];

describe('topTabs', () => {
  test('returns top n tabs sorted by domain frequency', () => {
    const session = makeSession(sampleTabs);
    const result = topTabs(session, 3);
    expect(result.tabs).toHaveLength(3);
    // github.com has 3 hits — should appear first
    expect(result.tabs[0].url).toContain('github.com');
  });

  test('dominated field reflects most frequent domain', () => {
    const session = makeSession(sampleTabs);
    const { dominated } = topTabs(session, 5);
    expect(dominated).toBe('github.com');
  });

  test('returns all tabs when n exceeds tab count', () => {
    const session = makeSession(sampleTabs);
    const { tabs } = topTabs(session, 100);
    expect(tabs).toHaveLength(sampleTabs.length);
  });

  test('returns empty tabs for empty session', () => {
    const session = makeSession([]);
    const { tabs, dominated } = topTabs(session, 5);
    expect(tabs).toHaveLength(0);
    expect(dominated).toBe('');
  });

  test('throws on invalid session', () => {
    expect(() => topTabs(null, 5)).toThrow('Invalid session');
    expect(() => topTabs({ name: 'x' }, 5)).toThrow('Invalid session');
  });
});

describe('formatTopResult', () => {
  test('formats result with header and tab lines', () => {
    const session = makeSession(sampleTabs);
    const result = topTabs(session, 3);
    const output = formatTopResult(result, 3);
    expect(output).toContain('Top 3 tab(s)');
    expect(output).toContain('github.com');
    expect(output).toContain('https://github.com/foo');
  });

  test('returns no-tabs message for empty result', () => {
    const output = formatTopResult({ tabs: [], dominated: '' }, 5);
    expect(output).toBe('No tabs found.');
  });
});
