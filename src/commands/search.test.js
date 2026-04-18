const { searchSessions } = require('./search');
const { listSessions, loadSession } = require('../storage');

jest.mock('../storage');

describe('searchSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws if query is empty', async () => {
    await expect(searchSessions('')).rejects.toThrow('Search query cannot be empty');
  });

  it('returns empty array if no sessions exist', async () => {
    listSessions.mockResolvedValue([]);
    const results = await searchSessions('github');
    expect(results).toEqual([]);
  });

  it('returns sessions with matching tab urls', async () => {
    listSessions.mockResolvedValue(['work']);
    loadSession.mockResolvedValue({
      tabs: [
        { url: 'https://github.com/foo', title: 'Foo' },
        { url: 'https://google.com', title: 'Google' }
      ]
    });
    const results = await searchSessions('github');
    expect(results).toHaveLength(1);
    expect(results[0].sessionName).toBe('work');
    expect(results[0].matchingTabs).toHaveLength(1);
    expect(results[0].matchType).toBe('tabs');
  });

  it('returns sessions with matching tab titles', async () => {
    listSessions.mockResolvedValue(['personal']);
    loadSession.mockResolvedValue({
      tabs: [{ url: 'https://example.com', title: 'My Dashboard' }]
    });
    const results = await searchSessions('dashboard');
    expect(results[0].matchingTabs[0].title).toBe('My Dashboard');
  });

  it('returns empty array when no matches found', async () => {
    listSessions.mockResolvedValue(['misc']);
    loadSession.mockResolvedValue({
      tabs: [{ url: 'https://example.com', title: 'Example' }]
    });
    const results = await searchSessions('github');
    expect(results).toEqual([]);
  });
});
