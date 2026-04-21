const { chunkSession, formatChunkResult } = require('./chunk');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(tabCount) {
  return {
    name: 'test',
    createdAt: '2024-01-01T00:00:00.000Z',
    tabs: Array.from({ length: tabCount }, (_, i) => ({
      url: `https://example.com/${i + 1}`,
      title: `Tab ${i + 1}`,
    })),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  saveSession.mockResolvedValue(undefined);
});

test('splits session into correct number of chunks', async () => {
  loadSession.mockResolvedValue(makeSession(7));
  const created = await chunkSession('test', 3);
  expect(created).toHaveLength(3);
  expect(created).toEqual(['test-chunk-1', 'test-chunk-2', 'test-chunk-3']);
});

test('each chunk has correct tab count', async () => {
  loadSession.mockResolvedValue(makeSession(7));
  await chunkSession('test', 3);
  const calls = saveSession.mock.calls;
  expect(calls[0][1].tabs).toHaveLength(3);
  expect(calls[1][1].tabs).toHaveLength(3);
  expect(calls[2][1].tabs).toHaveLength(1);
});

test('respects custom prefix option', async () => {
  loadSession.mockResolvedValue(makeSession(4));
  const created = await chunkSession('test', 2, { prefix: 'work-part' });
  expect(created[0]).toBe('work-part-1');
  expect(created[1]).toBe('work-part-2');
});

test('throws on invalid chunk size', async () => {
  await expect(chunkSession('test', 0)).rejects.toThrow('positive integer');
  await expect(chunkSession('test', -1)).rejects.toThrow('positive integer');
  await expect(chunkSession('test', 1.5)).rejects.toThrow('positive integer');
});

test('throws when session has no tabs', async () => {
  loadSession.mockResolvedValue({ name: 'empty', tabs: [] });
  await expect(chunkSession('empty', 3)).rejects.toThrow('no tabs');
});

test('stores chunkedFrom metadata on each chunk', async () => {
  loadSession.mockResolvedValue(makeSession(4));
  await chunkSession('mySession', 2);
  const saved = saveSession.mock.calls[0][1];
  expect(saved.meta.chunkedFrom).toBe('mySession');
  expect(saved.meta.totalChunks).toBe(2);
});

test('formatChunkResult returns readable output', () => {
  const result = formatChunkResult(['work-1', 'work-2'], 'work', 5);
  expect(result).toContain('work');
  expect(result).toContain('work-1');
  expect(result).toContain('work-2');
  expect(result).toContain('2 session(s)');
});
