const { truncateSession, formatTruncateResult } = require('./truncate');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const makeSession = (n) => ({
  name: 'test',
  tabs: Array.from({ length: n }, (_, i) => ({
    url: `https://example.com/${i}`,
    title: `Tab ${i}`,
  })),
  createdAt: '2024-01-01T00:00:00.000Z',
});

beforeEach(() => jest.clearAllMocks());

test('truncates from end by default', async () => {
  loadSession.mockResolvedValue(makeSession(10));
  saveSession.mockResolvedValue();

  const result = await truncateSession('test', 5);

  expect(result.truncated).toBe(true);
  expect(result.originalCount).toBe(10);
  expect(result.newCount).toBe(5);
  expect(result.removed).toBe(5);
  expect(result.session.tabs[0].url).toBe('https://example.com/0');
  expect(saveSession).toHaveBeenCalledTimes(1);
});

test('truncates from start when option provided', async () => {
  loadSession.mockResolvedValue(makeSession(10));
  saveSession.mockResolvedValue();

  const result = await truncateSession('test', 4, { from: 'start' });

  expect(result.truncated).toBe(true);
  expect(result.newCount).toBe(4);
  expect(result.session.tabs[0].url).toBe('https://example.com/6');
});

test('does nothing when tab count is within limit', async () => {
  loadSession.mockResolvedValue(makeSession(3));

  const result = await truncateSession('test', 10);

  expect(result.truncated).toBe(false);
  expect(result.removed).toBe(0);
  expect(saveSession).not.toHaveBeenCalled();
});

test('throws on invalid maxTabs', async () => {
  await expect(truncateSession('test', 0)).rejects.toThrow('positive integer');
  await expect(truncateSession('test', -3)).rejects.toThrow('positive integer');
  await expect(truncateSession('test', 1.5)).rejects.toThrow('positive integer');
});

test('throws when session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(truncateSession('missing', 5)).rejects.toThrow('not found or invalid');
});

test('formatTruncateResult — truncated', () => {
  const msg = formatTruncateResult(
    { truncated: true, originalCount: 10, newCount: 5, removed: 5 },
    'work'
  );
  expect(msg).toContain('work');
  expect(msg).toContain('10 → 5');
  expect(msg).toContain('removed 5');
});

test('formatTruncateResult — not truncated', () => {
  const msg = formatTruncateResult(
    { truncated: false, originalCount: 3 },
    'work'
  );
  expect(msg).toContain('nothing to truncate');
});
