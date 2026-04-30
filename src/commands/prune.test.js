const { pruneTabs, formatPruneResult } = require('./prune');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(tabs) {
  return {
    name: 'test',
    createdAt: '2024-01-01T00:00:00.000Z',
    tabs,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('removes tabs matching the pattern', async () => {
  loadSession.mockResolvedValue(makeSession([
    { url: 'https://github.com/foo', title: 'GitHub' },
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://github.com/bar', title: 'Another GitHub' },
  ]));

  const result = await pruneTabs('test', 'github.com');

  expect(result.removed).toHaveLength(2);
  expect(result.remaining).toBe(1);
  expect(saveSession).toHaveBeenCalledWith('test', expect.objectContaining({
    tabs: [{ url: 'https://example.com', title: 'Example' }],
  }));
});

test('returns empty removed list when no tabs match', async () => {
  loadSession.mockResolvedValue(makeSession([
    { url: 'https://example.com', title: 'Example' },
  ]));

  const result = await pruneTabs('test', 'github.com');

  expect(result.removed).toHaveLength(0);
  expect(result.remaining).toBe(1);
  expect(saveSession).not.toHaveBeenCalled();
});

test('dry-run does not persist changes', async () => {
  loadSession.mockResolvedValue(makeSession([
    { url: 'https://ads.example.com', title: 'Ad' },
    { url: 'https://clean.com', title: 'Clean' },
  ]));

  const result = await pruneTabs('test', 'ads.example.com', { dryRun: true });

  expect(result.removed).toHaveLength(1);
  expect(saveSession).not.toHaveBeenCalled();
});

test('throws when pattern is empty', async () => {
  await expect(pruneTabs('test', '')).rejects.toThrow('pattern is required');
});

test('formatPruneResult with removals', () => {
  const out = formatPruneResult({ removed: ['https://a.com', 'https://b.com'], remaining: 3, dryRun: false });
  expect(out).toMatch('Removed 2 tab(s)');
  expect(out).toMatch('https://a.com');
  expect(out).toMatch('Remaining tabs: 3');
});

test('formatPruneResult with no matches', () => {
  const out = formatPruneResult({ removed: [], remaining: 5, dryRun: false });
  expect(out).toMatch('Nothing pruned');
});

test('formatPruneResult dry-run label', () => {
  const out = formatPruneResult({ removed: ['https://x.com'], remaining: 2, dryRun: true });
  expect(out).toMatch('[dry-run]');
});
