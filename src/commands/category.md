# `envsnap category`

Manage categories for your snapshots. Categories let you group and filter snapshots by environment type, project, or any label you choose.

## Subcommands

### `set <snapshot> <category>`

Assign a category to a snapshot.

```bash
envsnap category set my-snap production
```

### `get <snapshot>`

Retrieve the category assigned to a snapshot.

```bash
envsnap category get my-snap
# my-snap: production
```

### `remove <snapshot>`

Remove the category from a snapshot.

```bash
envsnap category remove my-snap
```

### `list [category]`

Without an argument, lists all defined categories.

```bash
envsnap category list
# Categories:
#   production
#   staging
```

With a category name, lists all snapshots assigned to it.

```bash
envsnap category list production
# Snapshots in "production":
#   my-snap
#   prod-backup
```

## Storage

Categories are stored in `~/.envsnap/categories.json` alongside other snapshot metadata.
