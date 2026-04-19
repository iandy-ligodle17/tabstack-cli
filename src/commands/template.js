const { loadSession, saveSession, listSessions } = require('../storage');

async function saveTemplate(sessionName, templateName) {
  const session = await loadSession(sessionName);
  const template = {
    name: templateName,
    tabs: session.tabs,
    createdAt: new Date().toISOString(),
    isTemplate: true,
  };
  await saveSession(`__template__${templateName}`, template);
  return template;
}

async function loadTemplate(templateName) {
  const session = await loadSession(`__template__${templateName}`);
  if (!session.isTemplate) {
    throw new Error(`'${templateName}' is not a template`);
  }
  return session;
}

async function listTemplates() {
  const all = await listSessions();
  return all
    .filter(name => name.startsWith('__template__'))
    .map(name => name.replace('__template__', ''));
}

async function applyTemplate(templateName, newSessionName) {
  const template = await loadTemplate(templateName);
  const newSession = {
    name: newSessionName,
    tabs: template.tabs,
    createdAt: new Date().toISOString(),
  };
  await saveSession(newSessionName, newSession);
  return newSession;
}

async function deleteTemplate(templateName) {
  const { deleteSession } = require('../storage');
  await deleteSession(`__template__${templateName}`);
}

module.exports = { saveTemplate, loadTemplate, listTemplates, applyTemplate, deleteTemplate };
