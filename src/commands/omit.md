# omit

Remove specific tabs from a session by their index.

## Usage

```
tabstack omit <session> <index1> [index2 ...] [--output <name>]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `session` | Name of the session to modify |
| `index1 ...` | One or more 0-based tab indices to remove |

## Options

| Option | Description |
|--------|-------------|
| `--output <name>` | Save the result as a new session (original is unchanged) |

## Examples

Remove the third tab (index 2) from the `work` session:
```
tabstack omit work 2
```

Remove multiple tabs:
```
tabstack omit work 0 3 5
```

Save the result to a new session without modifying the original:
```
tabstack omit work 1 4 --output work-cleaned
```

## Notes

- Indices are 0-based (first tab is index 0).
- Use `tabstack info <session>` to see tab indices before omitting.
- If `--output` is not specified, the original session is overwritten.
