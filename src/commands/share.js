const { loadSession } = require('../storage');

function generateShareableLink(session, baseUrl = 'https://tabstack.app/share') {
  const data = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${baseUrl}?data=${data}`;
}

function encodeSessionForShare(session) {
  return {
    name: session.name,
    tabs: session.tabs,
    tags: session.tags || [],
    createdAt: session.createdAt,
  };
}

async function shareSession(name, options = {}) {
  const session = await loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }

  const payload = encodeSessionForShare(session);
  const link = generateShareableLink(payload, options.baseUrl);

  if (options.json) {
    return { link, tabCount: session.tabs.length, name: session.name };
  }

  const lines = [
    `Session: ${session.name}`,
    `Tabs: ${session.tabs.length}`,
    `Link: ${link}`,
  ];

  return lines.join('\n');
}

module.exports = { shareSession, generateShareableLink, encodeSessionForShare };
