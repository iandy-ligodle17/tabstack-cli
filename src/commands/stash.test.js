const { stashSession, popStash, listStashes, formatStashList, STASH_PREFIX } = require('./stash');

jest.mock('../storage');
const storage = require('../storage');

const makeSession = (tabs = []) => ({ tabs, created: '2024-01-01T00:00:00.000Z' });

beforeEach(() => {
  jest.clearAllMocks();
});

test('stashSession saves session with stash prefix', () => {
  const session = makeSession([{ url: 'https://a.com', title: 'A' }]);
  storage.loadSession.mockReturnValue(session);
  storage.saveSession.mockImplementation(() => {});

  const stashName = stashSession('work');
  expect(stashName).toMatch(new RegExp(`^${STASH_PREFIX}work_`));
  expect(storage.saveSession).toHaveBeenCalledWith(
    expect.stringContaining(STASH_PREFIX),
    expect.objectContaining({ stashedFrom: 'work' })
  );
});

test('stashSession throws if session not found', () => {
  storage.loadSession.mockReturnValue(null);
  expect(() => stashSession('missing')).toThrow('Session "missing" not found');
});

test('popStash restores latest stash and deletes it', () => {
  const stashKey = `${STASH_PREFIX}work_1000`;
  storage.listSessions.mockReturnValue([stashKey]);
  storage.loadSession.mockReturnValue(makeSession([{ url: 'https://b.com', title: 'B' }]));
  storage.saveSession.mockImplementation(() => {});
  storage.deleteSession.mockImplementation(() => {});

  const removed = popStash('work');
  expect(removed).toBe(stashKey);
  expect(storage.saveSession).toHaveBeenCalledWith('work', expect.not.objectContaining({ stashedFrom: 'work' }));
  expect(storage.deleteSession).toHaveBeenCalledWith(stashKey);
});

test('popStash throws if no stash exists', () => {
  storage.listSessions.mockReturnValue([]);
  expect(() => popStash('work')).toThrow('No stash found for session "work"');
});

test('listStashes returns only stash entries', () => {
  const key = `${STASH_PREFIX}dev_999`;
  storage.listSessions.mockReturnValue(['work', key]);
  storage.loadSession.mockReturnValue({ tabs: [1, 2], stashedFrom: 'dev', stashedAt: '2024-01-01T00:00:00.000Z' });

  const result = listStashes();
  expect(result).toHaveLength(1);
  expect(result[0].originalName).toBe('dev');
  expect(result[0].tabCount).toBe(2);
});

test('formatStashList returns message when empty', () => {
  expect(formatStashList([])).toBe('No stashes found.');
});

test('formatStashList formats stash entries', () => {
  const stashes = [{ stashName: `${STASH_PREFIX}dev_1`, originalName: 'dev', stashedAt: '2024-01-01T00:00:00.000Z', tabCount: 3 }];
  const output = formatStashList(stashes);
  expect(output).toContain('dev');
  expect(output).toContain('3 tab(s)');
});
