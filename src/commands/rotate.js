const { loadSession, saveSession } = require('../storage');

/**
 * Rotate tabs in a session by shifting them left or right by N positions.
 * @param {string} sessionName
 * @param {number} steps - positive = rotate right, negative = rotate left
 * @returns {object} updated session
 */
function rotateTabs(session, steps) {
  if (!session || !Array.isArray(session.tabs) || session.tabs.length === 0) {
    throw new Error('Session has no tabs to rotate');
  }

  const len = session.tabs.length;
  const normalizedSteps = ((steps % len) + len) % len;

  const rotated = [
    ...session.tabs.slice(len - normalizedSteps),
    ...session.tabs.slice(0, len - normalizedSteps),
  ];

  return { ...session, tabs: rotated };
}

/**
 * Load a session, rotate its tabs, and save it back.
 * @param {string} sessionName
 * @param {number} steps
 * @returns {object} result with session and steps applied
 */
async function rotateSession(sessionName, steps) {
  if (typeof steps !== 'number' || !Number.isInteger(steps)) {
    throw new Error('Steps must be an integer');
  }

  const session = await loadSession(sessionName);
  if (!session) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  const rotated = rotateTabs(session, steps);
  await saveSession(sessionName, rotated);

  return {
    session: rotated,
    stepsApplied: steps,
    tabCount: rotated.tabs.length,
  };
}

function formatRotateResult(result) {
  const dir = result.stepsApplied >= 0 ? 'right' : 'left';
  const abs = Math.abs(result.stepsApplied);
  return `Rotated ${result.tabCount} tab(s) ${dir} by ${abs} step(s).`;
}

module.exports = { rotateTabs, rotateSession, formatRotateResult };
