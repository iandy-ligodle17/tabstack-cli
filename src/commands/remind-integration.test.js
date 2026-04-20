const { setReminder, getReminders, clearReminder, checkDueReminders, formatReminders } = require('./remind');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(reminders = []) {
  return { name: 'research', tabs: ['https://example.com'], reminders };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('full lifecycle: set → list → check → clear', () => {
  const session = makeSession();
  loadSession.mockReturnValue(session);
  saveSession.mockImplementation((name, data) => {
    Object.assign(session, data);
  });

  const past = new Date(Date.now() - 10000).toISOString();
  const r = setReminder('research', 'Check citations', past);
  expect(r.triggered).toBe(false);

  const reminders = getReminders('research');
  expect(reminders).toHaveLength(1);

  const due = checkDueReminders('research');
  expect(due).toHaveLength(1);
  expect(session.reminders[0].triggered).toBe(true);

  const formatted = formatReminders(session.reminders);
  expect(formatted).toContain('[done]');

  clearReminder('research', r.id);
  expect(session.reminders).toHaveLength(0);
});

test('future reminder is not triggered by checkDueReminders', () => {
  const session = makeSession();
  loadSession.mockReturnValue(session);
  saveSession.mockImplementation((name, data) => Object.assign(session, data));

  const future = new Date(Date.now() + 60000).toISOString();
  setReminder('research', 'Future task', future);

  const due = checkDueReminders('research');
  expect(due).toHaveLength(0);
  expect(session.reminders[0].triggered).toBe(false);
});

test('multiple reminders: only past ones are triggered', () => {
  const past = new Date(Date.now() - 5000).toISOString();
  const future = new Date(Date.now() + 5000).toISOString();
  const session = makeSession([
    { id: 1, message: 'Past', date: past, triggered: false },
    { id: 2, message: 'Future', date: future, triggered: false }
  ]);
  loadSession.mockReturnValue(session);
  saveSession.mockImplementation((name, data) => Object.assign(session, data));

  const due = checkDueReminders('research');
  expect(due).toHaveLength(1);
  expect(due[0].id).toBe(1);
  expect(session.reminders.find(r => r.id === 2).triggered).toBe(false);
});
