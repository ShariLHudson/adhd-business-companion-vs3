# Discovery Content Management System™

**Curated Discovery Notes — quality over quantity**

| | |
|---|---|
| **Content file** | [../discovery-library.json](../discovery-library.json) |
| **Voice** | [VOICE_STANDARDS.md](./VOICE_STANDARDS.md) |
| **Workflow** | [EDITORIAL_WORKFLOW.md](./EDITORIAL_WORKFLOW.md) |
| **Template** | [CONTENT_TEMPLATE.md](./CONTENT_TEMPLATE.md) |
| **Runtime** | `lib/estateDiscovery/discoveryCms/` |
| **Truth layer** | [Estate Knowledge Base™](../../estate-knowledge-base/README.md) |

---

## Purpose

Discovery Notes are the **personality of Spark Estate**. Every note should feel intentional — never AI-generated, never rushed.

Content is **written and curated by Shari** over time. This system makes it easy to add, edit, organize, review, and activate Discoveries **without changing application code**.

The technology should scale. The writing should remain personal.

---

## V1: JSON as CMS

Edit [discovery-library.json](../discovery-library.json) directly (or via future Supabase / internal CMS).

Add a row → run validation → move through editorial workflow → set **Live** when ready.

No deploy required for copy changes — only for schema or runtime rule changes.

---

## Content fields

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Stable, e.g. `DISC-001` |
| `title` | Yes | Member-facing headline |
| `category` | Yes | See `categoryValues` in JSON |
| `status` | Yes | Editorial workflow status |
| `priority` | Yes | Essential · Helpful · Delight · Personalized |
| `discoveryText` | Yes | Required body — the discovery |
| `whyItMatters` | No | Encouragement, not lecture |
| `foodForThought` | No | Reflection — never requires a response |
| `image` | No | Asset path |
| `primaryButton` | No | Overrides category default |
| `destinationRoute` | When navigating | Must match Knowledge Base |
| `relatedRoom` | When room-linked | Knowledge Base room id |
| `relatedFeature` | When feature-linked | Knowledge Base feature id |
| `tags` | Recommended | Organization |
| `keywords` | Recommended | Search / future retrieval |
| `version` | Yes | Increment on meaningful edits |
| `createdAt` | Yes | ISO date |
| `lastUpdated` | Yes | ISO date |
| `author` | Yes | Curator name — typically Shari |
| `targetRegistry` + `targetId` | Yes | Link to Knowledge Base |

---

## Content status

| Status | Meaning | Member-facing |
|--------|---------|---------------|
| **Draft** | Work in progress | No |
| **Review** | Ready for editorial review | No |
| **Approved** | Passed review — ready to schedule Live | No |
| **Live** | Active — may appear via Discovery Key | Yes |
| **Hidden** | Paused / special case | No |
| **Retired** | Historical reference | No |

**Only Live** Discoveries may appear to members — and only after full validation passes.

---

## Before going Live

Run validation (see `validateDiscoveryForLive()` in `lib/estateDiscovery/discoveryCms/`):

1. Room exists in Estate Knowledge Base™ (if `relatedRoom` set)
2. Feature exists (if `relatedFeature` set)
3. Destination route is valid and matches registry
4. Target registry item is **Live**
5. Terminology matches official vocabulary
6. Voice standards pass (no AI clichés, no pushy tone)
7. Primary button label is appropriate
8. Required fields present

Invalid Discoveries **cannot** become Live.

---

## Future-ready (schema only)

Optional `future` block on each record — not executed in V1:

- Scheduling (`activateAt`, `expireAt`)
- Seasonal activation
- Featured Discoveries
- Language translation
- Member segments
- Difficulty level
- Estimated reading time

---

## Runtime API

```typescript
import {
  validateDiscoveryContent,
  validateDiscoveryForLive,
  canTransitionDiscoveryStatus,
  lintDiscoveryVoice,
  getMemberReadyDiscoveryRecords,
  groupDiscoveriesByStatus,
} from "@/lib/estateDiscovery/discoveryCms";
```

---

## Migration path

| Phase | Storage |
|-------|---------|
| **V1 (now)** | `discovery-library.json` |
| **V2** | Supabase `discovery_library` table — same shape |
| **V3** | Internal CMS UI — writes to Supabase |

Schema: `lib/estateDiscovery/discoveryCms/supabaseCmsSchema.ts`

---

## Related

- [DISCOVERY_LIBRARY.md](../DISCOVERY_LIBRARY.md)
- [Discovery Key Constitution](../discovery-key/DiscoveryKey-Constitution.md)
- [Estate Knowledge Base™](../../estate-knowledge-base/README.md)
