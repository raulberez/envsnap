# `envsnap lock`

Lock or unlock snapshots to prevent accidental modification, deletion, or overwrite.

## Subcommands

### `lock add <name>`

Lock a snapshot by name.

**Options:**
- `-r, --reason <reason>` — Optional reason for locking

**Example:**
```bash
envsnap lock add production --reason "stable release"
```

---

### `lock remove <name>`

Unlock a previously locked snapshot.

**Example:**
```bash
envsnap lock remove production
```

---

### `lock list`

List all currently locked snapshots with their reasons and lock timestamps.

**Example:**
```bash
envsnap lock list
```

**Output:**
```
  🔒 production — stable release (locked at 2024-06-01T10:00:00.000Z)
  🔒 staging (locked at 2024-06-02T08:30:00.000Z)
```

---

### `lock status <name>`

Check whether a specific snapshot is locked.

**Example:**
```bash
envsnap lock status production
```

---

## Notes

- Lock data is stored in `.locks.json` inside the snapshots directory.
- Other commands (restore, rename, delete) should check `isLocked()` before modifying a snapshot.
