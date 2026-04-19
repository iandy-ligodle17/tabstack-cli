const { loadSession, saveSession } = require('../storage');
const { getTabs } = require('../browser');

const DEFAULT_INTERVAL = 60; // seconds

async function watchSession(name, options = {}) {
  const interval = (options.interval || DEFAULT_INTERVAL) * 1000;
  const silent = options.silent || false;

  if (!name) throw new Error('Session name is required');

  if (!silent) console.log(`Watching session "${name}" every ${options.interval || DEFAULT_INTERVAL}s...`);

  let lastCount = null;

  const tick = async () => {
    try {
      const tabs = await getTabs();
      const existing = await loadSession(name).catch(() => null);

      const changed = !existing || JSON.stringify(existing.tabs) !== JSON.stringify(tabs);

      if (changed) {
        const session = {
          name,
          tabs,
          updatedAt: new Date().toISOString(),
          createdAt: existing ? existing.createdAt : new Date().toISOString(),
          tags: existing ? existing.tags : [],
          notes: existing ? existing.notes : ''
        };
        await saveSession(name, session);
        if (!silent) console.log(`[${new Date().toLocaleTimeString()}] Updated "${name}" — ${tabs.length} tabs`);
        lastCount = tabs.length;
      } else {
        if (!silent) console.log(`[${new Date().toLocaleTimeString()}] No changes (${lastCount ?? tabs.length} tabs)`);
      }
    } catch (err) {
      console.error(`Watch error: ${err.message}`);
    }
  };

  await tick();
  const timer = setInterval(tick, interval);

  return {
    stop: () => {
      clearInterval(timer);
      if (!silent) console.log(`Stopped watching "${name}"`);
    }
  };
}

module.exports = { watchSession };
