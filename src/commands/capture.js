import { getTabs } from '../browser.js';
import { saveSession, ensureSessionsDir } from '../storage.js';

/**
 * Captures the current browser tabs and saves them as a named session.
 * @param {string} name - The session name
 * @returns {Promise<{ name: string, count: number, path: string }>}
 */
export async function captureSession(name) {
  await ensureSessionsDir();

  const tabs = await getTabs();

  if (!tabs || tabs.length === 0) {
    throw new Error('No tabs found. Make sure your browser is open.');
  }

  const savedPath = await saveSession(name, tabs);

  return {
    name,
    count: tabs.length,
    path: savedPath,
  };
}

/**
 * CLI handler for the capture command.
 * @param {string} name
 */
export async function handleCapture(name) {
  if (!name || name.trim() === '') {
    console.error('Error: session name is required');
    process.exit(1);
  }

  try {
    const result = await captureSession(name.trim());
    console.log(`✓ Saved ${result.count} tab(s) to session "${result.name}"`);
  } catch (err) {
    console.error(`Error capturing session: ${err.message}`);
    process.exit(1);
  }
}
