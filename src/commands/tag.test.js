const { tagSession, getSessionTags } = require('./tag');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

describe('tagSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('appends tags to a session', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: ['work'] });
    saveSession.mockResolvedValue();
    const result = await tagSession('mysession', ['dev', 'work']);
    expect(result).toEqual(['work', 'dev']);
    expect(saveSession).toHaveBeenCalledWith('mysession', expect.objectContaining({ tags: ['work', 'dev'] }));
  });

  it('does not duplicate tags when appending', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: ['work', 'dev'] });
    saveSession.mockResolvedValue();
    const result = await tagSession('mysession', ['work']);
    expect(result).toEqual(['work', 'dev']);
  });

  it('sets tags when options.set is true', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: ['old'] });
    saveSession.mockResolvedValue();
    const result = await tagSession('mysession', ['new'], { set: true });
    expect(result).toEqual(['new']);
  });

  it('removes tags when options.remove is true', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: ['work', 'dev'] });
    saveSession.mockResolvedValue();
    const result = await tagSession('mysession', ['dev'], { remove: true });
    expect(result).toEqual(['work']);
  });

  it('throws if session not found', async () => {
    loadSession.mockResolvedValue(null);
    await expect(tagSession('ghost', ['x'])).rejects.toThrow('Session "ghost" not found');
  });
});

describe('getSessionTags', () => {
  it('returns tags for a session', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: ['work'] });
    const tags = await getSessionTags('mysession');
    expect(tags).toEqual(['work']);
  });

  it('returns empty array if no tags', async () => {
    loadSession.mockResolvedValue({ tabs: [] });
    const tags = await getSessionTags('mysession');
    expect(tags).toEqual([]);
  });

  it('throws if session not found', async () => {
    loadSession.mockResolvedValue(null);
    await expect(getSessionTags('ghost')).rejects.toThrow('Session "ghost" not found');
  });
});
