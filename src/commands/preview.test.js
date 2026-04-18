const { previewSession, formatPreview } = require('./preview');
const storage = require('../storage');

jest.mock('../storage');

const mockSession = {
  name: 'work',
  created: '2024-01-15T10:00:00.000Z',
  tags: ['work', 'dev'],
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://stackoverflow.com', title: 'Stack Overflow' },
    { url: 'https://github.com/issues', title: 'Issues' },
    { url: 'https://npmjs.com', title: 'npm' },
  ],
};

beforeEach(() => {
  storage.loadSession.mockReturnValue(mockSession);
});

test('returns full preview by default', () => {
  const result = previewSession('work');
  expect(result.totalTabs).toBe(4);
  expect(result.showing).toBe(4);
  expect(result.name).toBe('work');
});

test('respects limit option', () => {
  const result = previewSession('work', { limit: 2 });
  expect(result.showing).toBe(2);
  expect(result.previewTabs).toHaveLength(2);
});

test('filters by domain', () => {
  const result = previewSession('work', { domain: 'github.com' });
  expect(result.showing).toBe(2);
  result.previewTabs.forEach(tab => expect(tab.url).toContain('github.com'));
});

test('throws if session not found', () => {
  storage.loadSession.mockReturnValue(null);
  expect(() => previewSession('missing')).toThrow('Session "missing" not found');
});

test('formatPreview includes session name and tab urls', () => {
  const preview = previewSession('work');
  const output = formatPreview(preview);
  expect(output).toContain('Session: work');
  expect(output).toContain('https://github.com');
  expect(output).toContain('GitHub');
  expect(output).toContain('Tags: work, dev');
});

test('formatPreview shows correct tab count', () => {
  const preview = previewSession('work', { limit: 2 });
  const output = formatPreview(preview);
  expect(output).toContain('2 of 4');
});
