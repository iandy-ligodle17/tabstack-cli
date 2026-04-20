const { addLabel, removeLabel, listLabels, formatLabels } = require('./label');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

const mockSession = () => ({ name: 'work', tabs: [], labels: [] });

beforeEach(() => {
  jest.clearAllMocks();
});

test('addLabel adds a new label to session', async () => {
  const session = mockSession();
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await addLabel('work', 'priority');
  expect(result.added).toBe(true);
  expect(result.label).toBe('priority');
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ labels: ['priority'] }));
});

test('addLabel normalizes label to lowercase', async () => {
  const session = mockSession();
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await addLabel('work', 'URGENT');
  expect(result.label).toBe('urgent');
});

test('addLabel does not duplicate existing label', async () => {
  const session = { ...mockSession(), labels: ['priority'] };
  loadSession.mockResolvedValue(session);

  const result = await addLabel('work', 'priority');
  expect(result.added).toBe(false);
  expect(saveSession).not.toHaveBeenCalled();
});

test('removeLabel removes existing label', async () => {
  const session = { ...mockSession(), labels: ['priority', 'work'] };
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const result = await removeLabel('work', 'priority');
  expect(result.removed).toBe(true);
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ labels: ['work'] }));
});

test('removeLabel returns removed false if label not found', async () => {
  const session = mockSession();
  loadSession.mockResolvedValue(session);

  const result = await removeLabel('work', 'missing');
  expect(result.removed).toBe(false);
  expect(saveSession).not.toHaveBeenCalled();
});

test('listLabels returns labels array', async () => {
  const session = { ...mockSession(), labels: ['a', 'b'] };
  loadSession.mockResolvedValue(session);

  const labels = await listLabels('work');
  expect(labels).toEqual(['a', 'b']);
});

test('formatLabels formats labels correctly', () => {
  expect(formatLabels(['a', 'b'])).toBe('[a] [b]');
  expect(formatLabels([])).toBe('(no labels)');
});
