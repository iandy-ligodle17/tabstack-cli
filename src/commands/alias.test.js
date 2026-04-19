const { setAlias, removeAlias, resolveAlias } = require('./alias');
const storage = require('../storage');

jest.mock('../storage');

describe('alias', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('setAlias', () => {
    it('sets alias on a session', async () => {
      storage.loadSession.mockResolvedValue({ tabs: [] });
      storage.listSessions.mockResolvedValue(['work']);
      storage.saveSession.mockResolvedValue();

      const result = await setAlias('work', 'w');
      expect(result).toEqual({ sessionName: 'work', alias: 'w' });
      expect(storage.saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ alias: 'w' }));
    });

    it('throws if session not found', async () => {
      storage.loadSession.mockResolvedValue(null);
      await expect(setAlias('missing', 'x')).rejects.toThrow("Session 'missing' not found");
    });

    it('throws if alias already taken', async () => {
      storage.loadSession
        .mockResolvedValueOnce({ tabs: [] })
        .mockResolvedValueOnce({ tabs: [], alias: 'w' });
      storage.listSessions.mockResolvedValue(['work', 'other']);

      await expect(setAlias('work', 'w')).rejects.toThrow("Alias 'w' is already used");
    });
  });

  describe('removeAlias', () => {
    it('removes alias from session', async () => {
      storage.loadSession.mockResolvedValue({ tabs: [], alias: 'w' });
      storage.saveSession.mockResolvedValue();

      const result = await removeAlias('work');
      expect(result).toEqual({ sessionName: 'work', removedAlias: 'w' });
      expect(storage.saveSession).toHaveBeenCalledWith('work', expect.not.objectContaining({ alias: expect.anything() }));
    });

    it('throws if no alias set', async () => {
      storage.loadSession.mockResolvedValue({ tabs: [] });
      await expect(removeAlias('work')).rejects.toThrow("has no alias");
    });
  });

  describe('resolveAlias', () => {
    it('resolves alias to session name', async () => {
      storage.listSessions.mockResolvedValue(['work', 'personal']);
      storage.loadSession
        .mockResolvedValueOnce({ tabs: [], alias: 'w' })
        .mockResolvedValueOnce({ tabs: [] });

      const result = await resolveAlias('w');
      expect(result).toBe('work');
    });

    it('returns null if not found', async () => {
      storage.listSessions.mockResolvedValue(['work']);
      storage.loadSession.mockResolvedValue({ tabs: [] });

      const result = await resolveAlias('nope');
      expect(result).toBeNull();
    });
  });
});
