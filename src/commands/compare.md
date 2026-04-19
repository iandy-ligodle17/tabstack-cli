# compare

Compare two saved sessions to see which tabs differ between them.

## Usage

```
tabstack compare <session1> <session2>
```

## Output

The command shows three sections:

- **Shared tabs** — tabs present in both sessions
- **Only in session1** — tabs unique to the first session
- **Only in session2** — tabs unique to the second session

If both sessions contain exactly the same URLs, it reports that the sessions are identical.

## Example

```
$ tabstack compare work home
Comparing "work" vs "home"
  Shared tabs: 3

Only in "work" (2):
  - GitHub
  - Jira Board

Only in "home" (1):
  - Netflix
```

## Notes

- Comparison is based on tab URLs only
- Tab titles are shown in output but not used for matching
