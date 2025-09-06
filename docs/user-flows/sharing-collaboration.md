# User Flow – Sharing and collaboration

Time‑boxed links allow viewing without an account. Owners can list and revoke shares.

```mermaid
sequenceDiagram
  participant Owner as Owner (UI)
  participant Q as Convex shares functions
  participant V as Visitor (no auth)
  participant App as /share/[token]

  Owner->>Q: create({ artworkId, expiresIn?, maxViews? })
  Q-->>Owner: { shareCode }
  Owner->>Owner: copy link /share/{shareCode}

  V->>App: GET /share/{shareCode}
  App->>Q: getByCode({ shareCode })
  Q-->>App: artwork | null
  App-->>V: render or 404/expired

  Owner->>Q: list()
  Owner->>Q: revoke({ shareId })
```

Notes
- View counts can be enforced via mutations when needed (`viewCount` field exists on shares).
- Expiration is evaluated in `getByCode` before returning the artwork.
