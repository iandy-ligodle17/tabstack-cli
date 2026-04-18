const { parseTabOutput, getTabs, openTabs } = require('./browser');
const { exec } = require('child_process');

jest.mock('child_process', () => ({ exec: jest.fn() }));
jest.mock('os', () => ({ platform: jest.fn(() => 'darwin') }));

describe('parseTabOutput', () => {
  it('returns empty array for empty string', () => {
    expect(parseTabOutput('')).toEqual([]);
  });

  it('parses comma-separated urls', () => {
    const input = 'https://example.com, https://github.com';
    expect(parseTabOutput(input)).toEqual(['https://example.com', 'https://github.com']);
  });

  it('filters out non-http entries', () => {
    const input = 'https://example.com, about:blank, ftp://old.site';
    expect(parseTabOutput(input)).toEqual(['https://example.com']);
  });

  it('strips surrounding quotes', () => {
    const input = '"https://example.com"';
    expect(parseTabOutput(input)).toEqual(['https://example.com']);
  });
});

describe('getTabs', () => {
  it('resolves with parsed urls on success', async () => {
    exec.mockImplementation((cmd, cb) => cb(null, 'https://example.com, https://github.com'));
    const tabs = await getTabs('chrome');
    expect(tabs).toEqual(['https://example.com', 'https://github.com']);
  });

  it('rejects on exec error', async () => {
    exec.mockImplementation((cmd, cb) => cb(new Error('fail'), ''));
    await expect(getTabs('chrome')).rejects.toThrow('Failed to get tabs');
  });

  it('rejects for unsupported browser', async () => {
    await expect(getTabs('safari')).rejects.toThrow('Unsupported platform/browser combo');
  });
});

describe('openTabs', () => {
  it('calls exec for each url', async () => {
    exec.mockImplementation((cmd, cb) => cb(null));
    await openTabs(['https://example.com', 'https://github.com']);
    expect(exec).toHaveBeenCalledTimes(2);
  });

  it('rejects if exec fails', async () => {
    exec.mockImplementation((cmd, cb) => cb(new Error('open failed')));
    await expect(openTabs(['https://example.com'])).rejects.toThrow('open failed');
  });
});
