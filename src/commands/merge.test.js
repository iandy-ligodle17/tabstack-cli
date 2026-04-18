const { merge } = require('./merge');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const sessionA = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://jira.com', title: 'Jira' },
  ],
};

const sessionB = {
  name: 'research',
  tabs: [
    { url: 'https://mdn.com', title: 'MDN' },
    { url: 'https://github.com', title: 'GitHub' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockImplementation((name) => {
    if (name === 'work') return Promise.resolve(sessionA);
    if (name === 'research') return Promise.resolve(sessionB);
    return Promise.resolve(null);
  });
  saveSession.mockResolvedValue(undefined);
});

test('merges two sessions into a new one', async () => {
  const result = await merge(['work', 'research'], 'combined');
  expect(result.tabs).toHaveLength(4);
  expect(result.name).toBe('combined');
  expect(result.mergedFrom).toEqual(['work', 'research']);
  expect(saveSession).toHaveBeenCalledWith('combined', expect.objectContaining({ name: 'combined' }));
});

test('deduplicates tabs when dedupe option is set', async () => {
  const result = await merge(['work', 'research'], 'combined', { dedupe: true });
  expect(result.tabs).toHaveLength(3);
});

test('preserves tab order when deduplicating', async () => {
  const result = await merge(['work', 'research'], 'combined', { dedupe: true });
  const urls = result.tabs.map((t) => t.url);
  expect(urls).toEqual(['https://github.com', 'https://jira.com', 'https://mdn.com']);
});

test('throws if fewer than two sessions provided', async () => {
  await expect(merge(['work'], 'combined')).rejects.toThrow('At least two');
});

test('throws if target name is missing', async () => {
  await expect(merge(['work', 'research'], '')).rejects.toThrow('Target session name is required');
});

test('throws if a session does not exist', async () => {
  await expect(merge(['work', 'missing'], 'combined')).rejects.toThrow('Session "missing" not found');
});
