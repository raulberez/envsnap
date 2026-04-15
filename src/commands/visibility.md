# `envsnap visibility`

Manage the visibility level of snapshots. Visibility controls how snapshots are treated in listings and exports.

## Visibility Levels

| Level      | Description                                      |
|------------|--------------------------------------------------|
| `public`   | Default. Visible in all listings and operations. |
| `private`  | Hidden from general listings; must be named explicitly. |
| `internal` | Visible within the project but excluded from exports. |

## Commands

### `visibility set <snapshot> <visibility>`

Set the visibility for a named snapshot.

```bash
envsnap visibility set my-snap private
```

### `visibility get <snapshot>`

Get the current visibility of a snapshot.

```bash
envsnap visibility get my-snap
# my-snap: private
```

### `visibility remove <snapshot>`

Remove the visibility setting, resetting it to `public`.

```bash
envsnap visibility remove my-snap
```

### `visibility list`

List all snapshots with non-default visibility settings.

```bash
envsnap visibility list
#   my-snap: private
#   staging: internal
```

## Notes

- Snapshots without an explicit visibility setting are treated as `public`.
- Visibility is stored in `.envsnap/visibilities.json`.
