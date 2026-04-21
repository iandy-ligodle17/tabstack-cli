const { compressSession, formatCompressResult } = require('./compress');

function makeSession(tabs, name = 'test') {
  return { name, tabs, createdAt: new Date().toISOString() };
}

describe('compressSession', () => {
  test('removes duplicate URLs', () => {
    const session = makeSession([
      { url: 'https://example.com', title: 'Example' },
      { url: 'https://example.com', title: 'Example Dupe' },
      { url: 'https://other.com', title: 'Other' },
    ]);
    const { session: out, removedCount } = compressSession(session);
    expect(removedCount).toBe(1);
    expect(out.tabs).toHaveLength(2);
  });

  test('removes trailing slashes before deduplication', () => {
    const session = makeSession([
      { url: 'https://example.com/', title: 'A' },
      { url: 'https://example.com', title: 'B' },
    ]);
    const { removedCount } = compressSession(session);
    expect(removedCount).toBe(1);
  });

  test('removes tabs with empty URLs', () => {
    const session = makeSession([
      { url: '', title: 'Empty' },
      { url: 'https://valid.com', title: 'Valid' },
    ]);
    const { session: out, removedCount } = compressSession(session);
    expect(removedCount).toBe(1);
    expect(out.tabs[0].url).toBe('https://valid.com');
  });

  test('trims whitespace from titles', () => {
    const session = makeSession([
      { url: 'https://a.com', title: '  Hello  ' },
    ]);
    const { session: out } = compressSession(session);
    expect(out.tabs[0].title).toBe('Hello');
  });

  test('returns zero removedCount when nothing to clean', () => {
    const session = makeSession([
      { url: 'https://a.com', title: 'A' },
      { url: 'https://b.com', title: 'B' },
    ]);
    const { removedCount } = compressSession(session);
    expect(removedCount).toBe(0);
  });
});

describe('formatCompressResult', () => {
  test('reports clean session when nothing removed', () => {
    const session = makeSession([{ url: 'https://a.com', title: 'A' }]);
    const msg = formatCompressResult({ originalCount: 1, removedCount: 0, session });
    expect(msg).toContain('already clean');
  });

  test('reports removed count', () => {
    const session = makeSession([], 'work');
    const msg = formatCompressResult({ originalCount: 5, removedCount: 2, session });
    expect(msg).toContain('5 →');
    expect(msg).toContain('removed 2');
  });
});
