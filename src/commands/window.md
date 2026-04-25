# window

Split a session's tabs across multiple browser windows.

## Usage

```
tabstack window <session> --size <n>
tabstack window <session> --get <index>
tabstack window <session> --assign <json>
```

## Options

| Flag | Description |
|------|-------------|
| `--size <n>` | Split tabs into windows of `n` tabs each |
| `--get <index>` | Print tabs in window at the given index (0-based) |
| `--assign <json>` | Assign named windows via a JSON map of `{ name: [urls] }` |

## Examples

```bash
# Split "work" session into windows of 5 tabs
tabstack window work --size 5

# Show the second window
tabstack window work --get 1

# Assign named windows
tabstack window work --assign '{"research":["https://example.com"]}'
```

## Notes

- When `--size` is used, the output shows each window group with its tabs.
- Window assignments are stored in the session file under `windowMap`.
- Indices are zero-based when using `--get`.
