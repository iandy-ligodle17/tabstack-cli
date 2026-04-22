const { reverseTabs, formatReverseResult } = require('./reverse');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(overrides = {}) {
  return {
    name: 'test',
    tabs: [
      { url: 'https://a.com', title: 'A' },
      { url: 'https://b.com', title: 'B' },
      { url: 'https://c.com', title: 'C' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('reverses tabs in place', async () => {
  const session = makeSession();
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await reverseTabs('test');

  expect(result.tabCount).toBe(3);
  expect(result.sessionName).toBe('test');
  expect(result.inPlace).toBe(true);

  const saved = saveSession.mock.calls[0][1];
  expect(saved.tabs[0].url).toBe('https://c.com');
  expect(saved.tabs[2].url).toBe('https://a.com');
});

test('saves reversed session to new name when output option provided', async () => {
  const session = makeSession();
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await reverseTabs('test', { output: 'test-reversed' });

  expect(result.sessionName).toBe('test-reversed');
  expect(result.inPlace).toBe(false);
  expect(saveSession.mock.calls[0][0]).toBe('test-reversed');
});

test('throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(reverseTabs('missing')).rejects.toThrow('Session "missing" not found');
});

test('throws if session has no tabs', async () => {
  loadSession.mockResolvedValue(makeSession({ tabs: [] }));
  await expect(reverseTabs('test')).rejects.toThrow('has no tabs to reverse');
});

test('formatReverseResult in place', () => {
  const out = formatReverseResult({ sessionName: 'work', tabCount: 5, inPlace: true });
  expect(out).toContain('5 tab(s)');
  expect(out).toContain('work');
});

test('formatReverseResult with output name', () => {
  const out = formatReverseResult({ sessionName: 'work-rev', tabCount: 3, inPlace: false });
  expect(out).toContain('work-rev');
  expect(out).toContain('Saved reversed session');
});
