const { watchSession } = require('./watch');
const storage = require('../storage');
const browser = require('../browser');

jest.mock('../storage');
jest.mock('../browser');

jest.useFakeTimers();

const mockTabs = [
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'MDN', url: 'https://developer.mozilla.org' }
];

describe('watchSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    browser.getTabs.mockResolvedValue(mockTabs);
    storage.saveSession.mockResolvedValue();
  });

  it('throws if no name provided', async () => {
    await expect(watchSession('')).rejects.toThrow('Session name is required');
  });

  it('saves session on first run when none exists', async () => {
    storage.loadSession.mockRejectedValue(new Error('not found'));
    const watcher = await watchSession('work', { silent: true });
    expect(storage.saveSession).toHaveBeenCalledWith('work', expect.objectContaining({
      name: 'work',
      tabs: mockTabs
    }));
    watcher.stop();
  });

  it('saves session when tabs have changed', async () => {
    const oldTabs = [{ title: 'Old', url: 'https://old.com' }];
    storage.loadSession.mockResolvedValue({ tabs: oldTabs, tags: [], notes: '', createdAt: '2024-01-01' });
    const watcher = await watchSession('work', { silent: true });
    expect(storage.saveSession).toHaveBeenCalled();
    watcher.stop();
  });

  it('does not save when tabs are unchanged', async () => {
    storage.loadSession.mockResolvedValue({ tabs: mockTabs, tags: [], notes: '', createdAt: '2024-01-01' });
    const watcher = await watchSession('work', { silent: true });
    expect(storage.saveSession).not.toHaveBeenCalled();
    watcher.stop();
  });

  it('preserves existing tags and notes on update', async () => {
    const oldTabs = [{ title: 'Old', url: 'https://old.com' }];
    storage.loadSession.mockResolvedValue({ tabs: oldTabs, tags: ['dev'], notes: 'my note', createdAt: '2024-01-01' });
    const watcher = await watchSession('work', { silent: true });
    expect(storage.saveSession).toHaveBeenCalledWith('work', expect.objectContaining({
      tags: ['dev'],
      notes: 'my note'
    }));
    watcher.stop();
  });
});
