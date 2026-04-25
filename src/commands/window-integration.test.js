/**
 * Integration tests for the window command using real-ish session shapes.
 */
const { splitIntoWindows, formatWindowResult } = require('./window');
const { loadSession } = require('../storage');

jest.mock('../storage');

function makeSession(n) {
  return {
    name: 'test',
    tabs: Array.from({ length: n }, (_, i) => ({
      url: `https://site${i + 1}.com`,
      title: `Site ${i + 1}`
    }))
  };
}

beforeEach(() => jest.clearAllMocks());

test('10 tabs with size 3 yields 4 windows', async () => {
  loadSession.mockResolvedValue(makeSession(10));
  const windows = await splitIntoWindows('test', 3);
  expect(windows).toHaveLength(4);
  expect(windows[3]).toHaveLength(1);
});

test('exactly divisible produces no remainder window', async () => {
  loadSession.mockResolvedValue(makeSession(9));
  const windows = await splitIntoWindows('test', 3);
  expect(windows).toHaveLength(3);
  windows.forEach(w => expect(w).toHaveLength(3));
});

test('single tab session produces one window', async () => {
  loadSession.mockResolvedValue(makeSession(1));
  const windows = await splitIntoWindows('test', 5);
  expect(windows).toHaveLength(1);
  expect(windows[0]).toHaveLength(1);
});

test('empty session produces no windows', async () => {
  loadSession.mockResolvedValue({ tabs: [] });
  const windows = await splitIntoWindows('test', 3);
  expect(windows).toHaveLength(0);
});

test('formatWindowResult output includes all tab titles', async () => {
  loadSession.mockResolvedValue(makeSession(4));
  const windows = await splitIntoWindows('test', 2);
  const output = formatWindowResult(windows);
  for (let i = 1; i <= 4; i++) {
    expect(output).toContain(`Site ${i}`);
  }
  expect(output).toContain('Window 1');
  expect(output).toContain('Window 2');
});
