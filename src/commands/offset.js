const { loadSession, saveSession } = require('../storage');

/**
 * Shift tab positions by a given offset (positive or negative).
 * Tabs that would fall outside [0, length-1] are clamped or wrapped.
 */
function offsetTabs(tabs, offset, { wrap = false } = {}) {
  if (!tabs || tabs.length === 0) return [];
  const len = tabs.length;
  return tabs.map((tab, i) => {
    let newIndex = i + offset;
    if (wrap) {
      newIndex = ((newIndex % len) + len) % len;
    } else {
      newIndex = Math.max(0, Math.min(len - 1, newIndex));
    }
    return { ...tab, _originalIndex: i, _newIndex: newIndex };
  });
}

function applyOffset(tabs, offset, options) {
  const shifted = offsetTabs(tabs, offset, options);
  const result = new Array(tabs.length);
  // place tabs at their new indices; last write wins on collision
  shifted.forEach(tab => {
    const { _originalIndex, _newIndex, ...clean } = tab;
    result[_newIndex] = clean;
  });
  // fill any gaps with tabs in original order
  let fillIdx = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] === undefined) {
      while (result[fillIdx] !== undefined) fillIdx++;
      result[i] = { ...tabs[fillIdx++] };
    }
  }
  return result;
}

function formatOffsetResult(original, updated, offset) {
  const lines = [`Offset tabs by ${offset > 0 ? '+' : ''}${offset}:`];
  updated.forEach((tab, i) => {
    lines.push(`  [${i}] ${tab.title || tab.url}`);
  });
  lines.push(`Total: ${updated.length} tab(s)`);
  return lines.join('\n');
}

async function offsetCommand(sessionName, offset, options = {}) {
  const session = await loadSession(sessionName);
  if (!session || !session.tabs) throw new Error(`Session "${sessionName}" not found`);

  const updated = applyOffset(session.tabs, offset, options);
  const result = { ...session, tabs: updated };
  await saveSession(sessionName, result);
  return formatOffsetResult(session.tabs, updated, offset);
}

module.exports = { offsetTabs, applyOffset, formatOffsetResult, offsetCommand };
