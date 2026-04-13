# `envsnap label`

Manage human-readable labels for snapshots. Labels are short descriptive strings that make it easier to identify snapshots at a glance.

## Subcommands

### `label set <snapshot> <label>`

Assign a label to a named snapshot.

```bash
envsnap label set my-snap "production baseline"
# Label set: my-snap → "production baseline"
```

### `label get <snapshot>`

Retrieve the label for a snapshot.

```bash
envsnap label get my-snap
# production baseline
```

### `label remove <snapshot>`

Remove the label from a snapshot.

```bash
envsnap label remove my-snap
# Label removed from "my-snap"
```

### `label list`

List all snapshots that have labels assigned.

```bash
envsnap label list
# my-snap: production baseline
# dev-snap: local dev
```

### `label find <query>`

Search for snapshots whose label contains the query string (case-insensitive).

```bash
envsnap label find prod
# my-snap
```

## Storage

Labels are stored in `~/.envsnap/labels.json` alongside other snapshot metadata.
