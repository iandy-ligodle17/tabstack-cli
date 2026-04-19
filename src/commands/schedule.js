const { loadSession, saveSession } = require('../storage');

function parseSchedule(cronLike) {
  const parts = cronLike.split(' ');
  if (parts.length !== 2) throw new Error('Schedule format: <HH:MM> <daily|weekdays|weekends>');
  const [time, freq] = parts;
  const [hour, minute] = time.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) throw new Error('Invalid time format, use HH:MM');
  const validFreqs = ['daily', 'weekdays', 'weekends'];
  if (!validFreqs.includes(freq)) throw new Error(`Frequency must be one of: ${validFreqs.join(', ')}`);
  return { hour, minute, frequency: freq };
}

function scheduleSession(name, cronLike) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);

  const schedule = parseSchedule(cronLike);
  session.schedule = schedule;
  session.scheduledAt = new Date().toISOString();
  saveSession(name, session);

  return { name, schedule };
}

function clearSchedule(name) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  if (!session.schedule) throw new Error(`Session "${name}" has no schedule`);

  delete session.schedule;
  delete session.scheduledAt;
  saveSession(name, session);

  return { name };
}

function getSchedule(name) {
  const session = loadSession(name);
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.schedule || null;
}

module.exports = { scheduleSession, clearSchedule, getSchedule, parseSchedule };
