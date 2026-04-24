const { concatSessions, formatConcatResult } = require('./concat');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(name, tabs) {
  return { name, tabs, createdAt: '2024-01-01T00:00:00.000Z', tags: [] };
}

beforeEach(() => jest.clearAllMocks());

test('concatSessions merges tabs in order', async () => {
  loadSession
    .mockResolvedValueOnce(makeSession('a', [{ url: 'https://a.com', title: 'A' }]))
    .mockResolvedValueOnce(makeSession('b', [{ url: 'https://b.com', title: 'B' }]));
  saveSession.mockResolvedValue();

  const result = await concatSessions(['a', 'b'], 'combined');

  expect(result.tabs).toHaveLength(2);
  expect(result.tabs[0].url).toBe('https://a.com');
  expect(result.tabs[1].url).toBe('https://b.com');
  expect(result.name).toBe('combined');
  expect(saveSession).toHaveBeenCalledWith('combined', result);
});

test('concatSessions throws if fewer than 2 sessions given', async () => {
  await expect(concatSessions(['only-one'], 'out')).rejects.toThrow('At least two');
});

test('concatSessions throws if a session is not found', async () => {
  loadSession.mockResolvedValueOnce(null);
  await expect(concatSessions(['missing', 'b'], 'out')).rejects.toThrow('Session not found: missing');
});

test('concatSessions stores meta with source names', async () => {
  loadSession
    .mockResolvedValueOnce(makeSession('x', [{ url: 'https://x.com', title: 'X' }]))
    .mockResolvedValueOnce(makeSession('y', [{ url: 'https://y.com', title: 'Y' }]));
  saveSession.mockResolvedValue();

  const result = await concatSessions(['x', 'y'], 'xy');
  expect(result.meta.concatSources).toEqual(['x', 'y']);
  expect(result.meta.totalSources).toBe(2);
});

test('formatConcatResult returns readable summary', () => {
  const result = { name: 'out', tabs: [{}, {}, {}] };
  const output = formatConcatResult(result, ['s1', 's2']);
  expect(output).toContain('out');
  expect(output).toContain('Total tabs: 3');
  expect(output).toContain('s1');
  expect(output).toContain('s2');
});
