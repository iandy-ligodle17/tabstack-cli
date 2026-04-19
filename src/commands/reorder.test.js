const { reorderTabs, parseIndices } = require('./reorder');

const makeSession = (urls) => ({
  name: 'test',
  tabs: urls.map(url => ({ url, title: url }))
});

describe('parseIndices', () => {
  test('parses comma-separated indices', () => {
    expect(parseIndices('0,2,1')).toEqual([0, 2, 1]);
  });

  test('handles spaces', () => {
    expect(parseIndices('1, 3, 0')).toEqual([1, 3, 0]);
  });

  test('throws on invalid input', () => {
    expect(() => parseIndices('0,abc')).toThrow('Invalid index');
  });
});

describe('reorderTabs', () => {
  test('moves specified indices to front', () => {
    const session = makeSession(['a', 'b', 'c', 'd']);
    const result = reorderTabs(session, [2, 0]);
    expect(result.tabs.map(t => t.url)).toEqual(['c', 'a', 'b', 'd']);
  });

  test('preserves all tabs', () => {
    const session = makeSession(['a', 'b', 'c']);
    const result = reorderTabs(session, [1]);
    expect(result.tabs).toHaveLength(3);
  });

  test('throws on out-of-range index', () => {
    const session = makeSession(['a', 'b']);
    expect(() => reorderTabs(session, [5])).toThrow('out of range');
  });

  test('does not mutate original session', () => {
    const session = makeSession(['a', 'b', 'c']);
    reorderTabs(session, [2, 0]);
    expect(session.tabs[0].url).toBe('a');
  });
});
