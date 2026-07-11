# Sprint 1 — Foundation Alignment

**Status:** Complete  
**Scope:** Align the companion app with Spark Estate™ Architecture Library recognition foundations (001–140).  
**Non-goals:** No new recognition room UIs. No Evidence Vault / Hall / Legacy Studio rebuilds. No store migrations.

---

## Objectives completed

| Objective | Result |
|-----------|--------|
| Canonical Recognition Model | `lib/sparkRecognitionEngine/` remains the shared model; IDs + room state + lifecycle + routing aligned |
| Recognition IDs | New `recognitionIds.ts` — single map for place ↔ section ↔ collection ↔ official name |
| Shared room state | `visual_room`, `conversation_room`, `requested_room`, `active_flow` (camelCase + snake_case aliases) |
| Naming collisions | Bank≡Vault, Wins≡Garden, Hall collection≡Celebration Room; Hall ≠ Portfolio / Asset Gallery |
| Wire Recognition lifecycle | Shell sync on `goToPlace` / section / direct visit; Create gate; already-here gate |
| Remove prototype routing | Production redirects from prototype paths → `/companion` |
| Document changes | This file |

---

## Canonical Recognition ID map

| Official name | Canonical place ID | AppSection (shell) | Collection room ID (legacy key) | Deprecated labels |
|---------------|--------------------|--------------------|----------------------------------|-------------------|
| Evidence Vault™ | `evidence-vault` | `evidence-bank` | `evidence-vault` | Evidence Bank |
| Celebration Garden™ | `gardens` | `wins-this-week` | `celebration-garden` | Wins This Week |
| Celebration Room™ | `celebration-room` | `growth-reports` | `celebration-hall` | Celebration Hall (as festive room) |
| Legacy Studio™ | `legacy-studio` | `home` (until UI) | — | — |
| Hall of Accomplishments™ | `gallery-of-firsts` | `home` (presence; **not** Portfolio) | — | Must not route to Portfolio / `the-gallery` |

### Explicit non-equivalences

- `gallery-of-firsts` ≠ `portfolio` / `growth-portfolio` / `the-gallery`
- `evidence-vault` ≠ `confidence-vault`
- `celebration-room` ≠ `gallery-of-firsts`

Module: `lib/sparkRecognitionEngine/recognitionIds.ts`

---

## Shared room state

Persisted in `sessionStorage` key `companion-recognition-room-state-v1`.

| Architecture Library | TypeScript field | Accessors |
|----------------------|------------------|-----------|
| `visual_room` | `visualRoom` | `getVisualRoom` / `setVisualRoom` |
| `conversation_room` | `conversationContext` | `getConversationRoom` / `setConversationRoom` |
| `requested_room` | `requestedDestination` | `getRequestedRoom` / `setRequestedRoom` |
| `active_flow` | `activeRecognitionFlow` | `getActiveFlow` / `startRecognitionFlow` / `clearActiveFlow` |

Rules:

1. Never claim “already here” unless `visual_room` matches (alias-aware).
2. Explicit `requested_room` wins over suggestions.
3. Active preserve flow / Vault preserve language blocks Create routing.

---

## Wiring (no feature rebuild)

| Integration point | Change |
|-------------------|--------|
| `goToPlace` | Calls `onEstatePlaceArrived` on success |
| `CompanionPageClient.syncDirectEstateVisit` | Syncs visual room on visit |
| `CompanionPageClient` section history effect | `onEstateSectionChanged` when no direct visit |
| `openCreateWorkspace` | Blocks non-UI Create opens when recognition preserve owns the turn |
| `roomActionMatchers` | “Already here” requires `canClaimAlreadyHere` |
| `directory/shell` + alias overrides | Garden → `wins-this-week`; Hall → `home` (not Portfolio) |
| `roomIds` equivalence | Recognition aliases included |

Shell helpers: `lib/sparkRecognitionEngine/shellSync.ts`

---

## Prototype routing removed

`next.config.ts` redirects (temporary, non-permanent):

- `/prototype/*`
- `/workspace-prototype`, `/estate-map-prototype`, `/spark-estate-guide-prototype`
- `/companion/hospitality-prototype`, `/companion/journal-gazebo-prototype`

Destination: `/companion`. Source files remain for design reference.

---

## Naming collision cleanup (member-facing)

- Growth section meta already used Vault / Garden / Celebration Hall titles for shells; Hall of Accomplishments no longer shells to Portfolio.
- Growth capture destination label: **Evidence Vault** (was Evidence Bank).
- Collection framework keeps internal keys (`celebration-garden`, etc.) with `placeId` pointing at canonical places.

---

## Tests

- `lib/sparkRecognitionEngine/sparkRecognitionEngine.test.ts` — alias already-here + ID map
- `lib/estate/collectionFramework/collectionShellNavigation.test.ts` — Garden / Hall shell expectations

---

## Out of scope (later sprints)

- Evidence Vault immersive rebuild
- Hall exhibit engine / gallery walk
- Legacy Studio UI
- Migrating evidence/wins stores into `recognition_records`
- Full conversation-pipeline ownership vs collection offers

---

## Dual numbering reminder

Estate Architecture Library docs use `NNN_*.md`. SIOS docs use `SPARK-NNN_*.md`. Same numbers are **not** the same documents.
