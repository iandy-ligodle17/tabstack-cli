const { loadSession, saveSession } = require('../storage');

/**
 * Randomly shuffle the tabs in a session.
 * @param {string} name - session name
 * @param {object} options
 * @param {number} [options.seed] - optional numeric seed for deterministic shuffle
 * @returns {object} updated session
 */
function shuffleTabs(tabs, seed) {
  const arr = [...tabs];
  let random;

  if (seed !== undefined) {
    // simple seeded LCG pseudo-random
    let s = seed >>> 0;
    random = () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  } else {
    random = Math.random;
  }

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

async function shuffleSession(name, options = {}) {
  const session = await loadSession(name);

  if (!session.tabs || session.tabs.length === 0) {
    throw new Error(`Session "${name}" has no tabs to shuffle.`);
  }

  const shuffled = shuffleTabs(session.tabs, options.seed);
  const updated = {
    ...session,
    tabs: shuffled,
    updatedAt: new Date().toISOString(),
  };

  await saveSession(name, updated);
  return updated;
}

module.exports = { shuffleSession, shuffleTabs };
