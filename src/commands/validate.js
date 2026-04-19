const { loadSession } = require('../storage');

function validateSession(session) {
  const errors = [];
  const warnings = [];

  if (!session || typeof session !== 'object') {
    errors.push('Session data is invalid or corrupted');
    return { valid: false, errors, warnings };
  }

  if (!Array.isArray(session.tabs)) {
    errors.push('Session is missing tabs array');
  } else {
    if (session.tabs.length === 0) {
      warnings.push('Session has no tabs');
    }

    session.tabs.forEach((tab, i) => {
      if (!tab.url) {
        errors.push(`Tab ${i + 1} is missing a URL`);
      } else {
        try {
          new URL(tab.url);
        } catch {
          errors.push(`Tab ${i + 1} has an invalid URL: ${tab.url}`);
        }
      }
      if (!tab.title) {
        warnings.push(`Tab ${i + 1} is missing a title`);
      }
    });
  }

  if (!session.createdAt) {
    warnings.push('Session is missing createdAt timestamp');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

async function validateCommand(name) {
  const session = await loadSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found`);
  }
  const result = validateSession(session);
  return result;
}

module.exports = { validateSession, validateCommand };
