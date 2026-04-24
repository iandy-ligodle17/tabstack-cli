const { tailSession, formatTailResult } = require('./tail');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(n) {
  return {
    name: 'test',
    tabs: Array.from({ length: n }, (_, i) => ({
      url: `https://example.com/page${i + 1}`,
      title: `Page ${i + 1}`
    })),
    createdAt: '2024-01-01T00:00:00.000Z'
  };
}

beforeEach(() => jest.clearAllMocks());

test('returns last N tabs', async () => {
  loadSession.mockResolvedValue(makeSession(5));
  const result = await tailSession('test', 3);
  expect(result.session.tabs).toHaveLength(3);
  expect(result.session.tabs[0].title).toBe('Page 3');
  expect(result.session.tabs[2].title).toBe('Page 5');
  expect(result.originalCount).toBe(5);
  expect(result.changed).toBe(true);
});

test('does not mutate when count >= total tabs', async () => {
  loadSession.mockResolvedValue(makeSession(3));
  const result = await tailSession('test', 5);
  expect(result.changed).toBe(false);
  expect(result.session.tabs).toHaveLength(3);
});

test('saves session when save option is true', async () => {
  loadSession.mockResolvedValue(makeSession(6));
  saveSession.mockResolvedValue();
  await tailSession('test', 2, { save: true });
  expect(saveSession).toHaveBeenCalledWith('test', expect.objectContaining({
    tabs: expect.arrayContaining([expect.objectContaining({ title: 'Page 5' })])
  }));
});

test('does not save when save option is false', async () => {
  loadSession.mockResolvedValue(makeSession(4));
  await tailSession('test', 2);
  expect(saveSession).not.toHaveBeenCalled();
});

test('throws on invalid count', async () => {
  await expect(tailSession('test', 0)).rejects.toThrow('positive integer');
  await expect(tailSession('test', -1)).rejects.toThrow('positive integer');
  await expect(tailSession('test', 1.5)).rejects.toThrow('positive integer');
});

test('throws when session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(tailSession('ghost', 3)).rejects.toThrow('not found');
});

test('formatTailResult includes summary info', () => {
  const session = makeSession(3);
  session.name = 'mysession';
  const output = formatTailResult(session, 3, 6);
  expect(output).toContain('mysession');
  expect(output).toContain('Original tabs: 6');
  expect(output).toContain('Removed: 3');
});
