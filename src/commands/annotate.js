/**
 * annotate.js — add or view inline annotations on individual tabs within a session
 *
 * Annotations are stored as a map keyed by tab URL inside the session JSON:
 *   session.annotations = { "https://example.com": "check this later" }
 */

const { loadSession, saveSession } = require('../storage');

/**
 * Add or update an annotation for a specific tab URL in a session.
 *
 * @param {string} sessionName
 * @param {string} url - the tab URL to annotate
 * @param {string} note - the annotation text
 * @returns {object} updated session
 */
async function annotateTab(sessionName, url, note) {
  const session = await loadSession(sessionName);

  const tabExists = session.tabs.some(t => t.url === url);
  if (!tabExists) {
    throw new Error(`No tab with URL "${url}" found in session "${sessionName}"`);
  }

  if (!session.annotations) {
    session.annotations = {};
  }

  session.annotations[url] = note;
  await saveSession(sessionName, session);
  return session;
}

/**
 * Remove the annotation for a specific tab URL.
 *
 * @param {string} sessionName
 * @param {string} url
 * @returns {object} updated session
 */
async function removeAnnotation(sessionName, url) {
  const session = await loadSession(sessionName);

  if (!session.annotations || !session.annotations[url]) {
    throw new Error(`No annotation found for URL "${url}" in session "${sessionName}"`);
  }

  delete session.annotations[url];
  await saveSession(sessionName, session);
  return session;
}

/**
 * Retrieve all annotations for a session.
 *
 * @param {string} sessionName
 * @returns {{ url: string, annotation: string }[]}
 */
async function getAnnotations(sessionName) {
  const session = await loadSession(sessionName);
  const annotations = session.annotations || {};

  return Object.entries(annotations).map(([url, annotation]) => ({
    url,
    annotation,
  }));
}

/**
 * Format annotations for display in the terminal.
 *
 * @param {{ url: string, annotation: string }[]} annotations
 * @param {string} sessionName
 * @returns {string}
 */
function formatAnnotations(annotations, sessionName) {
  if (annotations.length === 0) {
    return `No annotations in session "${sessionName}".`;
  }

  const lines = [`Annotations for "${sessionName}":`, ''];
  for (const { url, annotation } of annotations) {
    lines.push(`  ${url}`);
    lines.push(`    → ${annotation}`);
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

module.exports = { annotateTab, removeAnnotation, getAnnotations, formatAnnotations };
