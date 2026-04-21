const { splitSession, formatSplitResult } = require('./split');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(name, count) {
  return {
    name,
    tabs: Array.from({ length: count }, (_, i) => ({
      title: `Tab ${i + 1}`,
      url: `https://site${i + 1}.com/page`,
    })),
    createdAt: '2024-01-01T00:00:00.000Z',
  };
}

beforeEach(() => jest.clearAllMocks());

test('splits session into parts by size', async () => {
  loadSession.mockResolvedValue(makeSession('work', 25));
  saveSession.mockResolvedValue();

  const result = await splitSession('work', { size: 10 });

  expect(result).toEqual(['work-part1', 'work-part2', 'work-part3']);
  expect(saveSession).toHaveBeenCalledTimes(3);
  const firstCall = saveSession.mock.calls[0];
  expect(firstCall[0]).toBe('work-part1');
  expect(firstCall[1].tabs).toHaveLength(10);
});

test('splits session by domain', async () => {
  const session = {
    name: 'mixed',
    tabs: [
      { title: 'GH 1', url: 'https://github.com/a' },
      { title: 'GH 2', url: 'https://github.com/b' },
      { title: 'MDN', url: 'https://developer.mozilla.org/docs' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
  };
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await splitSession('mixed', { byDomain: true });

  expect(result).toContain('mixed-github.com');
  expect(result).toContain('mixed-developer.mozilla.org');
  expect(saveSession).toHaveBeenCalledTimes(2);
});

test('throws if session has no tabs', async () => {
  loadSession.mockResolvedValue({ name: 'empty', tabs: [] });
  await expect(splitSession('empty', { size: 5 })).rejects.toThrow('no tabs');
});

test('uses default chunk size of 10', async () => {
  loadSession.mockResolvedValue(makeSession('big', 15));
  saveSession.mockResolvedValue();

  const result = await splitSession('big', {});
  expect(result).toHaveLength(2);
});

test('formatSplitResult returns readable output', () => {
  const out = formatSplitResult('work', ['work-part1', 'work-part2']);
  expect(out).toContain('Split "work" into 2 session(s)');
  expect(out).toContain('work-part1');
  expect(out).toContain('work-part2');
});
