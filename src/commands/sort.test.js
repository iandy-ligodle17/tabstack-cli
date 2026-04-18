const { sortSession, extractDomain } = require('./sort');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com/foo', title: 'GitHub Foo' },
    { url: 'https://apple.com/news', title: 'Apple News' },
    { url: 'https://zoominfo.com', title: 'ZoomInfo' },
    { url: 'https://apple.com/store', title: 'Apple Store' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockResolvedValue(JSON.parse(JSON.stringify(mockSession)));
  saveSession.mockResolvedValue();
});

test('sorts tabs by url by default', async () => {
  const result = await sortSession('work');
  const urls = result.tabs.map(t => t.url);
  expect(urls).toEqual([...urls].sort());
});

test('sorts tabs by title', async () => {
  const result = await sortSession('work', 'title');
  const titles = result.tabs.map(t => t.title);
  expect(titles[0]).toBe('Apple News');
  expect(titles[1]).toBe('Apple Store');
});

test('sorts tabs by domain', async () => {
  const result = await sortSession('work', 'domain');
  const domains = result.tabs.map(t => extractDomain(t.url));
  expect(domains[0]).toBe('apple.com');
  expect(domains[1]).toBe('apple.com');
  expect(domains[2]).toBe('github.com');
});

test('throws on invalid sort field', async () => {
  await expect(sortSession('work', 'invalid')).rejects.toThrow('Invalid sort field');
});

test('calls saveSession with sorted result', async () => {
  await sortSession('work', 'title');
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ name: 'work' }));
});

test('extractDomain handles invalid url gracefully', () => {
  expect(extractDomain('not-a-url')).toBe('not-a-url');
});
