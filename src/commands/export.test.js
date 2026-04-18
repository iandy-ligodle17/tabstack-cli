const fs = require('fs');
const path = require('path');
const { exportSession } = require('./export');
const { loadSession } = require('../storage');

jest.mock('../storage');
jest.mock('fs');

const mockTabs = [
  { url: 'https://github.com', title: 'GitHub' },
  { url: 'https://example.com', title: 'Example' }
];

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockResolvedValue(mockTabs);
  fs.writeFileSync = jest.fn();
});

test('exports session as json by default', async () => {
  const result = await exportSession('work', '/tmp/work.json');
  expect(result.tabCount).toBe(2);
  expect(result.format).toBe('json');
  const written = fs.writeFileSync.mock.calls[0][1];
  const parsed = JSON.parse(written);
  expect(parsed.session).toBe('work');
  expect(parsed.tabs).toHaveLength(2);
});

test('exports session as plain text', async () => {
  const result = await exportSession('work', '/tmp/work.txt', { format: 'text' });
  expect(result.format).toBe('text');
  const written = fs.writeFileSync.mock.calls[0][1];
  expect(written).toContain('https://github.com');
  expect(written).toContain('https://example.com');
});

test('exports session as markdown', async () => {
  const result = await exportSession('work', '/tmp/work.md', { format: 'markdown' });
  expect(result.format).toBe('markdown');
  const written = fs.writeFileSync.mock.calls[0][1];
  expect(written).toContain('# Session: work');
  expect(written).toContain('[GitHub](https://github.com)');
});

test('throws on unsupported format', async () => {
  await expect(exportSession('work', '/tmp/out', { format: 'csv' })).rejects.toThrow('Unsupported format');
});

test('throws if session name missing', async () => {
  await expect(exportSession('')).rejects.toThrow('Session name is required');
});

test('throws if session not found', async () => {
  loadSession.mockResolvedValue([]);
  await expect(exportSession('ghost', '/tmp/ghost.json')).rejects.toThrow('not found or is empty');
});
