const { addNote, getNotes, clearNotes, removeNote } = require('./notes');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const mockSession = () => ({ tabs: ['https://example.com'], notes: [] });

beforeEach(() => jest.clearAllMocks());

test('addNote appends a note to session', async () => {
  const session = mockSession();
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();

  const notes = await addNote('work', 'remember this');
  expect(notes).toHaveLength(1);
  expect(notes[0].text).toBe('remember this');
  expect(notes[0].createdAt).toBeDefined();
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ notes }));
});

test('getNotes returns notes from session', async () => {
  loadSession.mockResolvedValue({ tabs: [], notes: [{ text: 'hi', createdAt: '2024-01-01' }] });
  const notes = await getNotes('work');
  expect(notes).toHaveLength(1);
  expect(notes[0].text).toBe('hi');
});

test('getNotes returns empty array if no notes', async () => {
  loadSession.mockResolvedValue({ tabs: [] });
  const notes = await getNotes('work');
  expect(notes).toEqual([]);
});

test('clearNotes empties notes array', async () => {
  const session = { tabs: [], notes: [{ text: 'old' }] };
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  await clearNotes('work');
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ notes: [] }));
});

test('removeNote removes note at index', async () => {
  const session = { tabs: [], notes: [{ text: 'a' }, { text: 'b' }] };
  loadSession.mockResolvedValue(session);
  saveSession.mockResolvedValue();
  const notes = await removeNote('work', 0);
  expect(notes).toHaveLength(1);
  expect(notes[0].text).toBe('b');
});

test('removeNote throws on invalid index', async () => {
  loadSession.mockResolvedValue({ tabs: [], notes: [] });
  await expect(removeNote('work', 5)).rejects.toThrow('out of range');
});

test('addNote throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(addNote('missing', 'note')).rejects.toThrow('not found');
});
