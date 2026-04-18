const { list } = require('./list');
const storage = require('../storage');

jest.mock('../storage');

describe('list command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it('shows message when no sessions', async () => {
    storage.listSessions.mockResolvedValue([]);
    await list();
    expect(console.log).toHaveBeenCalledWith('No saved sessions.');
  });

  it('prints session names', async () => {
    storage.listSessions.mockResolvedValue(['work', 'personal']);
    await list();
    expect(console.log).toHaveBeenCalledWith('work');
    expect(console.log).toHaveBeenCalledWith('personal');
  });

  it('prints verbose info with tab count and date', async () => {
    storage.listSessions.mockResolvedValue(['work']);
    storage.loadSession.mockResolvedValue({
      tabs: [{ url: 'https://example.com' }],
      savedAt: '2024-01-15T10:00:00.000Z'
    });
    await list({ verbose: true });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('tabs   : 1'));
  });

  it('prints urls in verbose+urls mode', async () => {
    storage.listSessions.mockResolvedValue(['dev']);
    storage.loadSession.mockResolvedValue({
      tabs: [{ url: 'https://github.com' }],
      savedAt: new Date().toISOString()
    });
    await list({ verbose: true, urls: true });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('https://github.com'));
  });
});
