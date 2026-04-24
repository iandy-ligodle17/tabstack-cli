const { renameSession } = require('./rename-session');
const storage = require('../storage');

jest.mock('../storage');

const makeSession = (name, tabs = []) => ({
  name,
  tabs,
  createdAt: '2024-01-01T00:00:00.000Z',
  tags: ['dev']
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('preserves all tabs after rename', async () => {
  const tabs = [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://npmjs.com', title: 'npm' }
  ];
  storage.listSessions.mockResolvedValue(['dev']);
  storage.loadSession.mockResolvedValue(makeSession('dev', tabs));
  storage.saveSession.mockResolvedValue();
  storage.deleteSession.mockResolvedValue();

  const result = await renameSession('dev', 'dev-backup');

  expect(result.tabs).toHaveLength(2);
  expect(result.tabs[0].url).toBe('https://github.com');
});

test('preserves tags and metadata after rename', async () => {
  storage.listSessions.mockResolvedValue(['dev']);
  storage.loadSession.mockResolvedValue(makeSession('dev'));
  storage.saveSession.mockResolvedValue();
  storage.deleteSession.mockResolvedValue();

  const result = await renameSession('dev', 'dev-v2');

  expect(result.tags).toEqual(['dev']);
  expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
});

test('sets previousName field correctly', async () => {
  storage.listSessions.mockResolvedValue(['alpha']);
  storage.loadSession.mockResolvedValue(makeSession('alpha'));
  storage.saveSession.mockResolvedValue();
  storage.deleteSession.mockResolvedValue();

  const result = await renameSession('alpha', 'beta');

  expect(result.previousName).toBe('alpha');
  expect(result.name).toBe('beta');
});

test('calls deleteSession with old name after saving new', async () => {
  storage.listSessions.mockResolvedValue(['temp']);
  storage.loadSession.mockResolvedValue(makeSession('temp'));
  storage.saveSession.mockResolvedValue();
  storage.deleteSession.mockResolvedValue();

  await renameSession('temp', 'permanent');

  const saveOrder = storage.saveSession.mock.invocationCallOrder[0];
  const deleteOrder = storage.deleteSession.mock.invocationCallOrder[0];
  expect(saveOrder).toBeLessThan(deleteOrder);
});
