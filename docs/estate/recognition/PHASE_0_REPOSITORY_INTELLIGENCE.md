# Phase 0 — Repository Intelligence

**Status:** Complete (read-only)  
**Repo:** `companion-app` on `deploy/companion-app-v3`  
**Date:** 2026-07-09

---

## Architecture summary

The companion is a **Next.js App Router** product centered on a **single client shell** (`CompanionPageClient`) at `/companion`. Most rooms are **`AppSection` values** inside that shell, not separate routes.

```
Member message
  → classifyPrimaryConversationTurn
  → estate kernel / command router
  → frictionless action layer
  → collection save offers
  → POST /api/companion-chat (when nothing local handles the turn)
```

Estate identity resolves through overlapping registries:

| Registry | Count | Role |
|----------|-------|------|
| `ESTATE_PLACE_MASTER_MANIFEST.json` | 64 places | Target authority |
| `canonicalEstatePlaces` + subplaces | ~83 | Legacy adapter |
| `estateRoomRegistry` | ~28 | Legacy walkable catalog |
| `estateRoomAliasCatalog` | ~62 | Phrase aliases |

Member recognition data is **localStorage-first**. Supabase is used for auth and founder/ecosystem tables — **not** for Evidence Vault / wins / journal.

---

## Route map (recognition-relevant)

| Surface | How it opens |
|---------|----------------|
| `/companion` | Main shell — sections via `?section=` |
| `/estate-collection/[roomId]` | Standalone collection preview |
| AppSection `evidence-bank` | Evidence Vault UI |
| AppSection `wins-this-week` | Celebration Garden UI |
| AppSection `growth-reports` | Celebration Hall UI |
| AppSection `growth-journal` | Journal Gazebo |
| AppSection `growth-portfolio` | Portfolio (also Hall nav target today) |
| AppSection `the-gallery` | **Asset Library** — not Hall of Accomplishments |

---

## Store inventory (recognition-adjacent)

| Key | Module | Purpose |
|-----|--------|---------|
| `companion-evidence-bank-v1` | `evidenceBankStore` | Discoveries |
| `companion-saved-growth-wins-v1` | `growthWinsStore` | Garden wins |
| `companion-growth-journal-v1` | `growthJournalStore` | Journal |
| `companion-growth-portfolio-v1` | `growthPortfolioStore` | Portfolio |
| `companion-growth-capture-v1` | `growthCaptureStore` | Universal capture |
| `companion-recognition-v1` | `lib/recognition` | **Date/milestone** recognition only |
| `estate-collection-generic-v2-celebration-hall` | generic collection store | Celebration Hall |
| `companion-asset-library-v1` | asset library | Attachments |
| `spark:estate:memory:v1` | estateMemoryStore | Session estate memory |
| `spark:estate:collection-pending-offer:v1` | collectionPendingOffer | Pending save offers |

---

## API inventory

**No dedicated APIs** for evidence, wins, journal, celebration, or Hall.

Related: `/api/companion-chat`, `/api/momentum-institute/curriculum`, founder/ecosystem APIs.

---

## Database inventory

Member recognition tables: **none**.

Supabase SQL under `supabase/` covers founder workspace + ecosystem only. Discovery sync schemas are documented but unwired.

---

## Feature flags (relevant)

Conversation session spine, estate intelligence runtime, conversation context, and collection offers are generally ON by default. Profile learning / unified signal bus default OFF.

---

## Critical naming collisions

1. **`lib/recognition/`** = birthday/anniversary moments — **not** the Unified Recognition Engine.
2. **`the-gallery`** = Asset Library — **not** Hall of Accomplishments (`gallery-of-firsts`).
3. **`evidence-bank`** (section) vs **`evidence-vault`** (place) — same data, two IDs.
4. **`wins-this-week`** vs **`celebration-garden`** / place `gardens` — same garden surface.
5. **Hall of Accomplishments** navigates to **Portfolio** today — no exhibit engine.

---

## Pipeline risk for recognition

Recognition must declare turn ownership relative to:

- `classifyPrimaryConversationTurn`
- estate task lock
- `evaluateCollectionSaveOffer`
- frictionless action layer

Otherwise discovery language can route to **Create** or false “already here” replies.
