# `envsnap deps` — Snapshot Dependency Tracking

Track which snapshots depend on others. Useful for understanding relationships between environment configurations (e.g. a staging snapshot that extends a base snapshot).

## Commands

### `envsnap deps add <snapshot> <dependsOn>`

Declare that `<snapshot>` depends on `<dependsOn>`.

```bash
envsnap deps add staging base
# staging now depends on base
```

### `envsnap deps remove <snapshot> <dependsOn>`

Remove a declared dependency.

```bash
envsnap deps remove staging base
```

### `envsnap deps list <snapshot>`

Show all dependencies and dependents for a snapshot.

```bash
envsnap deps list staging
# Snapshot: staging
#   Depends on: base
#   Required by: (none)
```

#### Options

| Flag | Description |
|------|-------------|
| `--deps-only` | Show only what this snapshot depends on |
| `--dependents-only` | Show only snapshots that depend on this one |

## Storage

Dependency data is stored in `.deps.json` inside the snapshots directory. This file is managed automatically and should not be edited by hand.

## Use Cases

- Document that `production` extends `staging`
- Warn before deleting a snapshot that others depend on
- Visualize environment inheritance chains
