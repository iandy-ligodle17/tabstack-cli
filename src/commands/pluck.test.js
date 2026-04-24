const { pluckTabs, formatPluckResult } = require('./pluck');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(tabs) {
  return { name: 'src', tabs, createdAt: '2024-01-01T00:00:00.000Z' };
}

beforeEach(() => jest.clearAllMocks());

test('plucks selected tabs into new session', async () => {
  const session = makeSession([
    { url: 'https://a.com', title: 'A' },
    { url: 'https://b.com', title: 'B' },
    { url: 'https://c.com', title: 'C' },
  ]);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await pluckTabs('src', [0, 2], 'dest');

  expect(result.plucked).toHaveLength(2);
  expect(result.plucked[0].url).toBe('https://a.com');
  expect(result.plucked[1].url).toBe('https://c.com');
  expect(result.destName).toBe('dest');
  expect(saveSession).toHaveBeenCalledWith('dest', expect.objectContaining({
    name: 'dest',
    pluckedFrom: 'src',
  }));
});

test('deduplicates repeated indices', async () => {
  const session = makeSession([
    { url: 'https://a.com', title: 'A' },
    { url: 'https://b.com', title: 'B' },
  ]);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await pluckTabs('src', [1, 1, 1], 'dest');
  expect(result.plucked).toHaveLength(1);
});

test('throws on out-of-range index', async () => {
  loadSession.mockResolvedValue(makeSession([{ url: 'https://a.com' }]));
  await expect(pluckTabs('src', [5], 'dest')).rejects.toThrow('out of range');
});

test('throws when session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(pluckTabs('missing', [0], 'dest')).rejects.toThrow('not found');
});

test('formatPluckResult returns readable output', () => {
  const result = {
    plucked: [{ url: 'https://a.com', title: 'A' }, { url: 'https://b.com', title: 'B' }],
    destName: 'my-dest',
    sourceSession: 'my-src',
  };
  const output = formatPluckResult(result);
  expect(output).toContain('2 tab(s)');
  expect(output).toContain('my-src');
  expect(output).toContain('my-dest');
  expect(output).toContain('A');
  expect(output).toContain('B');
});
