const { splitIntoWindows, getWindow, assignWindows, formatWindowResult } = require('./window');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(urls) {
  return {
    tabs: urls.map(url => ({ url, title: url }))
  };
}

beforeEach(() => jest.clearAllMocks());

test('splitIntoWindows divides tabs evenly', async () => {
  loadSession.mockResolvedValue(makeSession(['a', 'b', 'c', 'd']));
  const windows = await splitIntoWindows('work', 2);
  expect(windows).toHaveLength(2);
  expect(windows[0]).toHaveLength(2);
  expect(windows[1]).toHaveLength(2);
});

test('splitIntoWindows handles remainder', async () => {
  loadSession.mockResolvedValue(makeSession(['a', 'b', 'c', 'd', 'e']));
  const windows = await splitIntoWindows('work', 2);
  expect(windows).toHaveLength(3);
  expect(windows[2]).toHaveLength(1);
});

test('splitIntoWindows throws on windowSize < 1', async () => {
  loadSession.mockResolvedValue(makeSession(['a']));
  await expect(splitIntoWindows('work', 0)).rejects.toThrow('at least 1');
});

test('getWindow returns correct window by index', async () => {
  loadSession.mockResolvedValue({
    tabs: [],
    windows: [['a', 'b'], ['c', 'd']]
  });
  const win = await getWindow('work', 1);
  expect(win).toEqual(['c', 'd']);
});

test('getWindow throws on out-of-range index', async () => {
  loadSession.mockResolvedValue({ tabs: [], windows: [['a']] });
  await expect(getWindow('work', 5)).rejects.toThrow('out of range');
});

test('assignWindows saves windowMap to session', async () => {
  const session = makeSession(['a', 'b']);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  const map = { main: ['a'], side: ['b'] };
  await assignWindows('work', map);
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ windowMap: map }));
});

test('formatWindowResult renders windows correctly', () => {
  const windows = [
    [{ title: 'Google', url: 'https://google.com' }],
    [{ title: 'GitHub', url: 'https://github.com' }, { title: 'Docs', url: 'https://docs.com' }]
  ];
  const out = formatWindowResult(windows);
  expect(out).toContain('Window 1 (1 tab)');
  expect(out).toContain('Window 2 (2 tabs)');
  expect(out).toContain('Google');
  expect(out).toContain('GitHub');
});
