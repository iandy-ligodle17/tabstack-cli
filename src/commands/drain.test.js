const { drainSession, formatDrainResult } = require('./drain');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(tabs = []) {
  return { tabs, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' };
}

beforeEach(() => jest.clearAllMocks());

test('moves all tabs from source to target', async () => {
  const source = makeSession([{ url: 'https://a.com', title: 'A' }]);
  const target = makeSession([{ url: 'https://b.com', title: 'B' }]);
  loadSession.mockImplementation(name => name === 'src' ? source : target);
  saveSession.mockResolvedValue();

  const result = await drainSession('src', 'tgt');

  expect(result.moved).toBe(1);
  expect(result.skipped).toBe(0);
  expect(result.source.tabs).toHaveLength(0);
  expect(result.target.tabs).toHaveLength(2);
  expect(saveSession).toHaveBeenCalledTimes(2);
});

test('skips duplicate URLs already in target', async () => {
  const source = makeSession([
    { url: 'https://a.com', title: 'A' },
    { url: 'https://shared.com', title: 'Shared' },
  ]);
  const target = makeSession([{ url: 'https://shared.com', title: 'Shared' }]);
  loadSession.mockImplementation(name => name === 'src' ? source : target);
  saveSession.mockResolvedValue();

  const result = await drainSession('src', 'tgt');

  expect(result.moved).toBe(2);
  expect(result.skipped).toBe(1);
  expect(result.target.tabs).toHaveLength(2);
});

test('returns early when source is empty', async () => {
  const source = makeSession([]);
  const target = makeSession([{ url: 'https://b.com', title: 'B' }]);
  loadSession.mockImplementation(name => name === 'src' ? source : target);
  saveSession.mockResolvedValue();

  const result = await drainSession('src', 'tgt');

  expect(result.moved).toBe(0);
  expect(saveSession).not.toHaveBeenCalled();
});

test('formatDrainResult returns readable summary', () => {
  const source = makeSession([]);
  const target = makeSession([{ url: 'https://a.com' }, { url: 'https://b.com' }]);
  const output = formatDrainResult({ moved: 3, skipped: 1, source, target });
  expect(output).toMatch('3 tab(s)');
  expect(output).toMatch('1 duplicate(s) skipped');
  expect(output).toMatch('Target now has 2 tab(s)');
});
