const { loadSession, saveSession } = require('../storage');

/**
 * Mask sensitive parts of URLs in a session (passwords, tokens, API keys in query strings)
 */
function maskUrl(url) {
  try {
    const parsed = new URL(url);
    const sensitiveKeys = ['token', 'key', 'secret', 'password', 'passwd', 'api_key', 'apikey', 'access_token', 'auth'];
    let masked = false;
    for (const [param] of parsed.searchParams) {
      if (sensitiveKeys.some(k => param.toLowerCase().includes(k))) {
        parsed.searchParams.set(param, '***');
        masked = true;
      }
    }
    if (parsed.password) {
      parsed.password = '***';
      masked = true;
    }
    return { url: parsed.toString(), masked };
  } catch {
    return { url, masked: false };
  }
}

function maskSession(session) {
  let count = 0;
  const tabs = session.tabs.map(tab => {
    const { url, masked } = maskUrl(tab.url);
    if (masked) count++;
    return { ...tab, url };
  });
  return { session: { ...session, tabs }, maskedCount: count };
}

function formatMaskResult(name, maskedCount) {
  if (maskedCount === 0) {
    return `No sensitive parameters found in session "${name}".`;
  }
  return `Masked ${maskedCount} sensitive URL parameter(s) in session "${name}".`;
}

async function mask(name, { save = false } = {}) {
  const session = await loadSession(name);
  const { session: maskedSession, maskedCount } = maskSession(session);
  if (save && maskedCount > 0) {
    await saveSession(name, maskedSession);
  }
  return { session: maskedSession, maskedCount };
}

module.exports = { mask, maskUrl, maskSession, formatMaskResult };
