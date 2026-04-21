const { intersectSessions, normalizeUrl, formatIntersect } = require('./intersect');
const storage = require('../storage');

jest.mock('../storage');

const sessionA = {
  tabs: [
    { url: 'https://github.com/foo', title: 'GitHub Foo' },
    { url: 'https://example.com/', title: 'Example' },
    { url: 'https://news.ycombinator.com', title: 'HN' },
  ],
};

const sessionB = {
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://news.ycombinator.com/', title: 'HN' },
    { url: 'https://wikipedia.org', title: 'Wiki' },
  ],
};

beforeEach(() => jest.clearAllMocks());

test('finds common tabs between two sessions', async () => {
  storage.loadSession
    .mockResolvedValueOnce(sessionA)
    .mockResolvedValueOnce(sessionB);

  const result = await intersectSessions(['a', 'b']);
  expect(result.tabs).toHaveLength(2);
  expect(result.sources).toEqual(['a', 'b']);
});

test('returns empty when no common tabs', async () => {
  storage.loadSession
    .mockResolvedValueOnce({ tabs: [{ url: 'https://foo.com', title: 'Foo' }] })
    .mockResolvedValueOnce({ tabs: [{ url: 'https://bar.com', title: 'Bar' }] });

  const result = await intersectSessions(['x', 'y']);
  expect(result.tabs).toHaveLength(0);
});

test('throws if fewer than two sessions given', async () => {
  await expect(intersectSessions(['only-one'])).rejects.toThrow('At least two');
});

test('throws if a session is not found', async () => {
  storage.loadSession.mockResolvedValueOnce(null);
  await expect(intersectSessions(['missing', 'b'])).rejects.toThrow('Session not found: missing');
});

test('normalizeUrl strips trailing slash and protocol', () => {
  expect(normalizeUrl('https://example.com/')).toBe('example.com');
  expect(normalizeUrl('https://example.com/path/')).toBe('example.com/path');
});

test('formatIntersect formats output correctly', () => {
  const result = {
    tabs: [{ url: 'https://example.com', title: 'Example' }],
    sources: ['a', 'b'],
  };
  const out = formatIntersect(result);
  expect(out).toContain('Intersection of: a, b');
  expect(out).toContain('Common tabs: 1');
  expect(out).toContain('Example');
});

test('formatIntersect handles empty result', () => {
  const out = formatIntersect({ tabs: [], sources: ['a', 'b'] });
  expect(out).toContain('no common tabs found');
});
