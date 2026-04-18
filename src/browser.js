const { exec } = require('child_process');
const os = require('os');

const BROWSER_COMMANDS = {
  darwin: {
    chrome: `osascript -e 'tell application "Google Chrome" to get URL of tabs of windows'`,
    firefox: `osascript -e 'tell application "Firefox" to get URL of tabs of windows'`,
  },
  linux: {
    chrome: `xdotool search --name "Google Chrome" getwindowname`,
  },
};

function getPlatform() {
  return os.platform();
}

function getTabs(browser = 'chrome') {
  return new Promise((resolve, reject) => {
    const platform = getPlatform();
    const cmd = BROWSER_COMMANDS[platform]?.[browser];

    if (!cmd) {
      return reject(new Error(`Unsupported platform/browser combo: ${platform}/${browser}`));
    }

    exec(cmd, (err, stdout) => {
      if (err) return reject(new Error(`Failed to get tabs: ${err.message}`));
      const urls = parseTabOutput(stdout.trim());
      resolve(urls);
    });
  });
}

function parseTabOutput(output) {
  if (!output) return [];
  return output
    .split(/[,\n]+/)
    .map(u => u.trim().replace(/^"|"$/g, ''))
    .filter(u => u.startsWith('http://') || u.startsWith('https://'));
}

function openTabs(urls) {
  const platform = getPlatform();
  return Promise.all(
    urls.map(url => {
      return new Promise((resolve, reject) => {
        let cmd;
        if (platform === 'darwin') {
          cmd = `open "${url}"`;
        } else if (platform === 'linux') {
          cmd = `xdg-open "${url}"`;
        } else {
          return reject(new Error(`Unsupported platform: ${platform}`));
        }
        exec(cmd, err => (err ? reject(err) : resolve()));
      });
    })
  );
}

module.exports = { getTabs, openTabs, parseTabOutput, getPlatform };
