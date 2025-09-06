# User Flow – Gallery browsing and management

Covers public gallery, user’s own list, detail views, and CRUD.

```mermaid
flowchart TD
  Home[/\n(authenticated)/page] -->|list public| Q1[queries.ascii.getPublic]
  MyArt[User list] -->|list mine| Q2[queries.ascii.list(userId)]
  Item[Detail /art/[id]] -->|get| Q3[queries.ascii.get]
  Q1-->UI
  Q2-->UI
  Q3-->UI

  subgraph Manage
    Save[mutations.ascii.save]
    UpdateVis[mutations.ascii.updateVisibility]
    Delete[mutations.ascii.remove]
    Like[mutations.ascii.toggleLike]
  end

  UI --> Save & UpdateVis & Delete & Like
```

Permissions
- Public artworks are visible to everyone.
- Private artworks are only accessible to their owner (checked in `canUserAccessArtwork`).
- Unlisted artworks are accessible via direct link (and share code).

Notes
- Trending is computed in `queries.ascii.getTrending` by engagement.
- The share page `/share/[token]` resolves an artwork by share code.
