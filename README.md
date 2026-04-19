# tabstack-cli

> CLI tool to save and restore browser tab sessions from the terminal

## Installation

```bash
npm install -g tabstack-cli
```

## Usage

Save your current browser tabs to a named session:

```bash
tabstack save my-session
```

List all saved sessions:

```bash
tabstack list
```

Restore a session:

```bash
tabstack restore my-session
```

Remove a session:

```bash
tabstack delete my-session
```

Rename a session:

```bash
tabstack rename my-session new-name
```

Sessions are stored locally as JSON files in `~/.tabstack/sessions/`.

## Supported Browsers

- Google Chrome
- Mozilla Firefox
- Microsoft Edge

## Requirements

- Node.js >= 14.x
- A supported browser installed locally

## License

MIT © [tabstack-cli contributors](https://github.com/tabstack-cli/tabstack-cli)
