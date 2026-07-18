# Production-Readiness Audit — Conversation Architecture 182–207

**Date:** 2026-07-18  
**Repo:** `c:\Users\Shari\spark-ecosystem-v4\companion-app`  
**Auditor role:** Production readiness (not a changelog)  
**Production deployed as part of this work:** **No**

---

## Executive verdict

| Question | Answer |
|----------|--------|
| Is CIE real code or docs only? | **Real code** — `lib/conversationIntelligenceEngine/` |
| Is CIE on every conversational surface? | **No** — Talk It Out only |
| Is Talk It Out production-ready? | **No** — engine strong locally; not committed; auth preview not signed off; dual state remains |
| Is the tree safe to deploy? | **No** — ~874 dirty paths; `tsc` **111 errors**; CIE/TIO packages largely **untracked** |
| Single source of truth for conversation? | **No** — five dialects still run (CIE/TIO, Create polish, global LLM, Chamber persona, Board templates) |

**Overall production readiness: ~38%**

---

## 1. Repository status

### Branch & sync

| Item | Value |
|------|--------|
| Current branch | `deploy/companion-app-v3` |
| Tracks | `origin/deploy/companion-app-v3` |
| Working tree | **Massively dirty** — ~874 porcelain lines (~466 modified, ~405 untracked) |
| Merge conflicts | **0** conflict markers found |
| CIE / 200–207 code | Present on disk; **mostly uncommitted / untracked** |
| Other notable branches | `main` ahead of `origin/main` by 2; several `cursor/*` branches ahead by 1 |

### What has changed locally (conversation-critical)

**Untracked (not in git history yet — highest risk of loss):**

- `lib/conversationIntelligenceEngine/` (entire CIE)
- `lib/conversationDesignPatterns/`
- `lib/talkItOut/{experienceStandard,strategyLibrary,modeBoundaries,questionIntelligence,completionIntelligence,personalization,reentry,*.test}.ts`
- `lib/goldStandardConversationLibrary/catalog/batch2Coverage.ts` (and related gold work if untracked)
- Many `docs/navigation/19*` / `20*` reports

**Modified (tracked but uncommitted):**

- `lib/talkItOut/reflectiveEngine.ts`, `sessionStore.ts`, `types.ts`, `questions.ts`, `index.ts`, …
- `components/companion/TalkItOutPanel.tsx`
- CQRI / RCI / CI files that removed “Take your time…” / invite-continue ghosts
- Huge unrelated WIP (Create, CPC, estate CSS, docs, portraits, Parking Lot, …)

### What hasn’t been committed / pushed

- **Almost all of packages 191–207 conversation work is not on a clean committed slice** suitable for review.
- Current branch tip matches remote tracking for **commits**, but **local uncommitted work is not pushed** (cannot be pushed until committed).
- Do **not** `git add .` — tree mixes Boardroom / Business Estate / portraits / Welcome styling with conversation reliability.

### Abandoned / parallel implementations

| Artifact | Status |
|----------|--------|
| `.tmp-cpc-*`, `.tmp-dg-commit/`, `.tmp-approved-upload/` | Abandoned WIP corpses |
| `/spark-alpha`, `/prototype/conversation-workspace` | Runnable prototypes, not CIE |
| `lib/sparkCoreIntelligence/.../processConversationTurn` | **Name collision orphan** (tests only) |
| `lib/sparkConversation*/*types.ts` packs | Spec/docs types; not the CIE runtime |
| Dual Board engines | `lib/boardroom` + `lib/ecosystem/board` |

---

## 2. Conversation Engine — implemented or documentation only?

| Capability | Status | Evidence |
|------------|--------|----------|
| Conversation Intelligence Engine | **Implemented (code)** | `lib/conversationIntelligenceEngine/processTurn.ts` |
| Runtime state | **Implemented** | `state.ts` → `ConversationRuntimeState`; stored on TIO as `cieState` |
| Topic Anchor | **Implemented** | TCAI + mirrored into ThinkingMap / cieState |
| Question Intelligence | **Implemented (TIO)** | `lib/talkItOut/questionIntelligence.ts` |
| Gold Standard retrieval | **Implemented** | `lib/goldStandardConversationLibrary/` ≥32 conversations |
| Validation | **Implemented + regenerates** | CIE blocking set + permanent ban scrub |
| Regeneration | **Implemented** | `repair.ts` + safeFallback; not soft-log-only for critical codes |
| Wired to Create / Chamber / Board / Shari global | **Not implemented** | Types allow modes; **zero production call sites** outside TIO |
| Docs 195–207 | **Present** | `docs/navigation/*` — do not confuse with runtime |

**Score: Conversation Engine 72%** — solid for Talk It Out; platform orchestration incomplete; uncommitted.

---

## 3. Talk It Out — file inventory

| Area | Status | Notes |
|------|--------|-------|
| Opening / copy | **Implemented** | Canonical opening matches 200 |
| Reflective draft (RCI banks) | **Implemented** | Still generates before CIE |
| CIE polish path | **Implemented** | All turn branches enter polish |
| Strategy library | **Implemented** | Move selection metadata |
| Mode boundaries | **Implemented** | Permission offers; no auto-launch |
| Question intelligence | **Implemented** | Filters + validator |
| Completion / summary | **Implemented** | Signal detection + summary |
| Personalization | **Partial** | localStorage prefs; limited UI |
| Re-entry / pause / rename / delete | **Implemented (API)** | History picker UI thin |
| Gold library | **Implemented** | Batch 1+2; anti-copy |
| Permanent regressions | **Implemented** | 86 tests green in last run |
| Authenticated preview smoke | **Not done** | Loader blocked |
| Dual state ThinkingMap + cieState | **Obsolete debt** | Both live |
| `SHARI_VOICE_OPENINGS` | **Unused / obsolete** | Dead export |

**Score: Talk It Out 78%** — strongest surface; blocked by commit hygiene, auth smoke, dual state, uncommitted CIE.

---

## 4. Create

| Area | Status |
|------|--------|
| Routing | **Partial** — intent-first helpers + still multiple UI paths |
| Blueprint / workflow state | **Implemented** — localStorage session/workflow/drafts |
| Section generation | **Implemented** — multi-panel stack (Guided / V2 / Workflow / Launcher) |
| Conversation flow | **Partial** — `createBuilderChat.polishCreateReply` = CI + grounded + CQRI; **no CIE / NHM / gold** |
| Resume | **Partial** — session stores exist |
| Validation | **Partial** — CQRI/grounded only; still has “Take your time…” empty-answer copy in Create |
| Architecture vs 182–207 | **Behind** — not a CIE consumer |

**Score: Create 55%**

---

## 5. Chamber

| Area | Status |
|------|--------|
| Routing | **Partial** — entry option menus + member gallery |
| Member selection | **Implemented** — registry / invite |
| Conversation quality | **Weak** — LLM + `chamberMemberPrompt`; **no CIE/CQRI/NHM/gold** |
| State persistence | **Partial** — patterns/prefs localStorage; chat often in-memory |
| Voice consistency | **Risk** — member persona vs “Shari is only voice” tension |
| Demo seed data | **Ghost** — `seedChamberDemoData` |

**Score: Chamber 48%**

---

## 6. Board

| Area | Status |
|------|--------|
| Routing | **Partial** — home choices + wizard |
| Deliberation | **Template/heuristic** — `generateDiscussion.ts`, not live CIE deliberation |
| Summaries / briefs | **Partial** |
| Camera states | **No cinematic camera FSM** — `BoardroomView` / Meet routes / Round Table focus / `portraitEnlarged` only |
| Member interaction | **Meet templates** + Round Table overlays |
| CIE | **Not wired** |

**Score: Board 45%**

---

## 7. Shari (global companion chat)

| Area | Status |
|------|--------|
| Global prompt / hints | **Live** — companion-chat + humanConversation / shariCompanion / intentAware |
| Routing | **Strong-ish** — estate brain + frictionless + openers |
| Fallback responses | **Live** — `coachingFallback` (recovery) |
| Hidden meaning | **Not gated** on global path |
| Acknowledgements | **Not Package 191** on global path |
| Conversation quality stack | **Talk It Out only** |
| Message persistence | **Ephemeral** React state |

**Score: Shari global 42%** (routing higher; certified conversation quality low)

---

## 8. Runtime — duplication & ghosts

See **Ghost Code Report** (section 12). Summary:

- Five conversation dialects
- Two `processConversationTurn` symbols
- ThinkingMap + cieState + activeTopicStore + impliedNeed sessions
- Legacy pause/invite strings removed from CQRI/RCI for TIO; Create still has “Take your time…”
- Bridge responder hard-disabled but scrubbers remain
- Prototype routes still callable

**Score: Runtime hygiene 35%**

---

## 9. Build status

| Check | Result |
|-------|--------|
| `tsc --noEmit` | **Fail** — **111** errors (repo-wide) |
| Conversation modules (CIE/gold/CDP) | Essentially clean; **1** TIO `responseKind` typing issue addressed in audit pass |
| CQRI | 3 `error TS1501` regex flag / target issues |
| companion-chat / CPC | Multiple hard errors (`humanEnforcement`, `setDailyOpeningHelpSuggestions`, …) |
| Lint | Not treated as green while tsc fails at this volume |
| Unit tests (conversation slice) | **86 passed** last focused run |
| Authenticated preview | **Not passed** |

**Score: Build / CI readiness 25%**

---

## 10. Production-readiness scores

| Area | Score | Why |
|------|------:|-----|
| Conversation Engine (CIE) | **72%** | Real pipeline + regen; TIO-only; uncommitted |
| Runtime State | **58%** | cieState real; dual ThinkingMap; not platform-wide |
| Topic Anchor / TCAI | **80%** | Strong on TIO; not on Shari/Create/Chamber/Board |
| Question Intelligence | **70%** | TIO-only |
| Gold Standard Library | **75%** | ≥32 certified; retrieval live; more batches still needed |
| Validation + Regeneration | **78%** | Critical bans regenerate on TIO; soft paths elsewhere |
| Talk It Out | **78%** | Best surface; auth smoke + commit missing |
| Create | **55%** | CQRI/grounded only; multi-UI debt |
| Chamber | **48%** | UX real; quality stack absent |
| Board | **45%** | Templated deliberation; dual engines |
| Shari global | **42%** | Routing yes; CIE no |
| Routing (estate-wide) | **60%** | Intent-first islands; menus remain |
| Runtime hygiene / ghosts | **35%** | Duplicates + prototypes + dirty tree |
| Build / typecheck | **25%** | 111 tsc errors |
| Authenticated regression | **10%** | Not completed |
| **Overall** | **~38%** | Not production-deployable |

---

## 11. Punch list (single source of truth)

### Priority 1 — Stabilize Conversation Engine delivery
**Estimate: 1–2 days**  
- Commit CIE + TIO 191–207 on a **narrow path-scoped branch** (never `git add .`)  
- Fix remaining TIO/CQRI type issues  
- Collapse ThinkingMap ↔ cieState dual-write plan (migrate or single writer)  
- Keep permanent regression suite green  

### Priority 2 — Finish Talk It Out production bar
**Estimate: 2–3 days**  
- Authenticated multi-turn smoke (hire → clarify → cost → correction → pause/refresh/resume)  
- History UI for rename/delete/list paused  
- Compare live turns to gold; tighten banks that still sound generic  
- Confirm no forbidden phrases in preview  

### Priority 3 — Wire Create through CIE
**Estimate: 3–5 days**  
- `polishCreateReply` → `processConversationTurn`  
- Remove Create “Take your time…” empties  
- Blueprint resume + validation gates  
- Reduce Create panel multiplicity  

### Priority 4 — Remove legacy prompts / ghost engines
**Estimate: 2–4 days**  
- Quarantine Spark Core `processConversationTurn` rename  
- Delete or archive dead `SHARI_VOICE_OPENINGS`, unused humanConversation banks  
- Disable/remove bridge dead paths cleanly  
- Inventory `.tmp-*` for deletion after migration  

### Priority 5 — Conversation testing (platform)
**Estimate: 2–3 days**  
- Gold conformance suite expanded  
- Multi-turn scenarios for Create/Chamber  
- Spec 119 gates on CIE consumers  

### Priority 6 — Authenticated regression
**Estimate: 1–2 days**  
- Signed-in preview script from 206 audit  
- Persist transcripts; compare to gold  
- Refresh/resume/topic change/short answer matrix  

### Priority 7 — Chamber + Board quality (after CIE platform)
**Estimate: 1–2 weeks**  
- Chamber: CIE + NHM + grounded; kill demo seed in prod paths  
- Board: replace template deliberation or clearly label; single store; CIE advisory mode  

### Priority 8 — Production deployment
**Estimate: only after P1–P6 green**  
- Clean typecheck on deploy slice  
- No dirty-tree deploy  
- Explicit “production not deployed” until smoke signed  

---

## 12. Ghost Code Report

### Still running (affects members)

| Ghost | Path | Risk |
|-------|------|------|
| Create CIE bypass | `lib/createBuilderChat.ts` → `deliverConversationalResponse` | Uncertified Create replies |
| Global Shari LLM path | `app/api/companion-chat` + CPC `handleSend` | No CIE/NHM/gold |
| Chamber persona injection | `lib/chamber/chamberMemberPrompt.ts` | Quality ungated |
| Board template deliberation | `lib/boardroom/generateDiscussion.ts` | Not live thought |
| Coaching fallback | `lib/sparkConversation/coachingFallback.ts` | Recovery copy |
| RCI draft banks pre-CIE | `reflection.ts` + situation banks | Can propose bad lines (CIE must catch) |
| Create “Take your time…” | `createBuilderChat.ts` ~795 | Banned on TIO, live on Create |
| Intent-aware / action-bias | CPC | Parallel “intelligence” not CIE |
| Spark Alpha / prototype routes | `/spark-alpha`, `/prototype/*` | Alternate conversation stacks |

### Old prompts still affecting responses

- RCI archetype / invite / clarification banks (TIO drafts)  
- CI softeners + fallbacks (TIO + Create)  
- Human conversation prompt blocks (global chat)  
- Chamber member prompt  
- Board Meet/director template replies  

### Duplicated conversation systems

1. CIE (`lib/conversationIntelligenceEngine`)  
2. Spark Core conversationEngine (`processConversationTurn` **orphan**)  
3. Create polish chain  
4. Global companion-chat LLM  
5. Board/Chamber specialty generators  
6. Spec type packs under `lib/sparkConversation*` (docs-shaped)

### Dead / unused / obsolete (remove after migration)

| Item | Action |
|------|--------|
| `SHARI_VOICE_OPENINGS` | Delete or stop exporting |
| Duplicate token helpers in `talkItOut/voice.ts` | Prefer RCI single copy |
| `bridgeResponder.disabled.test.ts` + hard-off bridge | Archive |
| Unused `CURIOSITY_OPENERS` / presence line exports | Delete |
| `.tmp-cpc-*`, `.tmp-dg-commit`, large upload trees | Do not commit; delete when safe |
| Ecosystem `deliberate()` vs Boardroom | Document winner; quarantine loser |
| Dual TIO state | Migrate to one runtime state |

### Dead routes

- Not “dead,” but **should not ship as product conversation**: `/spark-alpha`, `/prototype/conversation-workspace`, other prototypes  

### Unused state

- Parallel topic stores (`activeTopicStore` vs TCAI vs ThinkingMap) on different surfaces  
- Chamber demo keys when not in demo mode  

---

## 13. Explicit confirmations

1. **CIE is implemented in code**, not Markdown-only.  
2. **CIE is not platform-complete** — Talk It Out only.  
3. **Validators regenerate** on TIO for the three permanent failures.  
4. **Gold library has meaningful batch coverage (≥32)**, not three samples alone.  
5. **Authenticated preview smoke is not complete.**  
6. **Production was not deployed.**  
7. **Repository is not merge-conflicted**, but is **not deploy-clean**.

---

## Related docs

- `docs/navigation/206_TALK_IT_OUT_IMPLEMENTATION_AUDIT.md`  
- `docs/navigation/195_CONVERSATION_INTELLIGENCE_ENGINE.md` … `207_*`  
- `docs/navigation/200_207_IMPLEMENTATION_REPORT.md`  
