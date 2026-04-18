const { trimSession } = require('./trim');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com/foo', title: 'GitHub' },
    { url: 'https://youtube.com/watch?v=1', title: 'YouTube Video' },
    { url: 'https://docs.example.com', title: 'Docs' },
    { url: 'https://youtube.com/watch?v=2', title: 'Another Video' },
    { url: 'https://news.ycombinator.com', title: 'HN' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockResolvedValue(mockSession);
  saveSession.mockResolvedValue();
});

test('trims tabs matching a pattern', async () => {
  const result = await trimSession('work', { pattern: 'youtube' });
  expect(result.removedCount).toBe(2);
  expect(result.newCount).toBe(3);
  const saved = saveSession.mock.calls[0][1];
  expect(saved.tabs.every(t => !t.url.includes('youtube'))).toBe(true);
});

test('trims tabs beyond maxTabs', async () => {
  const result = await trimSession('work', { maxTabs: 3 });
  expect(result.newCount).toBe(3);
  expect(result.removedCount).toBe(2);
});

test('applies pattern then maxTabs', async () => {
  const result = await trimSession('work', { pattern: 'youtube', maxTabs: 2 });
  expect(result.newCount).toBe(2);
});

test('throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(trimSession('missing')).rejects.toThrow('Session "missing" not found');
});

test('returns original count unchanged when no options match', async () => {
  const result = await trimSession('work', { pattern: 'nonexistent' });
  expect(result.removedCount).toBe(0);
  expect(result.newCount).toBe(5);
});
