# Spark Estate — First 60 Days Welcome Experience

| Field | Value |
|-------|-------|
| **Status** | Product UX architecture + runtime (Welcome Home) |
| **Authority** | Subordinate to Estate Constitution · Living in Spark Estate · Bible |
| **Runtime home** | `lib/dailyOpening/` · `lib/dailyOpening/first60Days/` · `TodaysWelcomeCard` |
| **Not** | A parallel Welcome OS · new conversation specs · dashboard onboarding |

---

## Philosophy

Arrive home each morning — never software training.

- Every day: a different welcome · one optional discovery · three familiar action choices · a brief encouragement
- Layout stays familiar; content evolves
- After Day 60: discovery becomes adaptive (behavior-based), not a fixed sequence
- Skip is always valid — no guilt, no lectures

**Feeling test:** Would a thoughtful friend greet you this way at the door?

---

## Four sections (stable structure)

| # | Section | Behavior |
|---|---------|----------|
| 1 | **Today's Welcome** | Unique Shari presence line for the day; greeting with name when known; progress only when natural; never exact same welcome two mornings in a row |
| 2 | **Today's Discovery** | ONE optional invite: feature title, one-sentence why, why today, **Explore** + **Skip** |
| 3 | **Three Action Cards** | Familiar anchors — Continue Meaningful Work · Plan or Adapt My Day · Help Me Choose (wording may adapt; never force) |
| 4 | **Today's Encouragement** | Brief rotating thought under the cards |

Backgrounds remain environmental only — not navigation.

---

## Day progression model

| Signal | Source |
|--------|--------|
| Relationship start | `daysSinceRelationshipStart()` ← Phase 2 `firstSessionAt` |
| Welcome day index | `dayIndex = daysSinceStart + 1` (Day 1 = first calendar day) |
| Guided window | Days **1–60** (`welcomePhase: "guided"`) |
| Adaptive window | Day **61+** (`welcomePhase: "adaptive"`) |
| Calendar gate | Existing `DAILY_OPENING_DAY_KEY_STORAGE` + discovery day key |

No parallel “account age” clock. Extend these signals; do not invent a second timeline.

---

## Discovery catalog (usefulness-guided)

Order is usefulness, not a rigid room tour:

1. Plan My Day  
2. My Rhythms  
3. Business Profile  
4. People I Help  
5. Create  
6. Projects  
7. Focus  
8. Journal Gazebo  
9. Chamber  
10. Boardroom  
11. Estate Library  
12. Celebration Garden  
13. Evidence Vault  

**Guided:** next unexplored / unskipped item aligned with progress through the usefulness ranks.  
**Adaptive (61+):** prefer unvisited / low-use (estate room visit counts) and avoid recently shown helpful lessons; never nag frequent features.

Catalog + selection: `lib/dailyOpening/first60Days/catalogs.ts` · `resolveDiscoveryForDay.ts`.

---

## Progress signals

Persisted in `localStorage` key `spark-first-60-welcome-progress-v1`:

| Signal | Meaning |
|--------|---------|
| `exploredIds` | Member chose Explore |
| `skippedIds` | Member chose Skip — remembered, never guilt |
| `recentWelcomeIds` / pinned day | No exact welcome repeat |
| `recentEncouragementIds` / pinned day | Encouragement rotation |
| `lastDiscoveryOfferDay` / `Id` | Stable offer within a calendar day |

Complements (does not replace):

- Helpful lesson history (`spark-helpful-lesson-history-v1`)
- Estate room visit memory (`roomVisitMemory.visitCounts`)
- Daily opening presented day / discovery day keys

---

## Day 60+ adaptive rules

1. Phase flips when `dayIndex > 60`
2. Score discoveries: prefer never/rarely visited; deprioritize explored + frequent (≥3 visits)
3. Still at most **one** optional discovery on eligible first openings
4. Absence / recovery still suppresses discovery (hospitality first)
5. Three action cards and encouragement continue forever

---

## Extension hooks (future features)

To plug a new capability into the welcome framework:

1. Add a `First60DiscoveryDefinition` to `FIRST_60_DISCOVERY_CATALOG` with `usefulnessRank`, `destinationId`, and optional `visitRoomIds`
2. Ensure Explore can navigate (section map in `CompanionPageClient` or `goToPlace`)
3. Do **not** add a fourth primary action card
4. Do **not** invent a separate Welcome Home controller — call through `resolveGlobalDailyOpening`

Welcome lines / encouragements: append to `FIRST_60_WELCOME_LINES` / `FIRST_60_ENCOURAGEMENTS`.

---

## Relationship to existing code

| Existing | Role after this work |
|----------|----------------------|
| `resolveGlobalDailyOpening` | Owns the daily card result (now includes day index, phase, encouragement, rich discovery) |
| `resolveDailyOpeningDiscoveryInvite` | Gates visibility; fills discovery from first60Days catalog |
| `buildDailyOpeningWelcomeParts` | Unique rotating welcome line on first-of-day |
| `helpfulLessons/*` | Still used by “Show Me Something Helpful” when discovery is hidden |
| `resolveWelcomeHomeDailyChoices` | Remains thin greeting fallback; choices retired to Today's Welcome Card |
| `GlobalDailyCompanionOpening` / `TodaysWelcomeCard` | Renders the four sections |
| Backgrounds / concierge | Unchanged — environmental only |

---

## Acceptance criteria

- [x] Four-section Welcome Home layout on the daily card  
- [x] Unique daily welcome (no exact consecutive repeat)  
- [x] One optional discovery with Explore + Skip  
- [x] Skip persisted without guilt copy  
- [x] Three familiar action cards unchanged in identity  
- [x] Encouragement line present  
- [x] Day 1–60 guided; 61+ adaptive  
- [x] Extends `dailyOpening` / Welcome Home — no parallel OS  
- [x] Focused vitest coverage  

---

## How to verify in UI

| Scenario | How |
|----------|-----|
| **Day 1** | Fresh relationship (`firstSessionAt` today). First platform opening → welcome + Plan My Day discovery + three cards + encouragement |
| **Day 15** | Set relationship start ~14 days ago (or mock `daysSinceRelationshipStart` → 14). Discovery advances past explored/skipped; welcome line differs from yesterday |
| **Day 61+** | `daysSinceRelationshipStart` ≥ 60. Discovery phase adaptive; frequent rooms not re-suggested |
| **Skip** | Click Skip → discovery hides; no shame message; same discovery not re-offered while guided |
| **Explore** | Click Explore → navigates to destination; marked explored |

Dev tip: clear `spark-first-60-welcome-progress-v1` and `spark-global-daily-opening-*` keys to re-exercise a morning.

---

## Tests

`lib/dailyOpening/first60Days/first60Days.test.ts`

- Day index (1 / 15 / 61+)  
- Discovery skip + explore  
- No-repeat welcome  
- Adaptive preference for unvisited/low-use  

Also covered via existing `globalDailyCompanionOpening.test.ts` discovery shape assertions.

```bash
npx vitest run --pool=threads --maxWorkers=1 \
  lib/dailyOpening/first60Days/first60Days.test.ts \
  lib/dailyOpening/globalDailyCompanionOpening.test.ts \
  lib/dailyOpening/welcomeDiscoverySeparation.test.ts
```

**Verified locally (2026-07-22):** 3 files · 38 tests passed.

---

## Gaps / deferred

- Full visit telemetry for every catalog destination (some map to nearest live section)
- Celebration Garden / Estate Library may soft-route until dedicated places are live
- Intent Memory™ for discovery preferences (Spec 112) — not built; skip/explore hooks only
- Soft “progress” sentence in welcome when milestones exist — optional later, keep sparse
- Do not mix Welcome IA menu / Connections / Chamber knowledge WIP into this surface

---

## Suggested commit message

```
feat(welcome-home): first 60 days welcome experience

Add estate architecture for the four-section daily Welcome Home
(welcome, optional discovery, three actions, encouragement) and
wire guided days 1–60 plus adaptive discovery after day 60 through
existing dailyOpening paths.
```
