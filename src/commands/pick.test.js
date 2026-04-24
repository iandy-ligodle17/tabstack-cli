const { pickTabs, formatPickResult } = require('./pick');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(name, urls) {
  return {
    name,
    tabs: urls.map(url => ({ url, title: url })),
    createdAt: '2024-01-01T00:00:00.000Z',
  };
}

beforeEach(() => jest.clearAllMocks());

test('picks specified tabs by index', async () => {
  const session = makeSession('work', [
    'https://a.com',
    'https://b.com',
    'https://c.com',
    'https://d.com',
  ]);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await pickTabs('work', [0, 2], 'subset');

  expect(result.count).toBe(2);
  expect(result.picked[0].url).toBe('https://a.com');
  expect(result.picked[1].url).toBe('https://c.com');
  expect(result.dest).toBe('subset');
  expect(saveSession).toHaveBeenCalledWith('subset', expect.objectContaining({
    name: 'subset',
    pickedFrom: 'work',
    tabs: result.picked,
  }));
});

test('deduplicates repeated indices', async () => {
  const session = makeSession('s', ['https://x.com', 'https://y.com']);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await pickTabs('s', [1, 1, 0], 'out');
  expect(result.count).toBe(2);
});

test('throws on out-of-range index', async () => {
  const session = makeSession('s', ['https://x.com']);
  loadSession.mockResolvedValue(session);

  await expect(pickTabs('s', [5], 'out')).rejects.toThrow('Index out of range: 5');
});

test('throws when session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(pickTabs('ghost', [0], 'out')).rejects.toThrow('not found or invalid');
});

test('formatPickResult returns readable output', () => {
  const result = {
    source: 'work',
    dest: 'subset',
    picked: [{ url: 'https://a.com', title: 'A' }, { url: 'https://b.com', title: 'B' }],
    count: 2,
  };
  const out = formatPickResult(result);
  expect(out).toContain('Picked 2 tab(s)');
  expect(out).toContain('work');
  expect(out).toContain('subset');
  expect(out).toContain('[0] A');
  expect(out).toContain('[1] B');
});
