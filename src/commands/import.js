const fs = require('fs');
const path = require('path');
const { saveSession } = require('../storage');

async function importSession(filePath, options = {}) {
  if (!filePath) {
    throw new Error('File path is required');
  }

  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  let data;
  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse file: ${err.message}`);
  }

  if (!data.name || !Array.isArray(data.tabs)) {
    throw new Error('Invalid session file format. Expected { name, tabs, ... }');
  }

  const sessionName = options.name || data.name;

  if (!sessionName || sessionName.trim() === '') {
    throw new Error('Session name cannot be empty');
  }

  const session = {
    name: sessionName,
    tabs: data.tabs,
    createdAt: data.createdAt || new Date().toISOString(),
    importedAt: new Date().toISOString(),
    importedFrom: resolvedPath,
  };

  await saveSession(sessionName, session);

  return { sessionName, tabCount: session.tabs.length };
}

module.exports = { importSession };
