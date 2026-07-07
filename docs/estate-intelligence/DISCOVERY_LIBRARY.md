# Discovery Library™

**Content engine for Discovery Key™**

| | |
|---|---|
| **Data** | [discovery-library.json](./discovery-library.json) |
| **Runtime** | `lib/estateDiscovery/` |
| **Presentation** | `components/estate/discovery/DiscoveryNote` |
| **Truth layer** | [Estate Knowledge Base™](../estate-knowledge-base/README.md) |
| **CMS** | [discovery-cms/](./discovery-cms/README.md) |

---

## Three layers

| Layer | Role |
|-------|------|
| **Estate Intelligence** | What exists — rooms, features, routes, tools (source of truth) |
| **Discovery Library** | What may be gently revealed — Discovery records |
| **Discovery Note** | How a record feels when the member finds it |

The Discovery Key™ never hardcodes copy. It loads **one record** from this library.

---

## Record shape (v3)

Each item in `discovery-library.json` is one Discovery:

- **Identity:** `id`, `status`, `priority`, `category`, `version`, `createdAt`, `lastUpdated`, `author`
- **Presentation:** `title`, `subtitle`, `image`, `discoveryText`, `whyItMatters`, `foodForThought`
- **Navigation:** `primaryButton`, `destinationRoute`, `destinationType`
- **Relations:** `relatedRoom`, `relatedFeature`, `relatedTool`, `relatedSparkCards`
- **Truth link:** `targetRegistry` + `targetId` (must exist in Estate Knowledge Base™)
- **Editorial:** `editorial` (review notes, approval)
- **Future-ready:** `future` (scheduling, seasonal, featured, translations, segments, difficulty, reading time)
- **Triggers:** `triggerRules[]` (structure only — not executed in V1)
- **Retrieval:** `tags`, `keywords`

Add a new Discovery by inserting a row — **no code change required**. Use [CONTENT_TEMPLATE.md](./discovery-cms/CONTENT_TEMPLATE.md).

---

## Status gate (editorial workflow)

| Status | Member-facing |
|--------|----------------|
| **Draft** | Internal — work in progress |
| **Review** | Editorial review |
| **Approved** | Ready for activation |
| **Live** | Yes — may appear via Discovery Key (must pass `validateDiscoveryForLive`) |
| **Hidden** | Temporarily withdrawn |
| **Retired** | Historical reference |

Only **Live** discoveries that pass CMS validation may appear to members. Runtime: `getMemberReadyDiscoveryRecords()` in `lib/estateDiscovery/discoveryCms/`.

---

## Priority

| Priority | Typical use |
|----------|-------------|
| **Essential** | Orientation, core capabilities |
| **Helpful** | Useful but optional context |
| **Delight** | Hidden treasures, seasonal moments |
| **Personalized** | Positive personal observations |

Priority informs selection order — not pressure.

---

## Categories

| Slug | Label |
|------|-------|
| `estate-discovery` | Estate Discovery |
| `feature-discovery` | Feature Discovery |
| `estate-story` | Estate Story |
| `hidden-treasure` | Hidden Treasure |
| `personal-discovery` | Personal Discovery |
| `new-possibility` | New Possibility |
| `seasonal-discovery` | Seasonal Discovery |

New categories: add to `categoryValues` in JSON and `DISCOVERY_NOTE_CATEGORIES` in types.

---

## Trigger rules (future)

`triggerRules` holds structured intent — **not executed yet**.

Supported types: `first-room-visit` · `never-visited-room` · `feature-never-used` · `season-active` · `member-pattern-detected` · `manual` · `time-based` · `favorite-room`

Each rule may include opaque `config` for future engines.

---

## Personal discoveries

Must be **positive, encouraging, supportive** — never diagnostic or judgmental.

No response required. No text box. No data collection from Food for Thought.

---

## Runtime API

```typescript
import {
  getLiveDiscoveryRecords,
  getDiscoveryRecordById,
  getMemberReadyDiscoveries,
  mapDiscoveryRecordToNoteData,
  validateDiscoveryLibrary,
  selectNextDiscovery,
  shouldShowDiscovery,
  recordDiscoveryShown,
  recordDiscoveryCompleted,
  mapEngineSelectionToNoteData,
} from "@/lib/estateDiscovery";
```

- `getMemberReadyDiscoveries()` — Live records that pass validation
- `selectNextDiscovery({ memberId, memberContext })` — Discovery Engine™ selection
- `mapEngineSelectionToNoteData(selection)` — feeds `DiscoveryNote` component
- `validateDiscoveryLibrary()` — founder QA before publishing

---

## Supabase path

Schema draft: `lib/estateDiscovery/supabaseDiscoverySchema.ts`

V1 reads JSON. Future: sync `discovery_library` table; same column map; RLS for Live-only member reads.

---

## Related

- [discovery-rules.md](./discovery-rules.md)
- [Discovery Key Constitution](./discovery-key/DiscoveryKey-Constitution.md)
- [Discovery Key Behavior](./discovery-key/DiscoveryKey-Behavior.md)
