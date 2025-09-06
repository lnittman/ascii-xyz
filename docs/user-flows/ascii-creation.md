# User Flow – ASCII Creation

From prompt entry to animated ASCII playback and optional persistence.

```mermaid
sequenceDiagram
  participant U as User
  participant UI as / (home) – Generate
  participant Act as Convex actions.ascii
  participant AI as OpenRouter
  participant Mut as Convex mutations.ascii
  participant DB as Convex DB

  U->>UI: Enter prompt, press Run
  UI->>Act: generate({ prompt, modelId, apiKey? })
  Act->>AI: generateText(plan) + generateText(frames)
  AI-->>Act: { plan, frames[] }
  Act-->>UI: frames + metadata
  UI-->>U: Play animation with AsciiEngine
  alt User saves
    UI->>Mut: save({ userId, prompt, frames, metadata, visibility? })
    Mut->>DB: insert into artworks
    DB-->>UI: artworkId
  end
```

Notes
- The UI’s engine (`AsciiEngine`) renders frames client‑side with low overhead.
- BYOK: if the user supplied an OpenRouter key, it’s forwarded to the action; otherwise the server’s `OPENROUTER_API_KEY` is used.

Key files
- Page and actions: `apps/app/src/app/(authenticated)/page.tsx`, `apps/app/src/app/(authenticated)/create/actions.ts`
- Backend actions: `packages/backend/convex/functions/actions/ascii.ts`
- Backend mutations: `packages/backend/convex/functions/mutations/ascii.ts`
