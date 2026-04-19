const { saveSession } = require('../storage');

function decodeShareableLink(link) {
  const url = new URL(link);
  const data = url.searchParams.get('data');
  if (!data) {
    throw new Error('Invalid share link: missing data parameter');
  }
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid share link: could not decode data');
  }
}

async function importFromLink(link, options = {}) {
  const session = decodeShareableLink(link);
  const name = options.name || session.name;

  if (!name) {
    throw new Error('Could not determine session name; use --name to specify one');
  }

  const toSave = { ...session, name };
  await saveSession(name, toSave);

  return {
    name,
    tabCount: session.tabs ? session.tabs.length : 0,
  };
}

module.exports = { decodeShareableLink, importFromLink };
