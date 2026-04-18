const { getTabs } = require('../browser');
const { saveSession } = require('../storage');

async function captureCommand(sessionName, options = {}) {
  const browser = options.browser || 'chrome';

  if (!sessionName || typeof sessionName !== 'string') {
    throw new Error('Session name is required');
  }

  console.log(`Capturing tabs from ${browser}...`);

  let urls;
  try {
    urls = await getTabs(browser);
  } catch (err) {
    throw new Error(`Could not read tabs: ${err.message}`);
  }

  if (urls.length === 0) {
    console.warn('No open tabs found. Session not saved.');
    return null;
  }

  const session = {
    name: sessionName,
    browser,
    urls,
    createdAt: new Date().toISOString(),
  };

  await saveSession(sessionName, session);
  console.log(`Saved session "${sessionName}" with ${urls.length} tab(s).`);
  return session;
}

module.exports = { captureCommand };
