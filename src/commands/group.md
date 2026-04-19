# group command

Group tabs within a session by assigning them a named group label.

## Usage

```
tabstack group <session> --name <group-name> --indices <i1,i2,...>
tabstack group <session> --list
tabstack group <session> --ungroup <group-name>
```

## Options

| Flag | Description |
|------|-------------|
| `--name` | Name of the group to assign |
| `--indices` | Comma-separated zero-based tab indices |
| `--list` | List all groups and their tabs |
| `--ungroup` | Remove group label from all tabs in a group |

## Examples

```bash
# Group first two tabs under "dev"
tabstack group work --name dev --indices 0,1

# List all groups in a session
tabstack group work --list

# Remove the "dev" group label
tabstack group work --ungroup dev
```

## Notes

- Groups are stored as metadata on each tab and do not affect restore behavior.
- Ungrouped tabs appear under `(ungrouped)` when listing.
- Indices are zero-based and validated before saving.
