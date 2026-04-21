# swap

Swap two tabs by their zero-based index positions within a saved session.

## Usage

```
tabstack swap <session> <indexA> <indexB>
```

## Arguments

| Argument  | Description                              |
|-----------|------------------------------------------|
| `session` | Name of the session to modify            |
| `indexA`  | Zero-based index of the first tab        |
| `indexB`  | Zero-based index of the second tab       |

## Examples

```bash
# Swap the first and fourth tab in the "work" session
tabstack swap work 0 3

# Swap tabs at positions 1 and 2
tabstack swap research 1 2
```

## Output

```
Swapped tabs in "work":
  [0] GitHub
  [3] Notion
```

## Notes

- Indices are zero-based.
- Swapping a tab with itself is a no-op and produces no output change.
- The session file is updated in place after the swap.
- Use `tabstack list` to view current tab indices before swapping.
