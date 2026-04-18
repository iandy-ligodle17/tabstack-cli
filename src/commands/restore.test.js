const { restore } = require('./restore');
const storage = require('../storage');
const browser = require('../browser');

jest.mock('../storage');
jest.mock('../browser');

describe('restore command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('lists sessions when no name given', async () => {
    storage.listSessions.mockResolvedValue(['work', 'personal']);
    await restore();
    expect(storage.listSessions).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
  });

  it('shows message when no sessions exist', async () => {
    storage.listSessions.mockResolvedValue([]);
    await restore();
    expect(console.log).toHaveBeenCalledWith('No saved sessions found.');
  });

  it('restores a named session', async () => {
    const session = { tabs: [{ url: 'https://example.com' }, { url: 'https://github.com' }] };
    storage.loadSession.mockResolvedValue(session);
    browser.openTabs.mockResolvedValue();
    await restore('work');
    expect(storage.loadSession).toHaveBeenCalledWith('work');
    expect(browser.openTabs).toHaveBeenCalledWith(['https://example.com', 'https://github.com'], {});
  });

  it('exits if session not found', async () => {
    storage.loadSession.mockRejectedValue(new Error('not found'));
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(restore('ghost')).rejects.toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
