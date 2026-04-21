const { swapTabs, formatSwapResult } = require('./swap');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(urls) {
  return {
    name: 'test',
    tabs: urls.map((url, i) => ({ url, title: `Tab ${i}` })),
  };
}

beforeEach(() => jest.clearAllMocks());

test('swaps two tabs by index', async () => {
  const session = makeSession(['https://a.com', 'https://b.com', 'https://c.com']);
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await swapTabs('test', 0, 2);

  expect(result.tabs[0].url).toBe('https://c.com');
  expect(result.tabs[2].url).toBe('https://a.com');
  expect(result.tabs[1].url).toBe('https://b.com');
  expect(saveSession).toHaveBeenCalledWith('test', result);
});

test('returns unchanged session when indices are equal', async () => {
  const session = makeSession(['https://a.com', 'https://b.com']);
  loadSession.mockResolvedValue(session);

  const result = await swapTabs('test', 1, 1);

  expect(result.tabs[1].url).toBe('https://b.com');
  expect(saveSession).not.toHaveBeenCalled();
});

test('throws on out-of-range index', async () => {
  const session = makeSession(['https://a.com', 'https://b.com']);
  loadSession.mockResolvedValue(session);

  await expect(swapTabs('test', 0, 5)).rejects.toThrow('out of range');
});

test('throws on negative index', async () => {
  const session = makeSession(['https://a.com']);
  loadSession.mockResolvedValue(session);

  await expect(swapTabs('test', -1, 0)).rejects.toThrow('out of range');
});

test('throws when session has no tabs', async () => {
  loadSession.mockResolvedValue({ name: 'empty', tabs: [] });

  await expect(swapTabs('empty', 0, 1)).rejects.toThrow('no tabs');
});

test('formatSwapResult shows swapped tab titles', async () => {
  const session = makeSession(['https://b.com', 'https://a.com']);
  // after swap(0,1), tabs are [a, b]
  const swapped = { tabs: [{ url: 'https://b.com', title: 'Tab 0' }, { url: 'https://a.com', title: 'Tab 1' }] };
  const output = formatSwapResult('test', 0, 1, swapped);

  expect(output).toContain('Swapped tabs in "test"');
  expect(output).toContain('[0]');
  expect(output).toContain('[1]');
});
