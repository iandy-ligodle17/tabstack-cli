const { archiveSession, unarchiveSession, listArchived } = require('./archive');
const storage = require('../storage');

jest.mock('../storage');

const mockSession = {
  tabs: [{ url: 'https://example.com', title: 'Example' }],
  savedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

describe('archiveSession', () => {
  it('archives a session and deletes original by default', async () => {
    storage.loadSession.mockResolvedValue(mockSession);
    storage.listSessions.mockResolvedValue(['work']);
    storage.saveSession.mockResolvedValue();
    storage.deleteSession.mockResolvedValue();

    const result = await archiveSession('work');

    expect(result).toBe('archived/work');
    expect(storage.saveSession).toHaveBeenCalledWith('archived/work', expect.objectContaining({
      archivedAt: expect.any(String),
      originalName: 'work',
    }));
    expect(storage.deleteSession).toHaveBeenCalledWith('work');
  });

  it('keeps original when --keep is passed', async () => {
    storage.loadSession.mockResolvedValue(mockSession);
    storage.listSessions.mockResolvedValue([]);
    storage.saveSession.mockResolvedValue();

    await archiveSession('work', { keep: true });
    expect(storage.deleteSession).not.toHaveBeenCalled();
  });

  it('throws if session not found', async () => {
    storage.loadSession.mockResolvedValue(null);
    await expect(archiveSession('nope')).rejects.toThrow('not found');
  });

  it('throws if archived name exists without force', async () => {
    storage.loadSession.mockResolvedValue(mockSession);
    storage.listSessions.mockResolvedValue(['archived/work']);
    await expect(archiveSession('work')).rejects.toThrow('already exists');
  });
});

describe('unarchiveSession', () => {
  it('restores an archived session', async () => {
    const archived = { ...mockSession, archivedAt: '2024-01-02T00:00:00.000Z', originalName: 'work' };
    storage.loadSession.mockResolvedValue(archived);
    storage.listSessions.mockResolvedValue([]);
    storage.saveSession.mockResolvedValue();
    storage.deleteSession.mockResolvedValue();

    const result = await unarchiveSession('work');
    expect(result).toBe('work');
    expect(storage.saveSession).toHaveBeenCalledWith('work', expect.not.objectContaining({ archivedAt: expect.anything() }));
    expect(storage.deleteSession).toHaveBeenCalledWith('archived/work');
  });
});

describe('listArchived', () => {
  it('returns only archived sessions', async () => {
    storage.listSessions.mockResolvedValue(['work', 'archived/old', 'archived/research']);
    const result = await listArchived();
    expect(result).toEqual(['archived/old', 'archived/research']);
  });
});
