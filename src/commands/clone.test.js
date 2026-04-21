const { cloneSession } = require('./clone');
const storage = require('../storage');

jest.mock('../storage');

const baseSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com/foo', title: 'GitHub' },
    { url: 'https://mail.google.com', title: 'Gmail' },
    { url: 'https://github.com/bar', title: 'GitHub Bar' },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  storage.listSessions.mockResolvedValue(['work']);
  storage.loadSession.mockResolvedValue({ ...baseSession, tabs: [...baseSession.tabs] });
  storage.saveSession.mockResolvedValue(undefined);
});

test('clones a session with a new name', async () => {
  const result = await cloneSession('work', 'work-copy');
  expect(result.name).toBe('work-copy');
  expect(result.tabs).toHaveLength(3);
  expect(result.clonedFrom).toBe('work');
  expect(storage.saveSession).toHaveBeenCalledWith('work-copy', expect.objectContaining({ name: 'work-copy' }));
});

test('clones with URL filter', async () => {
  const result = await cloneSession('work', 'github-only', { filter: 'github' });
  expect(result.tabs).toHaveLength(2);
  expect(result.tabs.every(t => t.url.includes('github'))).toBe(true);
});

test('throws if source session does not exist', async () => {
  storage.listSessions.mockResolvedValue([]);
  await expect(cloneSession('missing', 'copy')).rejects.toThrow('not found');
});

test('throws if target name already exists', async () => {
  storage.listSessions.mockResolvedValue(['work', 'work-copy']);
  await expect(cloneSession('work', 'work-copy')).rejects.toThrow('already exists');
});

test('sets a new createdAt timestamp', async () => {
  const before = Date.now();
  const result = await cloneSession('work', 'work-new');
  const after = Date.now();
  const ts = new Date(result.createdAt).getTime();
  expect(ts).toBeGreaterThanOrEqual(before);
  expect(ts).toBeLessThanOrEqual(after);
});
