# share

Generate a shareable link for a saved tab session.

## Usage

```
tabstack share <session-name> [options]
```

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output result as JSON |
| `--base-url <url>` | Custom base URL for the share link |

## Examples

```bash
# Share a session
tabstack share work

# Output as JSON
tabstack share work --json

# Use custom base URL
tabstack share work --base-url https://myapp.io/share
```

## Output

```
Session: work
Tabs: 5
Link: https://tabstack.app/share?data=eyJuYW1lIjoid29yayIsInRhYnMiOi4uLn0
```

## Notes

- The link encodes the session as base64url in the query string
- Tags and tab metadata are included in the encoded payload
- No server-side storage is used — the data lives in the URL
