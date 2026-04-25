const { pinDomain, formatPinDomainResult } = require('./pin-domain');
const storage = require('../storage');

jest.mock('../storage');

function makeSession(tabs) {
  return { name: 'test', createdAt: Date.now(), tabs };
}

beforeEach(() => jest.clearAllMocks());

test('pins matching domain tabs to the front', async () => {
  storage.loadSession.mockResolvedValue(makeSession([
    { url: 'https://news.ycombinator.com/item?id=1', title: 'HN 1' },
    { url: 'https://github.com/user/repo', title: 'GitHub' },
    { url: 'https://www.ycombinator.com/', title: 'YC' },
  ]));
  storage.saveSession.mockResolvedValue();

  const result = await pinDomain('test', 'ycombinator.com');
  expect(result.pinned).toBe(2);
  expect(result.total).toBe(3);

  const saved = storage.saveSession.mock.calls[0][1];
  expect(saved.tabs[0].url).toContain('ycombinator.com');
  expect(saved.tabs[1].url).toContain('ycombinator.com');
  expect(saved.tabs[2].url).toContain('github.com');
});

test('marks pinned tabs with pinnedDomain flag', async () => {
  storage.loadSession.mockResolvedValue(makeSession([
    { url: 'https://example.com/page', title: 'Example' },
    { url: 'https://other.com/', title: 'Other' },
  ]));
  storage.saveSession.mockResolvedValue();

  await pinDomain('test', 'example.com');
  const saved = storage.saveSession.mock.calls[0][1];
  expect(saved.tabs[0].pinnedDomain).toBe(true);
  expect(saved.tabs[1].pinnedDomain).toBeUndefined();
});

test('throws if no tabs match domain', async () => {
  storage.loadSession.mockResolvedValue(makeSession([
    { url: 'https://github.com/', title: 'GitHub' },
  ]));

  await expect(pinDomain('test', 'notfound.io')).rejects.toThrow('No tabs found matching domain');
});

test('throws if session not found', async () => {
  storage.loadSession.mockResolvedValue(null);
  await expect(pinDomain('missing', 'example.com')).rejects.toThrow('not found');
});

test('formatPinDomainResult returns readable string', () => {
  const msg = formatPinDomainResult({ pinned: 3, total: 10, domain: 'github.com' });
  expect(msg).toContain('3');
  expect(msg).toContain('github.com');
  expect(msg).toContain('10');
});
