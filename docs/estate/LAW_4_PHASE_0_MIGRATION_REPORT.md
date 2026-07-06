# Law 4 — Phase 0 Migration Report

**Date:** 2026-07-05  
**Status:** **Binding migration plan — no member-facing wiring until approved**  
**Authority:** Law 4 (Estate Intelligence) · [ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md](../ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md) · [ESTATE_SPACE_COMPLETION_STANDARD.md](./ESTATE_SPACE_COMPLETION_STANDARD.md)

**Out of scope (this pass):** Conversation Session · Priority Engine · Creating Together · Member Journey · UI

---

## Goal

Spark must know the **complete Estate** — every place, feature, guidebook spread, and alias — through **one conversational authority**: the **Estate Knowledge Registry™**.

Conversation must **query the registry**, never static arrays.

---

## Law 4 (restated)

| If it exists… | Spark must know it |
|---------------|-------------------|
| Place in the Estate | Yes |
| Feature | Yes |
| Guidebook spread | Yes |
| Alias | Yes |

**Conversation must never bypass the Estate Knowledge Registry.**

---

## Current state (2026-07-05)

### What exists

| Asset | Location | On `main`? | Wired to chat? |
|-------|----------|:----------:|:--------------:|
| Canonical place registry (81 places) | `lib/estate/canonicalEstateRegistry.ts` | ✅ | Partial — name match only |
| **Estate Knowledge Registry** (compile + query) | `lib/estateKnowledge/*.ts` | ❌ **local only** | ❌ |
| Estate Brain (10 spaces + 10 experiences) | `lib/estateBrain/knowledgeRegistry.ts` | ✅ | ✅ — **8-space slice** in FAQ |
| Guidebook spreads | `data/estateGuideSpreads.ts` | ✅ | UI only |
| App feature catalog | `lib/appFeatureKnowledge.ts` | ✅ | Hints only |
| Estate Judgment layer | `lib/estateIntelligence/judgment/` | ❌ **local only** | Partial in local `estateGuide.ts` |
| Registry audit doc | `docs/ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md` | ❌ **local only** | — |

### Registry API (Phase 1 — built locally, not shipped)

| Function | Purpose |
|----------|---------|
| `getEstateKnowledgeRegistry()` | Full compiled snapshot |
| `queryPlaces()` / `getPlacesByGroup()` | Filter by status, walkable, group, text |
| `getPlaceById()` / `getPlaceByAlias()` | Resolve place + synonyms |
| `getFeatureCatalog()` | Features + estate experiences |
| `answerEstateKnowledgeQuery()` | Intent → summary + place/feature ids |
| `runEstateKnowledgeAudit()` | Broken / wander / media drift |

**Critical gap:** `lib/estateKnowledge/index.ts` on `main` exports only Momentum Institute room hints. It does **not** re-export registry APIs — tests and judgment import `@/lib/estateKnowledge` and expect the full surface.

### Why answers fail today

```
Member: "What rooms do you have?"
    → estateGuide.roomsGuideBody()
        → allEstateBrainEntries().filter(space).slice(0, 8)   // 8 of ~10 brain spaces, not 81

Member: "What water places do you have?"
    → estatePlaceClusters VAGUE_CLUSTERS (3 fixed ids)
    → OR estateWanderNavigation slice(0, 3) from 15-id array
    → NOT queryPlaces({ group: "water" })

Member: "What features do you have?"
    → capabilitiesGuideBody() from estateBrainExperiences()
    → NOT getFeatureCatalog()
```

**Two “live” definitions still conflict:**

| Rule | Effect |
|------|--------|
| Registry `status: "live"` | 9 places |
| `isLiveEstatePlace()` | ~44 walkable |
| `ESTATE_WANDER_PLACE_ORDER` | **No filter** — can offer `conservatory` (planned), `tea-room` (future) |

---

## Success criteria (acceptance tests)

After Phase 0 wiring, Spark must answer **from registry queries** (no hard-coded bodies):

| Member question | Registry path |
|-----------------|---------------|
| What rooms do you have? | `answerEstateKnowledgeQuery` → `room_catalog` |
| What water places do you have? | `places_by_need` → group `water` |
| What places are peaceful? | `places_by_need` → group `calm` / `restore` |
| What reading spaces do you have? | group `reading` |
| What Treehouse places exist? | group `treehouse` |
| What rooms help me think? | group `think` |
| What rooms help me focus? | group `focus` |
| What places are good for meetings? | group `gather` / `strategy` |
| What rooms help me relax? | group `restore` / `calm` |
| What listening rooms do you have? | group `listening` / `music` |
| What outdoor spaces do you have? | group `outdoor` |
| What places have videos? | `queryPlaces` + media filter |
| What places have music? | media / ambience metadata |
| What places have guided experiences? | feature catalog + destination tier |
| What features do you have? | `feature_catalog` |

**Law 4 is true when:** every row above passes CT-style spot checks and `runEstateKnowledgeAudit()` reports zero `offered_in_wander_menu_but_not_walkable`.

---

## Migration waves (ordered)

### Wave 0 — Ship registry foundation (prerequisite, no chat behavior change)

| Step | Action |
|------|--------|
| 0.1 | Commit `lib/estateKnowledge/` (compileRegistry, types, semanticGroups, estateKnowledgeRegistry, tests) |
| 0.2 | Commit `docs/ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md` |
| 0.3 | Expand `lib/estateKnowledge/index.ts` to re-export registry API **without removing** `estateRoomKnowledgeHintForChat` |
| 0.4 | Run `estateKnowledgeRegistry.test.ts` — must pass on CI |

**Risk:** Low — additive only.  
**Rollback:** Revert index exports; chat unchanged.  
**Tests:** `lib/estateKnowledge/estateKnowledgeRegistry.test.ts`

---

### Wave 1 — Estate Guide FAQ (highest member impact)

| # | Current implementation | Replacement | Risk | Tests | Rollback |
|---|------------------------|-------------|------|-------|----------|
| 1.1 | `estateGuide.roomsGuideBody()` — brain spaces `.slice(0, 8)` | `answerEstateKnowledgeQuery(text)` when topic `rooms`; fallback only if registry empty | **HIGH** | Extend `sparkKnowledge.test.ts` + registry tests for catalog intent | Restore `roomsGuideBody` |
| 1.2 | `capabilitiesGuideBody()` — `estateBrainExperiences()` | `getFeatureCatalog()` + Shari formatting helper | **MEDIUM** | Feature catalog count ≥ brain experiences | Restore static body |
| 1.3 | `journalsGuideBody()` — 3 static journal names | `queryPlaces` journal/gazebo/clear-my-mind groups + features | **MEDIUM** | Journal intent resolves 3 known places | Restore static body |
| 1.4 | `businessGrowthGuideBody()` / `adhdGuideBody()` / `featuresMissingGuideBody()` | Registry groups + feature catalog by intent family | **MEDIUM** | Spot-check 3 topics | Restore static bodies |
| 1.5 | `roomStoryBody()` — canonical + brain slice | `getPlaceById` + guidebook ref + brain overlay | **MEDIUM** | Ocean Conservatory, Coffee House stories | Keep brain fallback |
| 1.6 | `resolveEstateGuideTurn()` — judgment try then static switch | **Registry first** → judgment enrich → static last resort only | **HIGH** | All success-criteria questions | Feature flag `ESTATE_GUIDE_REGISTRY=0` |

**Entry point:** `lib/frictionlessActionLayer.ts` → `tryEstateGuideFlow()` — inject registry summary into `responseHint` when guide turn fires.

---

### Wave 2 — Wander & picker menus (retire three-room slices)

| # | Current implementation | Replacement | Risk | Tests | Rollback |
|---|------------------------|-------------|------|-------|----------|
| 2.1 | `ESTATE_WANDER_PLACE_ORDER` + `pickWanderPlaceIds()` `slice(0,3)` | `queryPlaces({ walkable: true, chatCanDescribe: true, exclude: current, limit: 3 })` with discovery ordering policy | **HIGH** | Wander never offers non-walkable; audit clean | Restore wander array |
| 2.2 | `formatEstateWanderMenu()` | Same query + `formatEstatePlaceSuggestionMenu` | **HIGH** | Menu always 1–3 **walkable** names | Restore |
| 2.3 | `estateMetaNavigation` exploratory pools `slice(0,3)` | `queryPlaces` by context group | **HIGH** | Exploratory ≠ wander duplicate logic | Restore |
| 2.4 | `estatePlaceClusters` `VAGUE_CLUSTERS` fixed 3 ids | `getPlacesByGroup(mappedNeed)` + judgment `selectTopCandidates(1–3)` | **HIGH** | Water/read/gather clusters match registry groups | Restore clusters |
| 2.5 | `pendingChoice/listContinuation.pickNextLivePlaceIds()` | Registry query excluding already-offered ids | **MEDIUM** | Continuation expands without dead offers | Restore wander order |
| 2.6 | `CompanionPageClient.revealEstateRoomChoices()` | Registry-backed picker | **HIGH** | Manual UI test | Restore |

---

### Wave 3 — Hints & intelligence stack

| # | Current implementation | Replacement | Risk | Tests | Rollback |
|---|------------------------|-------------|------|-------|----------|
| 3.1 | `shariKnowledgeHintForChat()` — merged brain index | Add registry search path; place hints via `getPlaceByAlias` | **MEDIUM** | Hint contains registry place name when matched | Omit registry branch |
| 3.2 | `estateIntelligenceHintForChat()` | Inject registry summary when evaluation matches place/feature | **MEDIUM** | Hint block includes registry line | Omit injection |
| 3.3 | `estateRoomKnowledgeHintForChat()` — Momentum only | Compile from registry guidebook + brain per place | **LOW** | ≥1 non-Momentum room hint | Keep momentum map |
| 3.4 | `appFeatureKnowledgeHintForChat` in CompanionPageClient | `getFeatureCatalog()` | **MEDIUM** | Feature ask resolves catalog | Restore APP_FEATURES hint |
| 3.5 | `estateIntelligence/judgment/intentFamilies` hard-coded placeIds | Derive candidates from `queryPlaces({ group })` | **MEDIUM** | Judgment tests pass | Restore arrays |
| 3.6 | `scoreCandidates` water/reading injection | `getPlacesByGroup` | **LOW** | Judgment tests | Restore |

---

### Wave 4 — Routing & concierge (lower traffic, same authority)

| # | Current implementation | Replacement | Risk | Tests | Rollback |
|---|------------------------|-------------|------|-------|----------|
| 4.1 | `impliedEstatePlaceMatch` / `impliedNeed` static place ids | `getPlaceByAlias` + `walkable` gate | **MEDIUM** | Implied need tests | Restore rules |
| 4.2 | `resolveEstateNavigation.businessWorkChoices()` 3-item fallback | Registry + brain search | **MEDIUM** | Navigation tests | Restore fallback |
| 4.3 | `estateCapabilityRegistry/goalRecommendations` | `consultEstateCapabilities` + feature catalog | **LOW** | Goal recommendation tests | Restore GOAL_SETS |
| 4.4 | `tryEstateConciergeFlow()` | Concierge reads registry for room recs | **MEDIUM** | Concierge spot checks | Restore |

---

## Dependencies to remove (explicit)

| Pattern | Primary files | Replace with |
|---------|---------------|--------------|
| Hard-coded 3-room wander | `estateWanderNavigation.ts`, `estateMetaNavigation.ts`, `estatePlaceClusters.ts` | `queryPlaces` |
| 8-room brain slice | `estateGuide.roomsGuideBody` | `answerEstateKnowledgeQuery` |
| Static FAQ bodies | `estateGuide.ts` switch cases | Registry + formatters |
| Legacy category arrays | `semanticGroups.ts` (keep as **compile input** until groups live on entries) | Registry `groups[]` at query time |
| Manual feature lists | `APP_FEATURES` direct reads in chat | `getFeatureCatalog()` |
| Parallel “live” rules | wander vs `isLiveEstatePlace` vs registry status | **Single rule:** `walkable` + `chatCanDescribe` on registry entry |

**Keep (as overlay, not authority):** Estate Brain greetings, suggested activities, experience triggers — merged **into** registry entries at compile time, not read directly in chat after Wave 1.

---

## Risk summary

| Level | Areas |
|-------|--------|
| **HIGH** | Wander menus (dead offers), rooms FAQ (incomplete catalog), estate map picker |
| **MEDIUM** | Hint stack, judgment families, concierge, static topic bodies |
| **LOW** | Momentum hint expansion, goal recommendations, framework lists |

**Top regression risk:** Offering a place in a menu that navigation cannot reach (`conservatory`, `tea-room`). Registry audit flag `offered_in_wander_menu_but_not_walkable` must be **zero** before Wave 2 ships.

---

## Test plan

| Layer | Command / file |
|-------|----------------|
| Registry compile | `lib/estateKnowledge/estateKnowledgeRegistry.test.ts` |
| Audit gate | `runEstateKnowledgeAudit()` — broken count trending down |
| Guide FAQ | Extend `lib/sparkKnowledge/sparkKnowledge.test.ts` — one test per success-criteria question |
| Wander | New `estateWanderNavigation.test.ts` — walkable-only, limit 3 |
| Clusters | `estatePlaceClusters.test.ts` — group alignment |
| Manual CT | Spec 119 hospitality + “Spark Question” on catalog turns |
| No touch | Conversation Session tests, Priority Engine, Creating Together |

---

## Rollback strategy

1. **Feature flag (recommended):** `NEXT_PUBLIC_ESTATE_KNOWLEDGE_REGISTRY=0` — skips registry branch in `resolveEstateGuideTurn`, wander, hints; restores static paths.
2. **Per-wave revert:** Each wave is one PR; revert PR restores prior behavior.
3. **Registry-only revert:** Wave 0 can stay committed; disabling flag sufficient for hotfix.

---

## Recommended implementation order

```
Wave 0  Ship registry + index exports + audit doc     ← start here
Wave 1  estateGuide + frictionless guide flow          ← Law 4 visible in chat
Wave 2  Wander / clusters / picker                     ← retire 3-room slices
Wave 3  Hints + judgment                               ← full stack alignment
Wave 4  Concierge + implied routing                    ← cleanup
```

**Do not start Wave 1 until Wave 0 tests pass on CI.**

---

## Files touched (forecast)

| Wave | Primary files |
|------|---------------|
| 0 | `lib/estateKnowledge/*`, `index.ts` |
| 1 | `lib/sparkKnowledge/estateGuide.ts`, `lib/frictionlessActionLayer.ts` |
| 2 | `lib/estate/estateWanderNavigation.ts`, `estateMetaNavigation.ts`, `estatePlaceClusters.ts`, `lib/pendingChoice/listContinuation.ts` |
| 3 | `lib/sparkKnowledge/shariKnowledge.ts`, `lib/estateIntelligence/estateHintForChat.ts`, judgment/* |
| 4 | `lib/welcomeHome/estateConcierge.ts`, `lib/intentAwareConversation/impliedNeed.ts`, `lib/estate/impliedEstatePlaceMatch.ts` |

**Not touched:** `lib/conversationSession/*`, `lib/conversationIntelligence/*`, Creating Together, Member Journey, UI components (except registry-backed copy in chat responses).

---

## Next action (awaiting approval)

1. **Approve this report**
2. **Wave 0 PR** — commit registry + audit doc + index exports (no chat behavior change)
3. **Wave 1 PR** — wire `answerEstateKnowledgeQuery` into estate guide (Law 4 first member-visible win)

When Wave 1 ships, Spark answers “What rooms do you have?” from **81 registry places**, not **8 brain spaces**.
