# quota

Check how many sessions and tabs you have relative to configured limits.

## Usage

```
tabstack quota [session-name] [--json]
```

## Arguments

| Argument | Description |
|---|---|
| `session-name` | Optional. Also show tab count for this session. |

## Flags

| Flag | Description |
|---|---|
| `--json` | Output raw JSON instead of formatted text. |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `TABSTACK_MAX_SESSIONS` | `50` | Maximum number of saved sessions allowed. |
| `TABSTACK_MAX_TABS` | `200` | Maximum tabs allowed per session. |

## Examples

```bash
# Check overall session quota
tabstack quota

# Check quota and tab count for a specific session
tabstack quota work

# Output as JSON (useful for scripting)
tabstack quota --json
```

## Exit Codes

- `0` — All limits are within range.
- `1` — One or more limits exceeded.
