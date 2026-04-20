const { loadSession, saveSession } = require('../storage');

const REMIND_KEY = 'reminders';

function setReminder(sessionName, message, dateStr) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Invalid date: "${dateStr}"`);

  if (!session[REMIND_KEY]) session[REMIND_KEY] = [];

  const reminder = {
    id: Date.now(),
    message,
    date: date.toISOString(),
    created: new Date().toISOString(),
    triggered: false
  };

  session[REMIND_KEY].push(reminder);
  saveSession(sessionName, session);
  return reminder;
}

function getReminders(sessionName) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  return session[REMIND_KEY] || [];
}

function clearReminder(sessionName, reminderId) {
  const session = loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  const before = (session[REMIND_KEY] || []).length;
  session[REMIND_KEY] = (session[REMIND_KEY] || []).filter(r => r.id !== reminderId);

  if (session[REMIND_KEY].length === before) throw new Error(`Reminder ${reminderId} not found`);
  saveSession(sessionName, session);
  return true;
}

function formatReminders(reminders) {
  if (!reminders.length) return 'No reminders set.';
  return reminders.map(r => {
    const date = new Date(r.date);
    const status = r.triggered ? '[done]' : '[pending]';
    return `  [${r.id}] ${status} ${date.toLocaleString()} — ${r.message}`;
  }).join('\n');
}

function checkDueReminders(sessionName) {
  const session = loadSession(sessionName);
  if (!session) return [];

  const now = new Date();
  const due = (session[REMIND_KEY] || []).filter(r => !r.triggered && new Date(r.date) <= now);

  if (due.length) {
    due.forEach(r => { r.triggered = true; });
    saveSession(sessionName, session);
  }

  return due;
}

module.exports = { setReminder, getReminders, clearReminder, formatReminders, checkDueReminders };
