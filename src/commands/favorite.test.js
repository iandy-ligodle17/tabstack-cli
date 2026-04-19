const { toggleFavorite, listFavorites, formatFavorites } = require('./favorite');
const storage = require('../storage');

jest.mock('../storage');

describe('toggleFavorite', () => {
  it('marks a session as favorite', async () => {
    storage.loadSession.mockResolvedValue({ tabs: [], favorite: false });
    storage.saveSession.mockResolvedValue();
    const result = await toggleFavorite('work');
    expect(result).toEqual({ name: 'work', favorite: true });
    expect(storage.saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ favorite: true }));
  });

  it('unmarks a favorite session', async () => {
    storage.loadSession.mockResolvedValue({ tabs: [], favorite: true });
    storage.saveSession.mockResolvedValue();
    const result = await toggleFavorite('work');
    expect(result.favorite).toBe(false);
  });

  it('throws if session not found', async () => {
    storage.loadSession.mockResolvedValue(null);
    await expect(toggleFavorite('ghost')).rejects.toThrow('Session "ghost" not found');
  });
});

describe('listFavorites', () => {
  it('returns only favorited sessions', async () => {
    const sessions = [
      { name: 'a', favorite: true },
      { name: 'b', favorite: false },
      { name: 'c', favorite: true },
    ];
    const result = await listFavorites(sessions);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.name)).toEqual(['a', 'c']);
  });

  it('returns empty array when none are favorited', async () => {
    const result = await listFavorites([{ name: 'x', favorite: false }]);
    expect(result).toEqual([]);
  });
});

describe('formatFavorites', () => {
  it('formats a list of favorites', () => {
    const sessions = [{ name: 'work', tabs: [1, 2, 3], favorite: true }];
    const output = formatFavorites(sessions);
    expect(output).toContain('★ work');
    expect(output).toContain('3 tabs');
  });

  it('returns message when no favorites', () => {
    expect(formatFavorites([])).toBe('No favorite sessions saved.');
  });
});
