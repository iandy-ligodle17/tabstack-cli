const { setReminder, getReminders, clearReminder, formatReminders, checkDueReminders } = require('./remind');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

const mockSession = () => ({ name: 'work', tabs: ['https://github.com'] });

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockReturnValue(mockSession());
  saveSession.mockImplementation(() => {});
});

test('setReminder adds a reminder to the session', () => {
  const future = new Date(Date.now() + 60000).toISOString();
  const reminder = setReminder('work', 'Review PRs', future);
  expect(reminder).toHaveProperty('id');
  expect(reminder.message).toBe('Review PRs');
  expect(reminder.triggered).toBe(false);
  expect(saveSession).toHaveBeenCalled();
});

test('setReminder throws on unknown session', () => {
  loadSession.mockReturnValue(null);
  expect(() => setReminder('ghost', 'hi', new Date().toISOString())).toThrow('not found');
});

test('setReminder throws on invalid date', () => {
  expect(() => setReminder('work', 'hi', 'not-a-date')).toThrow('Invalid date');
});

test('getReminders returns reminders list', () => {
  const session = mockSession();
  session.reminders = [{ id: 1, message: 'test', triggered: false }];
  loadSession.mockReturnValue(session);
  const result = getReminders('work');
  expect(result).toHaveLength(1);
});

test('getReminders returns empty array when none set', () => {
  expect(getReminders('work')).toEqual([]);
});

test('clearReminder removes a reminder by id', () => {
  const session = mockSession();
  session.reminders = [{ id: 42, message: 'old', triggered: false }];
  loadSession.mockReturnValue(session);
  const result = clearReminder('work', 42);
  expect(result).toBe(true);
  expect(saveSession).toHaveBeenCalled();
});

test('clearReminder throws when id not found', () => {
  expect(() => clearReminder('work', 999)).toThrow('not found');
});

test('formatReminders returns message when empty', () => {
  expect(formatReminders([])).toBe('No reminders set.');
});

test('formatReminders formats reminders correctly', () => {
  const reminders = [{ id: 1, message: 'Stand-up', date: new Date().toISOString(), triggered: false }];
  const output = formatReminders(reminders);
  expect(output).toContain('Stand-up');
  expect(output).toContain('[pending]');
});

test('checkDueReminders marks past reminders as triggered', () => {
  const past = new Date(Date.now() - 5000).toISOString();
  const session = mockSession();
  session.reminders = [{ id: 1, message: 'overdue', date: past, triggered: false }];
  loadSession.mockReturnValue(session);
  const due = checkDueReminders('work');
  expect(due).toHaveLength(1);
  expect(saveSession).toHaveBeenCalled();
});
