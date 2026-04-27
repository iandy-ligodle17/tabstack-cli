const { limitSession, formatLimitResult } = require('./limit');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(n) {
  return {
    name: 'test',
    tabs: Array.from({ length: n }, (_, i) => ({
      url: `https://example.com/page${i + 1}`,
      title: `Page ${i + 1}`,
    })),
  };
}

beforeEach(() => jest.clearAllMocks());

test('does nothing when already within limit', async () => {
  loadSession.mockResolvedValue(makeSession(3));
  const result = await limitSession('test', 5);
  expect(result.changed).toBe(false);
  expect(result.kept).toBe(3);
  expect(saveSession).not.toHaveBeenCalled();
});

test('trims tabs from the end by default', async () => {
  loadSession.mockResolvedValue(makeSession(6));
  const result = await limitSession('test', 4);
  expect(result.kept).toBe(4);
  expect(result.removed).toBe(2);
  expect(result.tabs[0].url).toBe('https://example.com/page1');
  expect(saveSession).toHaveBeenCalled();
});

test('trims tabs from the start when fromStart=true', async () => {
  loadSession.mockResolvedValue(makeSession(6));
  const result = await limitSession('test', 4, { fromStart: true });
  expect(result.kept).toBe(4);
  expect(result.tabs[0].url).toBe('https://example.com/page3');
});

test('dry run does not save', async () => {
  loadSession.mockResolvedValue(makeSession(5));
  const result = await limitSession('test', 2, { dryRun: true });
  expect(result.removed).toBe(3);
  expect(saveSession).not.toHaveBeenCalled();
});

test('throws on invalid max', async () => {
  await expect(limitSession('test', 0)).rejects.toThrow('positive integer');
  await expect(limitSession('test', -1)).rejects.toThrow('positive integer');
  await expect(limitSession('test', 1.5)).rejects.toThrow('positive integer');
});

test('formatLimitResult unchanged', () => {
  const out = formatLimitResult({ name: 'work', original: 3, kept: 3, removed: 0, changed: false });
  expect(out).toMatch('within limit');
});

test('formatLimitResult changed', () => {
  const out = formatLimitResult({ name: 'work', original: 8, kept: 5, removed: 3, changed: true });
  expect(out).toMatch('Removed: 3');
  expect(out).toMatch('After  : 5');
});
