const { shareSession, generateShareableLink, encodeSessionForShare } = require('./share');
const { loadSession } = require('../storage');

jest.mock('../storage');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://notion.so', title: 'Notion' },
  ],
  tags: ['work'],
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  loadSession.mockResolvedValue(mockSession);
});

test('shareSession returns formatted string by default', async () => {
  const result = await shareSession('work');
  expect(result).toContain('Session: work');
  expect(result).toContain('Tabs: 2');
  expect(result).toContain('Link:');
});

test('shareSession returns json when option set', async () => {
  const result = await shareSession('work', { json: true });
  expect(result).toHaveProperty('link');
  expect(result.tabCount).toBe(2);
  expect(result.name).toBe('work');
});

test('shareSession throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(shareSession('missing')).rejects.toThrow('Session "missing" not found');
});

test('generateShareableLink encodes session in url', () => {
  const link = generateShareableLink({ name: 'test', tabs: [] });
  expect(link).toMatch(/^https:\/\/tabstack\.app\/share\?data=/);
});

test('generateShareableLink uses custom baseUrl', () => {
  const link = generateShareableLink({}, { baseUrl: 'https://custom.io' });
  expect(link).toContain('https://custom.io');
});

test('encodeSessionForShare strips internal fields', () => {
  const session = { ...mockSession, _internalField: 'secret' };
  const encoded = encodeSessionForShare(session);
  expect(encoded).not.toHaveProperty('_internalField');
  expect(encoded).toHaveProperty('tabs');
});
