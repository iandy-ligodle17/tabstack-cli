const { saveTemplate, loadTemplate, listTemplates, applyTemplate, deleteTemplate } = require('./template');

jest.mock('../storage', () => ({
  loadSession: jest.fn(),
  saveSession: jest.fn(),
  listSessions: jest.fn(),
  deleteSession: jest.fn(),
}));

const storage = require('../storage');

beforeEach(() => jest.clearAllMocks());

test('saveTemplate creates a template from a session', async () => {
  storage.loadSession.mockResolvedValue({ tabs: ['https://example.com'] });
  storage.saveSession.mockResolvedValue();
  const result = await saveTemplate('work', 'work-template');
  expect(result.isTemplate).toBe(true);
  expect(result.tabs).toEqual(['https://example.com']);
  expect(storage.saveSession).toHaveBeenCalledWith('__template__work-template', expect.objectContaining({ isTemplate: true }));
});

test('loadTemplate returns template data', async () => {
  storage.loadSession.mockResolvedValue({ isTemplate: true, tabs: ['https://a.com'] });
  const result = await loadTemplate('work-template');
  expect(result.isTemplate).toBe(true);
});

test('loadTemplate throws if not a template', async () => {
  storage.loadSession.mockResolvedValue({ isTemplate: false });
  await expect(loadTemplate('notatemplate')).rejects.toThrow("is not a template");
});

test('listTemplates filters template sessions', async () => {
  storage.listSessions.mockResolvedValue(['__template__a', 'regular', '__template__b']);
  const result = await listTemplates();
  expect(result).toEqual(['a', 'b']);
});

test('applyTemplate creates a new session from template', async () => {
  storage.loadSession.mockResolvedValue({ isTemplate: true, tabs: ['https://x.com'] });
  storage.saveSession.mockResolvedValue();
  const result = await applyTemplate('my-template', 'new-session');
  expect(result.name).toBe('new-session');
  expect(result.tabs).toEqual(['https://x.com']);
});

test('deleteTemplate removes the template', async () => {
  storage.deleteSession.mockResolvedValue();
  await deleteTemplate('old-template');
  expect(storage.deleteSession).toHaveBeenCalledWith('__template__old-template');
});
