const { loadSession, saveSession } = require('../storage');

async function addNote(sessionName, note) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  if (!session.notes) session.notes = [];
  session.notes.push({ text: note, createdAt: new Date().toISOString() });
  await saveSession(sessionName, session);
  return session.notes;
}

async function getNotes(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  return session.notes || [];
}

async function clearNotes(sessionName) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  session.notes = [];
  await saveSession(sessionName, session);
}

async function removeNote(sessionName, index) {
  const session = await loadSession(sessionName);
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  const notes = session.notes || [];
  if (index < 0 || index >= notes.length) throw new Error(`Note index ${index} out of range`);
  notes.splice(index, 1);
  session.notes = notes;
  await saveSession(sessionName, session);
  return notes;
}

module.exports = { addNote, getNotes, clearNotes, removeNote };
