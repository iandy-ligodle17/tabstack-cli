const fs = require('fs');
const path = require('path');
const { loadSession, saveSession } = require('../storage');

function zipSessions(names, outputName, sessionsDir) {
  if (!names || names.length < 2) {
    throw new Error('At least two session names are required to zip');
  }

  const combined = { tabs: [], zipped: [], createdAt: new Date().toISOString() };

  for (const name of names) {
    const session = loadSession(name, sessionsDir);
    if (!session) throw new Error(`Session not found: ${name}`);
    combined.tabs.push(...session.tabs);
    combined.zipped.push({
      name,
      tabCount: session.tabs.length,
      tags: session.tags || [],
    });
  }

  const finalName = outputName || `zip-${Date.now()}`;
  saveSession(finalName, combined, sessionsDir);
  return { name: finalName, session: combined };
}

function formatZipResult(result) {
  const lines = [
    `Zipped session: ${result.name}`,
    `Total tabs: ${result.session.tabs.length}`,
    '',
    'Sources:',
  ];
  for (const src of result.session.zipped) {
    lines.push(`  - ${src.name} (${src.tabCount} tabs)`);
  }
  return lines.join('\n');
}

module.exports = { zipSessions, formatZipResult };
