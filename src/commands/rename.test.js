const { renameSession } = require('./rename');
const storage = require('../storage');

jest.mock('../storage');

describe('renameSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws if oldName is missing', async () => {
    await expect(renameSession(null, 'new')).rejects.toThrow('Both old and new session names are required');
  });

  it('throws if newName is missing', async () => {
    await expect(renameSession('old', null)).rejects.toThrow('Both old and new session names are required');
  });

  it('throws if names are the same', async () => {
    await expect(renameSession('work', 'work')).rejects.toThrow('New name must be different');
  });

  it('throws if session not found', async () => {
    storage.listSessions.mockResolvedValue(['other']);
    await expect(renameSession('work', 'home')).rejects.toThrow('Session "work" not found');
  });

  it('throws if target name exists without force', async () => {
    storage.listSessions.mockResolvedValue(['work', 'home']);
    await expect(renameSession('work', 'home')).rejects.toThrow('already exists');
  });

  it('renames session successfully', async () => {
    const mockSession = { name: 'work', tabs: ['https://example.com'] };
    storage.listSessions.mockResolvedValue(['work']);
    storage.loadSession.mockResolvedValue(mockSession);
    storage.saveSession.mockResolvedValue();
    storage.deleteSession.mockResolvedValue();

    const result = await renameSession('work', 'home');

    expect(storage.saveSession).toHaveBeenCalledWith('home', expect.objectContaining({ name: 'home', previousName: 'work' }));
    expect(storage.deleteSession).toHaveBeenCalledWith('work');
    expect(result.name).toBe('home');
  });

  it('allows overwrite with force flag', async () => {
    const mockSession = { name: 'work', tabs: [] };
    storage.listSessions.mockResolvedValue(['work', 'home']);
    storage.loadSession.mockResolvedValue(mockSession);
    storage.saveSession.mockResolvedValue();
    storage.deleteSession.mockResolvedValue();

    const result = await renameSession('work', 'home', { force: true });
    expect(result.name).toBe('home');
  });
});
