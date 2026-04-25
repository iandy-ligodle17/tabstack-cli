const { bookmarkTab, removeBookmark, getBookmarks, formatBookmarks } = require('./bookmark');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(tabs = [], bookmarks = {}) {
  return { tabs, bookmarks, createdAt: new Date().toISOString() };
}

beforeEach(() => jest.clearAllMocks());

test('bookmarkTab adds a bookmark with label', () => {
  const session = makeSession([
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://other.com', title: 'Other' }
  ]);
  loadSession.mockReturnValue(session);
  const result = bookmarkTab('work', 0, 'My Bookmark');
  expect(result.label).toBe('My Bookmark');
  expect(result.url).toBe('https://example.com');
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ bookmarks: expect.any(Object) }));
});

test('bookmarkTab uses title as default label', () => {
  const session = makeSession([{ url: 'https://example.com', title: 'Example' }]);
  loadSession.mockReturnValue(session);
  const result = bookmarkTab('work', 0);
  expect(result.label).toBe('Example');
});

test('bookmarkTab throws on out-of-range index', () => {
  loadSession.mockReturnValue(makeSession([{ url: 'https://a.com' }]));
  expect(() => bookmarkTab('work', 5)).toThrow('out of range');
});

test('removeBookmark removes existing bookmark', () => {
  const session = makeSession(
    [{ url: 'https://example.com', title: 'Example' }],
    { 0: { label: 'Ex', url: 'https://example.com', addedAt: '2024-01-01' } }
  );
  loadSession.mockReturnValue(session);
  const removed = removeBookmark('work', 0);
  expect(removed.label).toBe('Ex');
  expect(saveSession).toHaveBeenCalled();
});

test('removeBookmark throws when no bookmark at index', () => {
  loadSession.mockReturnValue(makeSession([{ url: 'https://a.com' }], {}));
  expect(() => removeBookmark('work', 0)).toThrow('No bookmark');
});

test('getBookmarks returns empty object when none set', () => {
  loadSession.mockReturnValue(makeSession([{ url: 'https://a.com' }]));
  expect(getBookmarks('work')).toEqual({});
});

test('formatBookmarks returns no-bookmarks message for empty', () => {
  expect(formatBookmarks({}, [])).toBe('No bookmarks.');
});

test('formatBookmarks formats entries correctly', () => {
  const bm = { 1: { label: 'Test', url: 'https://test.com', addedAt: '2024-01-01T00:00:00.000Z' } };
  const out = formatBookmarks(bm, []);
  expect(out).toContain('[1]');
  expect(out).toContain('Test');
  expect(out).toContain('https://test.com');
});
