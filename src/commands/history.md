# `history` Command

Show recently saved tab sessions sorted by most recently saved.

## Usage

```bash
tabstack history [options]
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-n, --limit <number>` | Max sessions to display | `10` |

## Examples

```bash
# Show last 10 sessions
tabstack history

# Show last 5 sessions
tabstack history --limit 5
```

## Output

```
1. research [dev] — 8 tabs — 1/12/2024, 9:00:00 AM
2. work [work] — 5 tabs — 1/10/2024, 10:00:00 AM
3. personal [home] — 3 tabs — 1/8/2024, 8:00:00 AM
```

## Notes

- Sessions without a `savedAt` timestamp are excluded from history.
- Tags are displayed in brackets if present.
- Sorted strictly by save date, newest first.
