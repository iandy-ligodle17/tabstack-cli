const { flattenSession, formatFlattenResult } = require('./flatten');

function makeSession(tabs, name = 'test') {
  return { name, tabs, metadata: {} };
}

describe('flattenSession', () => {
  it('removes duplicate origins', () => {
    const session = makeSession([
      { url: 'https://example.com/page1', title: 'Page 1' },
      { url: 'https://example.com/page2', title: 'Page 2' },
      { url: 'https://other.com/', title: 'Other' },
    ]);
    const result = flattenSession(session);
    expect(result.tabs).toHaveLength(2);
    expect(result.tabs[0].url).toBe('https://example.com/page1');
    expect(result.tabs[1].url).toBe('https://other.com/');
  });

  it('keeps last tab when keepLast is true', () => {
    const session = makeSession([
      { url: 'https://example.com/page1', title: 'Page 1' },
      { url: 'https://example.com/page2', title: 'Page 2' },
    ]);
    const result = flattenSession(session, { keepLast: true });
    expect(result.tabs).toHaveLength(1);
    expect(result.tabs[0].url).toBe('https://example.com/page2');
  });

  it('deduplicates by full path when dedupePath is true', () => {
    const session = makeSession([
      { url: 'https://example.com/page1', title: 'Page 1' },
      { url: 'https://example.com/page2', title: 'Page 2' },
    ]);
    const result = flattenSession(session, { dedupePath: true });
    expect(result.tabs).toHaveLength(2);
  });

  it('handles invalid URLs gracefully', () => {
    const session = makeSession([
      { url: 'not-a-url', title: 'Bad' },
      { url: 'not-a-url', title: 'Bad Again' },
    ]);
    const result = flattenSession(session);
    expect(result.tabs).toHaveLength(1);
  });

  it('sets metadata on result', () => {
    const session = makeSession([
      { url: 'https://a.com/', title: 'A' },
      { url: 'https://a.com/b', title: 'B' },
    ]);
    const result = flattenSession(session);
    expect(result.metadata.originalCount).toBe(2);
    expect(result.metadata.flattenedCount).toBe(1);
    expect(result.metadata.flattenedAt).toBeDefined();
  });
});

describe('formatFlattenResult', () => {
  it('formats output correctly', () => {
    const original = makeSession([
      { url: 'https://a.com/', title: 'A' },
      { url: 'https://a.com/b', title: 'B' },
    ], 'mysession');
    const flattened = { ...original, tabs: [original.tabs[0]] };
    const output = formatFlattenResult(original, flattened);
    expect(output).toContain('mysession');
    expect(output).toContain('2 tabs');
    expect(output).toContain('1 tabs');
    expect(output).toContain('1 duplicate(s)');
  });
});
