const { loadSession, saveSession } = require('../storage');

/**
 * Sort tabs in a session by a given field
 * @param {string} name - session name
 * @param {string} by - field to sort by: 'url', 'title', or 'domain'
 * @returns {object} updated session
 */
async function sortSession(name, by = 'url') {
  const validFields = ['url', 'title', 'domain'];
  if (!validFields.includes(by)) {
    throw new Error(`Invalid sort field "${by}". Valid options: ${validFields.join(', ')}`);
  }

  const session = await loadSession(name);

  const sorted = [...session.tabs].sort((a, b) => {
    let valA, valB;
    if (by === 'domain') {
      valA = extractDomain(a.url);
      valB = extractDomain(b.url);
    } else {
      valA = (a[by] || '').toLowerCase();
      valB = (b[by] || '').toLowerCase();
    }
    return valA.localeCompare(valB);
  });

  const updated = { ...session, tabs: sorted };
  await saveSession(name, updated);
  return updated;
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

module.exports = { sortSession, extractDomain };
