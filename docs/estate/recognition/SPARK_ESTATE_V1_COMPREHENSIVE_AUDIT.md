# Spark Estate™ v1.0 Comprehensive Audit

**Date:** 2026-07-09  
**Branch:** `deploy/companion-app-v3`  
**Repo:** `companion-app`  
**Authority:** Spark Estate™ Architecture Library + `SPARK_RECOGNITION_ENGINE.md`  
**Mode:** Audit only — no feature development, no refactor

---

## Executive Summary

Spark Estate™ is a **large, ambitious, partially coherent product**: a single companion shell with a rich Estate place registry, strong chat/coaching infrastructure, and many room *surfaces* — but the **Unified Recognition Engine is not yet the lived product**.

### Bottom line

| Finding | Verdict |
|---------|---------|
| Estate place world | **Exists at scale** (~60+ named places; ~10 live) |
| Companion chat + coaching | **Strong** — one primary chat path, heavy enforcement layers |
| Recognition as architecture | **Scaffolded** (`lib/sparkRecognitionEngine/`) — **not wired** |
| Recognition as member experience | **Partial / fragmented** (Evidence Bank, Wins This Week, Celebration Hall, Portfolio) |
| Architecture Library 001–130 | **Incomplete on disk** — 001–080 + 129–130 in v4; 081–088 in vs3 temp; **089–128 missing** |
| Biggest risk | Naming collisions + dual systems make “Hall / Vault / Garden” feel like software tools, not one Estate |

### Spark Estate™ Readiness

**Overall: 48 / 100**

The Estate *idea* is ahead of the Estate *implementation*. Members can chat, create, plan, and visit some rooms. They cannot yet live the Recognition journey the master engine describes (Discovery → Vault → Garden/Room → Legacy → Hall → Rediscovery) as one continuous experience.

---

## Part 1 — Repository Inventory

### Pages / Routes (~48)

**Core shell**
- `/` — landing / redirect  
- `/companion` — **Welcome Home™** main chat + Estate shell (`CompanionPageClient`)  
- `/companion/login`, `/login` — auth  

**Grow wing**
- `/companion/grow`, `/observatory`, `/spark-cards`, `/daily-discoveries`, `/guilds`, `/momentum-builders`, `/business-history`  
- `/companion/momentum-builder`, `/companion/focus/quick-recharge`  

**Founder (member + admin)**
- `/companion/founder/*` (room, archives, workspace, settings, favorites, recent, login)  
- `/founder/*` (dashboard, health, analytics, insights, workspace, product, experiments, login)  

**Estate / collection**
- `/estate-guide/[id]`, `/estate-collection/[roomId]`  
- `/estate-map-prototype`, `/estate-guide-prototype`, `/spark-alpha`  

**Prototypes / QA (still routed)**
- `/prototype/*`, `/workspace-prototype`, `/companion/*-prototype`, `/companion/collection-flow-qa`, `/companion/continuity-audit`, `/companion/trust-inspector`, `/companion/workspace-test`  

**Ecosystem**
- `/ecosystem/dashboard`, `/ghl/dashboard`  

### Components (~783 TSX)

Major groups: `companion/` (shell, estate chrome, chamber, momentum builder), `workspace/`, `create/`, `brain-dump/`, `plan-my-day/`, `projects/`, `stables/`, `momentum-institute/`, `soundscapes/`, `recognition/` (milestone UI), `evidence-bank/`, `surveys/`, `settings/`, `journal-gazebo/`.

### Stores (localStorage-first)

Primary: `lib/companionStore.ts` (conversation, brain dumps, XP, templates, snippets, profile, time blocks, projects, prefs, voice).  

Recognition-adjacent: `evidenceBankStore`, `growthWinsStore`, `growthJournalStore`, `growthPortfolioStore`, `growthCaptureStore`, `lib/recognition` (date milestones), collection generic stores, `assetLibraryStore`, `estateMemoryStore`, **`sparkRecognitionEngine/store` (unwired)**.  

~25+ additional domain stores (journal gazebo, institute, conversation session, intelligence-layer, etc.).

### AI workflows

- **Primary:** `POST /api/companion-chat` (gpt-4o-mini) + `lib/companionPrompt.ts`  
- **Orchestration:** primary turn classifier, estate command router, frictionless layer, collection offers, decision engine, human conversation enforcement  
- **Create:** generate / refine / remix / score / draft-review / email / avatar-research / project-brain  
- **Other:** braindump-classify, TTS, ecosystem advisor/briefing/postcraft, institute curriculum  

### Rooms (canonical registry)

~60+ places across living / destinations / collections / transitions.  

**Live (approx):** sunroom, greenhouse, butterfly-house, stables, decision-compass, portfolio, goals-projects, institute-cabinet, growth-profile, my-estate.  

**Recognition-relevant place IDs:** `evidence-vault`, `gardens`, `celebration-room`, `gallery-of-firsts` — mostly `needs-asset` / partial UI via *different* section IDs.

### Features (major)

Companion chat · Clear My Mind · Create Studio · Templates/Snippets · Plan My Day · Projects · Momentum Builder · Momentum Institute · Soundscapes · Evidence Bank · Wins This Week · Celebration Hall · Journal Gazebo · Surveys · Collections Framework · Spark Cards · Google Workspace · Voice/TTS · Chamber of Momentum · Decision Compass · Stables · Ecosystem/GHL · Member auth  

### APIs (~51)

Companion chat, TTS, auth (5), content AI (12), Google (7), founder (3), ecosystem (14), GHL (2), debug (1).  

**No dedicated recognition APIs.**

### Database

- **Member recognition:** none (localStorage only)  
- **Supabase:** ecosystem signals/drafts/revenue/cost/postcraft + founder workspace tables  

### Utilities (`lib/` domains)

`estate/`, `estateIntelligence/`, `estateMemory/`, `conversation/`, `sparkRecognitionEngine/`, `recognition/` (milestones), `universalCreation/`, `momentumInstitute/`, `intelligence-layer/`, `companionBrain/`, `welcomeHome/`, `journalGazebo/`, `planMyDay/`, `supabase/`, plus many more (~180+ module folders).

---

## Part 2 — Recognition Audit

| Feature | Exists | Partial | Missing | Score | Evidence |
|---------|--------|---------|---------|-------|----------|
| Evidence Vault™ | | ✓ | | **65** | UI via `evidence-bank` section + `EvidenceBankPanel`; store `companion-evidence-bank-v1`; place id `evidence-vault` |
| Celebration Garden™ | | ✓ | | **60** | `WinsThisWeekPanel` + `celebration-garden` collection; live win-phrase offers; engine id `gardens` ≠ live id |
| Celebration Room™ / Hall | | ✓ | | **50** | `celebration-hall` collection under `growth-reports`; no dedicated shell; name split room/hall |
| Legacy Studio™ | | | ✓ | **8** | Only in unwired `sparkRecognitionEngine` types/routing/coldStart |
| Hall of Accomplishments™ | | | ✓ | **12** | Engine id `gallery-of-firsts`; live nav often → Portfolio; Asset Library `the-gallery` is different |
| Shared RecognitionRecord / HallExhibit | | ✓ | | **70** | Fully typed + store + tests; **not wired**; no adapters to legacy stores |
| Tone routing (Garden vs Room) | ✓ | | | **80** | Implemented in engine; wrong live room ids if wired today |
| Never-auto-induct Hall | ✓ | | | **90** | Enforced in lifecycle/store; N/A in product until Hall exists |
| Cold-start copy | ✓ | | | **85** | Engine only; collection empty messages exist separately |
| Conversation recognition triggers | | ✓ | | **55** | Live: win regex → garden offer; Engine triggers richer but unused |
| `lib/sparkRecognitionEngine/` wired | | | ✓ | **10** | Scaffold + tests; **zero** `app/` imports |
| `lib/recognition/` (milestones) | ✓ | | | **75** | Birthday/anniversary/etc. — **separate product** |

**Recognition subsystem average: ~52 / 100**

---

## Part 3 — UX Audit

*(Docs 101–110 are **not present** in-repo. Evaluated against Recognition Engine UX expectations + Collection Framework + Phase 1 audit.)*

| Area | Status | Notes |
|------|--------|-------|
| Entry flows | Partial | Welcome Home strong; recognition rooms entered via sidebar sections, not a Recognition hub |
| Exit / back | Exists | Collection panels support `onBack` |
| Navigation | Partial | Estate menus + aliases rich; recognition IDs fragmented; Hall→Portfolio wrong |
| Search | Partial | Per-collection search; no unified recognition search |
| Print | Partial | Evidence bank print; not shared recognition export suite |
| Export | Partial | Evidence txt + some memory batch export; missing Print/PDF/Word/MD suite |
| Attachments | Partial | Asset library + some collection rooms; RecognitionRecord `attachmentIds` unused |
| Room transitions | Weak | Hard section swaps; little cinematic recognition journey |
| Empty states | Exists | Collection empty messages + engine cold-start (unused) |
| Error states | Weak | Global chat errors; little room-specific recovery |

---

## Part 4 — AI Audit

*(Compared to available learning/relationship docs 049–080, Recognition Engine, conversation pipeline, and recent routing fix. Docs 111–130 mostly missing except 129–130 admin.)*

| Question | Answer |
|----------|--------|
| Does Spark feel like one companion? | **Mostly yes in chat** — one Shari voice with heavy enforcement. **Less so across rooms** — Create / collections / Estate menus can feel like separate products. |
| Does Spark know what room it is in? | **Partially.** Client resolves `currentEstateRoomId` for routing; chat API does not take an explicit `currentRoom`; recognition sections often missing from estate section map. |
| Does Spark lose context? | **Yes, easily.** Conversation clear in many places; session vs local storage split; recognition flow state (if wired) is sessionStorage. |
| Does Spark restart conversations? | **Can feel like it** when history cleared or section swaps drop conversational thread. |
| Does Spark recommend appropriately? | **Improving.** Substantive-help guard (2026-07-09) stops strategy questions becoming room menus. Collection offers still compete with Create. |
| Does Spark preserve meaning? | **Intent yes, system no.** Evidence/wins/journal stores preserve content; no shared lifecycle “how should this be remembered?” |
| Does Spark force workflows? | **Sometimes.** Discovery language can still lean Create; surveys historically over-offered (now guarded for strategy asks). Recognition Engine rule “Spark suggests, member decides” is not yet the product spine. |

---

## Part 5 — Emotional Audit

| Room / surface | Welcoming | Calm | Meaningful | Beautiful | Cluttered | Confusing | Mechanical | Like software | Like Spark Estate™ |
|----------------|-----------|------|------------|-----------|-----------|-----------|------------|---------------|-------------------|
| Welcome Home™ | High | Med | Med | Med–High | Med | Low–Med | Med | Sometimes | **Closest** |
| Evidence Bank / Vault UI | Med | Med | High potential | Low–Med | Med | **High** (Bank vs Vault) | High | **Yes** | Partial |
| Wins This Week / Garden | Med | **High** | Med | Med | Low | Med (naming) | Med | Sometimes | Partial |
| Celebration Hall | Med | Low | Med | Med | Med | **High** (Hall vs Room) | Med | Yes | Partial |
| Portfolio / “Hall” target | Low | Low | Med | Low | Med | **Very high** | High | Yes | **No** |
| Journal Gazebo | High | High | High | High | Low | Low | Low | Less | **Yes** |
| Peaceful Places / soundscapes | High | **Very high** | Med | High | Low | Low | Low | Less | **Yes** |
| Create Studio | Med | Low | Med | Med | **High** | Med | High | **Yes** | Weak |
| Momentum Builder / Chamber | Med | Med | High | Med | Med | Med | Med | Sometimes | Emerging |
| Legacy Studio | — | — | — | — | — | — | — | — | **Missing** |
| Hall of Accomplishments | — | — | — | — | — | — | — | — | **Missing** |

**Emotional verdict:** The Estate *feels* most real in calm/ambient rooms (Journal Gazebo, Peaceful Places, Welcome Home). Recognition surfaces still feel like **productivity panels with Estate names**.

---

## Part 6 — Architecture Audit

| Spec pillar | Compliance | Notes |
|-------------|------------|-------|
| Recognition Engine as SoT | Low | Doc exists; runtime scaffold exists; product still uses legacy stores |
| Shared data model | Low–Partial | Types ready; adapters missing |
| Routing | Partial | Estate routing mature; recognition flow ownership missing; recent substantive-help fix helps |
| Lifecycle | Scaffold only | Engine lifecycle not driving UI |
| Room ownership | Weak | Multiple IDs per concept; Hall→Portfolio |
| Context locking (`visual_room` etc.) | Scaffold only | Not integrated into shell |
| Hall philosophy | Non-compliant | No exhibit engine; auto-induct N/A but destination wrong |
| Evidence philosophy | Partial | Capture exists; not “lowest-friction discovery → remember” spine |

### Architecture Library coverage note

| Range | On disk | Audit implication |
|-------|---------|-------------------|
| 001–080 | Mostly in v4 | Usable for business/learning/relationship intent |
| 081–088 | vs3 temp only | Analytics not ingested |
| 089–128 | **Missing** | Cannot fully audit UX 101–110 or conversation ops 111–128 against numbered docs |
| 129–130 | Present | Admin/library management only |
| Recognition master | Present | Primary SoT for this audit |

---

## Part 7 — Technical Debt

1. **Triple place registry** (manifest / canonical / room registry / aliases)  
2. **Naming collisions:** evidence-bank vs vault; wins-this-week vs gardens vs celebration-garden; celebration-room vs celebration-hall; gallery-of-firsts vs portfolio vs the-gallery vs achievement-library  
3. **`lib/recognition/` vs `lib/sparkRecognitionEngine/`** namespace collision  
4. **Unwired recognition engine** alongside live collection offers  
5. **`CompanionPageClient` monolith** (~20k lines)  
6. **13+ prototype/QA routes** in production app tree  
7. **localStorage fragmentation** — no multi-device recognition  
8. **Collection offers vs Create vs task lock** contention  
9. **“Already here”** without reliable `visual_room`  
10. **Dead / missing immersive Evidence Vault modules** referenced in older docs  

---

## Part 8 — User Journey Audit

| Journey | Status | Friction |
|---------|--------|----------|
| Discovery → Evidence Vault™ | Partial | Capture possible via Evidence Bank; naming/routing confusion; Create may steal discovery language |
| Discovery → Celebration Garden™ | Partial | Win phrases can offer Garden; not unified with Evidence lifecycle |
| Celebration → Legacy Studio™ | **Broken / missing** | Legacy Studio does not exist in product |
| Legacy Studio™ → Hall | **Missing** | No Legacy, no Hall exhibits |
| Hall → Search | **Missing** | No Hall; search is per-collection only |
| Search → Rediscovery | **Missing** | No rediscovery engine |
| Voice journey | Partial | TTS + voice meter exist; not recognition-native |
| Mobile journey | Unknown / weak | Shell is desktop-heavy; recognition panels not audited as mobile-first |

---

## Part 9 — Production Readiness

| Category | Score /10 | Notes |
|----------|-----------|-------|
| Accessibility | 5 | Some structure; no systematic a11y program visible for Estate rooms |
| Performance | 6 | Large client shell; many local stores; risk of jank |
| Security | 6 | Auth exists; member data mostly local; API keys server-side patterns present |
| Responsiveness | 5 | Estate experiences uneven on small screens |
| Reliability | 5 | Chat strong; recognition journeys incomplete |
| Error recovery | 5 | Global handlers; weak room-level recovery |
| Offline behavior | 4 | localStorage helps; no offline strategy for recognition sync |
| Loading states | 5 | Present in places; inconsistent |

---

## Part 10 — Estate Scorecard

| Category | Score /10 |
|----------|-----------|
| Architecture (docs + intent) | **8** |
| Architecture (implementation fidelity) | **4** |
| UX | **5** |
| AI companion coherence | **6** |
| Recognition | **4** |
| Estate Feel | **6** |
| Emotional Design | **5** |
| Accessibility | **5** |
| Performance | **6** |
| Production readiness | **5** |

### Spark Estate™ Readiness

**Overall: 48 / 100**

---

## First-time member: confuse / frustrate / delight

### Confuse
- “Evidence Bank” vs “Evidence Vault™”  
- “Wins This Week” vs “Celebration Garden™”  
- Asking for Hall of Accomplishments and landing in Portfolio / Asset Gallery  
- Strategy questions historically becoming room lists (now fixed in routing — still a trust scar if remembered)  

### Frustrate
- Wanting to *remember* something and being pushed into Create  
- No clear path from a quiet win → story → Hall  
- Prototypes and founder/admin surfaces leaking into the mental model of “the Estate”  
- Losing chat context when switching sections  

### Delight
- Welcome Home presence and calm rooms (Journal Gazebo, Peaceful Places, Greenhouse)  
- Feeling *accompanied* in chat when Shari stays in conversation and actually helps  
- Collection empty states that speak Estate language  
- Soundscapes / ambient rooms that feel like place, not panels  

---

## Highest Priority Fixes

1. **Approve & wire Recognition foundation** — `visual_room` + already-here gate + turn ownership (do not rebuild Vault UI yet).  
2. **Resolve naming map** — publish one ID table: Vault / Garden / Celebration Room / Legacy / Hall ↔ section ↔ store ↔ place.  
3. **Stop Hall → Portfolio** — either stub Hall honestly or block the alias until exhibits exist.  
4. **Preserve-first for discovery language** — keep Create from owning “I don’t want to forget.”  
5. **Ingest Architecture Library gaps** — 081–088 + locate/write 089–128 before claiming full 001–130 compliance.  
6. **Hide or gate prototype routes** in production builds.  

---

## Recommended Build Order

1. **Foundation wiring** (already built, awaiting approval) — room state + classifier hooks  
2. **Evidence Vault™** — adapt Evidence Bank → RecognitionRecord `discovery`  
3. **Celebration Garden™** — adapt wins store; align `gardens` ↔ `celebration-garden`  
4. **Celebration Room™** — align hall/room IDs; festive path  
5. **Legacy Studio™** — new surface (optional journaling)  
6. **Hall of Accomplishments™** — exhibits + never-auto-induct + search/rediscovery  
7. **Unified search / export / attachments** across recognition types  
8. **Mobile + a11y pass** on recognition rooms  

---

## Final Deliverables Checklist

- [x] Executive Summary  
- [x] Repository Inventory  
- [x] Feature Inventory (within Parts 1–2)  
- [x] Architecture Compliance  
- [x] UX Findings  
- [x] AI Findings  
- [x] Emotional Experience Findings  
- [x] Technical Debt  
- [x] Highest Priority Fixes  
- [x] Recommended Build Order  
- [x] First-time confuse / frustrate / delight  

**Related prior work:** `PHASE_0_REPOSITORY_INTELLIGENCE.md`, `PHASE_1_ARCHITECTURE_AUDIT.md`, `PHASE_1_FOUNDATION_PLAN.md`, `SPARK_RECOGNITION_ENGINE.md`
