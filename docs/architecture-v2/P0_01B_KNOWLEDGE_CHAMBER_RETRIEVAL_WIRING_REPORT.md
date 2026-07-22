# P0-01B — Knowledge Chamber Retrieval Wiring Report

**Date:** 2026-07-22  
**Parent:** [P0_01_CHAMBER_KNOWLEDGE_RETRIEVAL_WIRING_REPORT.md](./P0_01_CHAMBER_KNOWLEDGE_RETRIEVAL_WIRING_REPORT.md)  
**Mission:** Wire the Knowledge Chamber member (`knowledge-management`) into the **same** Chamber retrieval path used by Client Relationships. No second retrieval system.

---

## Status lines (required)

| Gate | Status |
|------|--------|
| **Runtime wiring** | **complete** (Knowledge contracts + selective paths on `chamberMemberHintForChat` → companion-chat `intentHint`) |
| **Automated tests** | **pass** (see evidence below) |
| **Browser validation** | **NOT_RUN** |
| **Production certification** | **NOT_CERTIFIED** |

---

## What shipped

| Artifact | Path |
|----------|------|
| Knowledge contracts | `lib/chamber/knowledge/knowledgeManagementContracts.ts` |
| Doc metadata types | `lib/chamber/knowledge/types.ts` (`ChamberKnowledgeDocStatus` + optional title/category/tags/priority) |
| Registry seed | `lib/chamber/knowledge/chamberKnowledgeRegistry.ts` → `knowledge-management` **fully** wired |
| Loader selection | `lib/chamber/knowledge/loadChamberKnowledge.ts` → `knowledgeManagementSelectPaths` |
| Prompt honesty block | `lib/chamber/knowledge/chamberKnowledgePromptBlock.ts` (match / conflict / stale / no auto-launch) |
| Exports | `lib/chamber/knowledge/index.ts` |
| Tests | `lib/chamber/knowledge/chamberKnowledgeRetrieval.test.ts` (Knowledge suite added) |

**Chat path unchanged:** `CompanionPageClient` → `chamberMemberHintForChat(activeChamberMember)` → `chamberKnowledgeHintForChat` → `/api/companion-chat` `intentHint`.

---

## Source inventory

### Included (user-facing retrieval eligible)

| Source | Paths | Role |
|--------|-------|------|
| Architecture packs **527–538** | `docs/architecture-v2/527_…` … `538_…` | Ownership, capture, retrieval, lifecycle, lineage, contradiction, Create catalog, routing, manifest |
| KMG library (approved) | `docs/visual-spark-studios/Knowledge-Management-Intelligence/KMG-001` … `KMG-021` (except exclusions) | Domain operating knowledge |

### Excluded from retrieval slices

| Path / role | Why |
|-------------|-----|
| `KMG-011` Expert Wisdom Council | Default exclude — expert-attribution / branding risk |
| `KMG-022` Memory Pattern Library | Platform Spec 112 memory — Knowledge does **not** own |
| Pack **536** visuals | Registered as `unavailable` — auto knowledge maps not runtime-ready |
| Learning packs **551–562** | Never registered under Knowledge |
| Superseded / duplicate / implementation-only materials | Not inventoried |

---

## Ownership contract (runtime)

**Owns:** capture · organization · synthesis · retrieval support · source lineage · gaps · connecting related info · usable understanding · preservation · maintenance · known/unknown/outdated/conflicting/incomplete

**Does not own:** Learning (skills) · Strategy · Projects execution · Momentum · Create mechanics · general platform memory · factual invention · Research investigation · Content expression · file-storage product

**Routing:** offer/handoff language only — Learning · Projects · Momentum · Create (explicit artifact only) · other Chamber members. **Never auto-launch.**

---

## Browser validation checklist (manual — NOT_RUN)

Run while signed in with Knowledge Management Intelligence active in Chamber chat:

1. **Capture ask** — “Help me preserve this decision so we can find it later.” → Knowledge-lane reply; no Learning/Create auto-open.
2. **Conflict ask** — “We have two different pricing rules — which is trusted?” → surfaces conflict / version honesty; no silent pick.
3. **Stale ask** — “Is this still current?” → outdated / review language when library is thin.
4. **No-match ask** — claim outside library → honest gap; not invented sources.
5. **Learning handoff** — “I need a practice path to learn this.” → offers Learning; does not become a course builder; does not auto-navigate.
6. **Create handoff** — “Draft a glossary for our terms.” → Create offer only when explicit; no silent Work create.
7. **Momentum / Projects mention** — mention without intent to leave → no auto-launch.
8. **Expert branding** — guidance does not cite named experts unprompted.
9. **Voice** — sounds like Shari; not a knowledge-base menu or file dump.
10. **Leave Chamber** — leaving Knowledge clears member context (existing Chamber isolation).

**Browser status:** NOT_RUN

---

## Test evidence

```
npx vitest run lib/chamber/knowledge/chamberKnowledgeRetrieval.test.ts lib/chamber/chamberMemberPrompt.test.ts
→ 28 passed (2 files)
```

---

## Honest remaining gaps

- Full markdown bodies are not streamed every turn (by design — contract + path authority, same as CR).
- No dedicated `docs/chamber-knowledge/knowledge/` founder-approved library yet — wiring uses arch packs 527–538 + KMG.
- Automatic knowledge visuals (536) remain unavailable.
- Browser validation not run → **NOT_CERTIFIED**.
- Other Chamber members remain docs/specialty-only except CR (fully) and Events (partially).

---

## Classification

**Implemented** — Knowledge runtime retrieval wiring on the existing P0-01 path.

*End of P0-01B report.*
