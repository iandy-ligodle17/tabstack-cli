const fs = require('fs');
const path = require('path');
const { importSession } = require('./import');
const { saveSession } = require('../storage');

jest.mock('../storage');
jest.mock('fs');

describe('importSession', () => {
  const mockSession = {
    name: 'work',
    tabs: [
      { url: 'https://github.com', title: 'GitHub' },
      { url: 'https://example.com', title: 'Example' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockSession));
    saveSession.mockResolvedValue(undefined);
  });

  it('imports a session from a valid file', async () => {
    const result = await importSession('/tmp/work.json');
    expect(result.sessionName).toBe('work');
    expect(result.tabCount).toBe(2);
    expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({
      name: 'work',
      tabs: mockSession.tabs,
    }));
  });

  it('uses custom name when provided via options', async () => {
    const result = await importSession('/tmp/work.json', { name: 'my-work' });
    expect(result.sessionName).toBe('my-work');
    expect(saveSession).toHaveBeenCalledWith('my-work', expect.objectContaining({ name: 'my-work' }));
  });

  it('throws if file path is missing', async () => {
    await expect(importSession()).rejects.toThrow('File path is required');
  });

  it('throws if file does not exist', async () => {
    fs.existsSync.mockReturnValue(false);
    await expect(importSession('/tmp/missing.json')).rejects.toThrow('File not found');
  });

  it('throws if file contains invalid JSON', async () => {
    fs.readFileSync.mockReturnValue('not json');
    await expect(importSession('/tmp/bad.json')).rejects.toThrow('Failed to parse file');
  });

  it('throws if session format is invalid', async () => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ foo: 'bar' }));
    await expect(importSession('/tmp/bad.json')).rejects.toThrow('Invalid session file format');
  });
});
