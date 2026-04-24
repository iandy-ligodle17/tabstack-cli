const { renameSession, formatRenameResult } = require('./rename-session');
const storage = require('../storage');

jest.mock('../storage');

const makeSession = (name) => ({
  name,
  tabs: [{ url: 'https://example.com', title: 'Example' }],
  createdAt: '2024-01-01T00:00:00.000Z'
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('renames a session successfully', async () => {
  storage.listSessions.mockResolvedValue(['work', 'personal']);
  storage.loadSession.mockResolvedValue(makeSession('work'));
  storage.saveSession.mockResolvedValue();
  storage.deleteSession.mockResolvedValue();

  const result = await renameSession('work', 'work-2024');

  expect(result.name).toBe('work-2024');
  expect(result.previousName).toBe('work');
  expect(result.renamedAt).toBeDefined();
  expect(storage.saveSession).toHaveBeenCalledWith('work-2024', expect.objectContaining({ name: 'work-2024' }));
  expect(storage.deleteSession).toHaveBeenCalledWith('work');
});

test('throws if old session does not exist', async () => {
  storage.listSessions.mockResolvedValue(['personal']);

  await expect(renameSession('work', 'work-2024')).rejects.toThrow('Session "work" not found');
});

test('throws if new name already exists', async () => {
  storage.listSessions.mockResolvedValue(['work', 'personal']);

  await expect(renameSession('work', 'personal')).rejects.toThrow('Session "personal" already exists');
});

test('throws if old and new names are the same', async () => {
  await expect(renameSession('work', 'work')).rejects.toThrow('New name must be different');
});

test('throws if names are missing', async () => {
  await expect(renameSession('', 'newname')).rejects.toThrow('Both old and new session names are required');
  await expect(renameSession('oldname', '')).rejects.toThrow('Both old and new session names are required');
});

test('formatRenameResult returns correct string', () => {
  const msg = formatRenameResult('work', 'work-2024');
  expect(msg).toBe('Session "work" renamed to "work-2024" successfully.');
});
