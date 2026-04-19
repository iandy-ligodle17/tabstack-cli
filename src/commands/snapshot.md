# Snapshot Command

The `snapshot` feature allows you to take point-in-time captures of your current browser tabs, separate from named sessions.

## Usage

### Take a snapshot
```bash
tabstack-snapshot take <name>
tabstack-snapshot take work --count 3 --interval 60
```
- `--count` — how many snapshots to take (default: 1)
- `--interval` — seconds between snapshots (default: 30)

### List snapshots
```bash
tabstack-snapshot list <name>
```
Lists all snapshots associated with a parent session name.

### Restore a snapshot
```bash
tabstack-snapshot restore <snapshotName>
```
Opens the tabs from a specific snapshot (e.g. `work_snap_2`).

## Storage Format

Snapshots are stored like regular sessions but include a `meta` block:
```json
{
  "name": "work_snap_1",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "tabs": [...],
  "meta": {
    "isSnapshot": true,
    "parentName": "work",
    "index": 1,
    "total": 3
  }
}
```

## Notes
- Snapshots follow the naming pattern `<name>_snap_<index>`
- They are stored alongside regular sessions in the sessions directory
- Use `tabstack list` to see all sessions including snapshots
