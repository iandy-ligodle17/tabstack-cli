/**
 * Integration-style tests for slice: exercises sliceSession with
 * real in-memory data flowing through the full call path.
 */
const { sliceSession } = require('./slice');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(urls) {
  return {
    name: 'base',
    tabs: urls.map((url) => ({ url, title: url })),
    createdAt: '2024-06-01T12:00:00.000Z',
  };
}

beforeEach(() => jest.clearAllMocks());

test('saved session preserves metadata from source', async () => {
  const session = makeSession([
    'https://a.com',
    'https://b.com',
    'https://c.com',
    'https://d.com',
  ]);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  await sliceSession('base', 1, 3, 'out');

  const [savedName, savedData] = saveSession.mock.calls[0];
  expect(savedName).toBe('out');
  expect(savedData.slicedFrom).toBe('base');
  expect(savedData.sliceRange).toEqual([1, 3]);
  expect(savedData.createdAt).toBeDefined();
});

test('full slice (0 to length) produces identical tab list', async () => {
  const session = makeSession(['https://x.com', 'https://y.com']);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await sliceSession('base', 0, 2, 'copy');
  expect(result.count).toBe(2);

  const saved = saveSession.mock.calls[0][1];
  expect(saved.tabs.map((t) => t.url)).toEqual(['https://x.com', 'https://y.com']);
});

test('single tab slice works correctly', async () => {
  const session = makeSession(['https://one.com', 'https://two.com', 'https://three.com']);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await sliceSession('base', 2, 3, 'single');
  expect(result.count).toBe(1);

  const saved = saveSession.mock.calls[0][1];
  expect(saved.tabs[0].url).toBe('https://three.com');
});
