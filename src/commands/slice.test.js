const { sliceSession, formatSliceResult } = require('./slice');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(n) {
  return {
    name: 'work',
    tabs: Array.from({ length: n }, (_, i) => ({
      url: `https://example.com/${i}`,
      title: `Tab ${i}`,
    })),
    createdAt: '2024-01-01T00:00:00.000Z',
  };
}

beforeEach(() => jest.clearAllMocks());

test('slices a range from a session', async () => {
  loadSession.mockResolvedValue(makeSession(6));
  saveSession.mockResolvedValue();

  const result = await sliceSession('work', 1, 4, 'work-part');

  expect(result.count).toBe(3);
  expect(result.dest).toBe('work-part');
  expect(result.start).toBe(1);
  expect(result.end).toBe(4);

  const saved = saveSession.mock.calls[0][1];
  expect(saved.tabs).toHaveLength(3);
  expect(saved.tabs[0].url).toBe('https://example.com/1');
});

test('uses default dest name when not provided', async () => {
  loadSession.mockResolvedValue(makeSession(5));
  saveSession.mockResolvedValue();

  const result = await sliceSession('work', 0, 2);
  expect(result.dest).toBe('work-slice');
});

test('clamps end index to tab length', async () => {
  loadSession.mockResolvedValue(makeSession(4));
  saveSession.mockResolvedValue();

  const result = await sliceSession('work', 2, 99, 'out');
  expect(result.count).toBe(2);
  expect(result.end).toBe(4);
});

test('throws on invalid start index', async () => {
  loadSession.mockResolvedValue(makeSession(3));
  await expect(sliceSession('work', 5, 6)).rejects.toThrow('out of range');
});

test('throws when end <= start', async () => {
  loadSession.mockResolvedValue(makeSession(5));
  await expect(sliceSession('work', 3, 2)).rejects.toThrow('greater than start');
});

test('formatSliceResult returns readable string', () => {
  const result = { source: 'work', dest: 'work-slice', start: 0, end: 3, count: 3 };
  const out = formatSliceResult(result);
  expect(out).toContain('work');
  expect(out).toContain('3 tab(s)');
});
