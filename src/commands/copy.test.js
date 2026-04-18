const { copySession } = require('./copy');
const storage = require('../storage');

jest.mock('../storage');

describe('copySession', () => {
  const mockSession = {
    name: 'work',
    createdAt: '2024-01-01T00:00:00.000Z',
    tabs: [
      { url: 'https://github.com', title: 'GitHub' },
      { url: 'https://example.com', title: 'Example' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storage.loadSession.mockResolvedValue(mockSession);
    storage.listSessions.mockResolvedValue(['work']);
    storage.saveSession.mockResolvedValue(undefined);
  });

  it('copies a session to a new name', async () => {
    const result = await copySession('work', 'work-backup');
    expect(storage.saveSession).toHaveBeenCalledWith('work-backup', expect.objectContaining({
      name: 'work-backup',
      copiedFrom: 'work',
      tabs: mockSession.tabs,
    }));
    expect(result.tabCount).toBe(2);
    expect(result.source).toBe('work');
    expect(result.destination).toBe('work-backup');
  });

  it('throws if source name is missing', async () => {
    await expect(copySession('', 'dest')).rejects.toThrow('Source session name is required');
  });

  it('throws if destination name is missing', async () => {
    await expect(copySession('work', '')).rejects.toThrow('Destination session name is required');
  });

  it('throws if source and destination are the same', async () => {
    await expect(copySession('work', 'work')).rejects.toThrow('must be different');
  });

  it('throws if source session does not exist', async () => {
    storage.loadSession.mockResolvedValue(null);
    await expect(copySession('missing', 'dest')).rejects.toThrow('not found');
  });

  it('throws if destination exists without force', async () => {
    storage.listSessions.mockResolvedValue(['work', 'work-backup']);
    await expect(copySession('work', 'work-backup')).rejects.toThrow('already exists');
  });

  it('overwrites destination if force is true', async () => {
    storage.listSessions.mockResolvedValue(['work', 'work-backup']);
    const result = await copySession('work', 'work-backup', { force: true });
    expect(storage.saveSession).toHaveBeenCalled();
    expect(result.destination).toBe('work-backup');
  });
});
