# Phase 6 — Companion Intelligence Network

**Registry ID:** `phase_6_companion_intelligence_network`  
**Module:** `lib/phase6CompanionIntelligenceNetwork.ts`  
**Storage key:** `companion-phase6-intelligence-network-v1`  
**Status:** `active`

---

## Phase Name

Companion Intelligence Network™

---

## Purpose

Connected intelligence across the entire ecosystem — the user should not have to remember where things live.

Tagline: *"Connected intelligence across the entire ecosystem."*

---

## User Experience

The user should feel:

- Assets across projects, templates, and saved work are discoverable through conversation
- *"Everything I need seems connected"*
- Reduced cognitive load finding prior work

Panel: **Companion Intelligence Network™** — connected ecosystem map in Getting To Know You.

---

## Intelligence Goal

Maintain a **companion knowledge graph** linking ecosystem assets by topic and recency.

---

## Activation Requirements

`isPhase6CompanionIntelligenceNetworkActive(now)` requires **all**:

1. Phase 5 active
2. `buildCompanionKnowledgeGraph(now).nodes.length` ≥ **4** (`MIN_GRAPH_NODES`)

Graph nodes are built from projects, templates, saved work, strategies, and related assets (recovered from implementation behavior).

---

## Companion Behaviors

- `maybeExistingAssetReuseOffer()` — suggests reusing existing assets when user topic matches graph
- `maybeRelatedResourceDiscoveryOffer()` — surfaces related resources
- `findNetworkAssetsForTopics()` / `searchKnowledgeGraph()` — graph queries
- `observePhase6NetworkTurn()` — topic mention tracking
- `phase6CompanionIntelligenceNetworkHintForChat()` — chat guidance
- `formatConnectedEcosystemForPanel()` — panel markdown

Offer cooldown: `OFFER_COOLDOWN_MS` (5 days in code).

---

## Intelligence Collected

`Phase6NetworkState`:

- Topic mentions and offer timestamps
- Reuse/discovery offer counts
- Derived graph: `nodes[]` (id, label, location, kind, topics, updatedAt), `edges[]`

---

## Outputs

- Asset reuse offers in chat (*"You already created X — want to build on it?"*)
- Related resource discovery offers
- Connected ecosystem panel view
- Prerequisite for Phase 7 business knowledge graph (Phase 7 requires Phase 6 active)

---

## Example Conversations

*Recovered from implementation behavior.*

**Reuse offer**

> **User:** I need to write another email about the workshop.  
> **Shari:** You already have **Workshop Launch Email Draft** in My Work — want to build on that instead of starting over?

**Discovery offer**

> **User:** What's connected to my coaching program?  
> **Shari:** *(Related resources from graph edges surfaced with permission-based language.)*

---

## Future Expansion Opportunities

Reserved for future specification:

- Unified graph with `lib/ecosystem/memory/` founder relationship graph (architecture doc notes fragmentation)
- Visual map projection via Visual Thinking™ stack
