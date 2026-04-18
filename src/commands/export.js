const { loadSession, listSessions } = require('../storage');
const fs = require('fs');
const path = require('path');

async function exportSession(sessionName, outputPath, options = {}) {
  if (!sessionName) {
    throw new Error('Session name is required');
  }

  const tabs = await loadSession(sessionName);
  if (!tabs || tabs.length === 0) {
    throw new Error(`Session "${sessionName}" not found or is empty`);
  }

  const format = options.format || 'json';
  let content;

  if (format === 'json') {
    content = JSON.stringify({ session: sessionName, tabs, exportedAt: new Date().toISOString() }, null, 2);
  } else if (format === 'text') {
    content = tabs.map(tab => tab.url).join('\n');
  } else if (format === 'markdown') {
    const lines = [`# Session: ${sessionName}`, ''];
    tabs.forEach((tab, i) => {
      lines.push(`${i + 1}. [${tab.title || tab.url}](${tab.url})`);
    });
    content = lines.join('\n');
  } else {
    throw new Error(`Unsupported format: ${format}. Use json, text, or markdown`);
  }

  const ext = format === 'markdown' ? 'md' : format === 'text' ? 'txt' : 'json';
  const resolvedPath = outputPath || path.join(process.cwd(), `${sessionName}.${ext}`);

  fs.writeFileSync(resolvedPath, content, 'utf8');
  return { path: resolvedPath, tabCount: tabs.length, format };
}

module.exports = { exportSession };
