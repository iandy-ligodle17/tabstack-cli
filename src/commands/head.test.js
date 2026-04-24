const { headSession, formatHeadResult } = require('./head');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(tabCount) {
  return {
    name: 'test',
    createdAt: '2024-01-01T00:00:00.000Z',
    tabs: Array.from({ length: tabCount }, (_, i) => ({
      url: `https://example.com/page${i + 1}`,
      title: `Page ${i + 1}`,
    })),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('returns first N tabs', async () => {
  loadSession.mockResolvedValue(makeSession(5));
  const result = await headSession('test', 3);
  expect(result.tabs).toHaveLength(3);
  expect(result.tabs[0].title).toBe('Page 1');
  expect(result.tabs[2].title).toBe('Page 3');
});

test('returns all tabs when count exceeds total', async () => {
  loadSession.mockResolvedValue(makeSession(3));
  const result = await headSession('test', 10);
  expect(result.tabs).toHaveLength(3);
});

test('saves to output session when option provided', async () => {
  loadSession.mockResolvedValue(makeSession(5));
  saveSession.mockResolvedValue();
  await headSession('test', 2, { output: 'head-out' });
  expect(saveSession).toHaveBeenCalledWith('head-out', expect.objectContaining({ tabs: expect.any(Array) }));
});

test('does not save when no output option', async () => {
  loadSession.mockResolvedValue(makeSession(5));
  await headSession('test', 2);
  expect(saveSession).not.toHaveBeenCalled();
});

test('throws on invalid count', async () => {
  loadSession.mockResolvedValue(makeSession(5));
  await expect(headSession('test', 0)).rejects.toThrow('positive integer');
});

test('throws when session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(headSession('missing', 3)).rejects.toThrow('not found');
});

test('formatHeadResult formats output correctly', () => {
  const session = makeSession(3);
  const output = formatHeadResult(session, 5, 3, null);
  expect(output).toContain('Showing first 3 of 5 tab(s)');
  expect(output).toContain('Page 1');
  expect(output).toContain('Page 3');
});

test('formatHeadResult mentions output name when provided', () => {
  const session = makeSession(2);
  const output = formatHeadResult(session, 5, 2, 'my-head');
  expect(output).toContain('Saved to session "my-head"');
});
