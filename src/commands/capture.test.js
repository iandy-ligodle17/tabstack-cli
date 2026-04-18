import { jest } from '@jest/globals';

const mockGetTabs = jest.fn();
const mockSaveSession = jest.fn();
const mockEnsureSessionsDir = jest.fn();

jest.unstable_mockModule('../browser.js', () => ({
  getTabs: mockGetTabs,
}));

jest.unstable_mockModule('../storage.js', () => ({
  saveSession: mockSaveSession,
  ensureSessionsDir: mockEnsureSessionsDir,
}));

const { captureSession } = await import('./capture.js');

describe('captureSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureSessionsDir.mockResolvedValue(undefined);
  });

  it('saves tabs to a named session', async () => {
    const tabs = ['https://example.com', 'https://github.com'];
    mockGetTabs.mockResolvedValue(tabs);
    mockSaveSession.mockResolvedValue('/sessions/work.json');

    const result = await captureSession('work');

    expect(mockEnsureSessionsDir).toHaveBeenCalled();
    expect(mockGetTabs).toHaveBeenCalled();
    expect(mockSaveSession).toHaveBeenCalledWith('work', tabs);
    expect(result).toEqual({ name: 'work', count: 2, path: '/sessions/work.json' });
  });

  it('throws if no tabs are found', async () => {
    mockGetTabs.mockResolvedValue([]);

    await expect(captureSession('empty')).rejects.toThrow('No tabs found');
    expect(mockSaveSession).not.toHaveBeenCalled();
  });

  it('throws if getTabs fails', async () => {
    mockGetTabs.mockRejectedValue(new Error('browser error'));

    await expect(captureSession('fail')).rejects.toThrow('browser error');
  });
});
