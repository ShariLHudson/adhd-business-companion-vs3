# Work Intent Ownership Audit

**Status:** Read-only audit. No fixes in this pass — mapping only, per founder instruction.
**As of:** 2026-08-07.
**Method:** four parallel read-only investigations (Subagent Safety Rule observed throughout — no `git checkout`/`reset`/`stash`/`clean`/`restore`, only `status`/`diff`/`show`/`log` and file reads), partitioned by system layer, then synthesized here. Every claim below traces to a specific file:line cited by the investigating agent; genuine uncertainty is flagged, not silently resolved.

**Verbs audited:** create, write, plan, develop, build, improve, organize, design, launch, start.

---

## Headline finding

**At least ten distinct systems can independently claim a work-shaped chat message, most of them running *before* Work Recognition ever gets a chance — and Work Recognition's own late fallthrough is, by explicit design, the very last thing checked.** The desired end state (Work Recognition → Understanding Journey → Workspace/Chamber/Business Builder, with no legacy path silently claiming ownership first) is not the current architecture's default outcome for most common phrasings of these ten verbs. It is closer to the opposite: a message has to survive roughly a dozen earlier checks, several of which open a **legacy** workspace directly and never consult Work Recognition or `entranceUnderstanding.ts` at all, before Work Recognition is even consulted.

A second, independent finding: **verb coverage is inconsistent across every one of these systems.** At least eight separately-maintained regex/verb lists were found, and no two of them agree on which of the ten verbs count as "work intent." `improve`, `organize`, `launch`, and `start` are the weakest-covered across the board — several systems recognize none of them at all as governing verbs, only as trailing nouns paired with a recognized artifact/room name.

---

## Part 1 — The full precedence order (one turn, top to bottom)

This is the single most load-bearing artifact in this audit: the actual order `app/companion/CompanionPageClient.tsx`'s `handleSend` checks things, for a plain chat message. Everything above the "Work Recognition" line can independently claim the turn and prevent it from ever being reached; everything above the "`resolveFrictionlessAction` call" line can prevent that entire function — and therefore its ~57 internal branches, including Work Recognition — from running at all.

| Order | System | File:line | Can open a workspace without ever reaching Work Recognition? |
|---|---|---|---|
| 1 | Hard-navigation "open create mode" | `lib/hardNavigationCommands.ts:39-50` | Yes — legacy `content-generator` |
| 2 | `resolveCreationTurnEnvelope` (creation eligibility classifier, computed once at the top of `handleSend`) | `CompanionPageClient.tsx:14722` → `lib/createIntent/creationExecutionEligibility.ts:78-93` | Classification only, but gates rows 3 and 9 |
| 3 | **`blockedCreateGuard` early-return** | `CompanionPageClient.tsx:15300-15343` | **Yes — legacy `content-generator`, via `openCreateWorkspace({roomNavigation:true})`, `return`s before `resolveFrictionlessAction` is ever called** |
| 4 | `routeConversationTurn` → direct-navigation effect | `CompanionPageClient.tsx:15243-15291`, `lib/conversationRouter/classifyTurnIntent.ts` | Yes — legacy `content-generator` (only when paired with an explicit nav verb, e.g. "go to") |
| 5 | `primaryTurnClassifier` (`TASK_REQUEST_RE`) | `lib/conversation/primaryTurnClassifier.ts:70-104`, consumed at `CompanionPageClient.tsx:15479` | Annotation only — but sets `blockKernelNavigation:true`, suppressing yet another pre-frictionless path (the "kernel" `classifyCompanionIntent`/`executeCompanionIntent` navigation at `CompanionPageClient.tsx:17719-17872`) |
| 6 | `sparkDecisionEngine` (`CREATE_RE`/`CREATE_DO_RE`) | `lib/sparkCompanion/sparkDecisionEngine/classifyIntent.ts:19-20`, reconciled via `lib/sparkCompanion/intentAdapter.ts:83-148` | Annotation only, but can forcibly override row 5's classification — a *third*, independently-drifted verb list |
| 7 | `turnAuthority` (`EXPLICIT_CREATE_COMMAND_RE`) | `lib/shariAnswerFirst/turnAuthority.ts:58-153`, computed at `CompanionPageClient.tsx:14795` | No direct open, but sets `owner:"create_execution"`, which gates whether `resolveFrictionlessAction`'s own reply (including Work Recognition's) is even shown at all (`frictionlessBlockedByTurnAuthority`, `CompanionPageClient.tsx:19025-19029` — this exact gate was found live-blocking Phase C-2 and partially fixed this session, commit `1a6d55a3`) |
| 8 | **`resolveCreateFastPathAction`** — a function that lives in the same file as `resolveFrictionlessAction` but is a **separate export, never calling it** | `CompanionPageClient.tsx:16161-16260` → `lib/frictionlessActionLayer.ts:4556-4587` | **Yes/No — for `isSimpleCreateRequest`-matching text (create/write/plan/develop/build/design generically), this runs and `return`s, so `resolveFrictionlessAction` (and everything inside it, including Work Recognition) never runs for that turn at all.** Confirmed the clearest full-bypass case in the audit. |
| 9 | `governFrictionlessDecisionByEnvelope` — post-hoc | `lib/createIntent/creationTurnEnvelope.ts:126-143`, applied inside `resolveFrictionlessAction` (`frictionlessActionLayer.ts:4589-4602`) | Suppresses (rewrites to `none`) whatever `resolveFrictionlessActionImpl` decided — **including a Work-Recognition-produced decision** — if the message reads as "exploratory" and row 2 flagged it eligible. Row 2's own eligibility gate only recognizes the literal word "create," so this suppression's reach differs unpredictably by verb. |
| — | **`resolveFrictionlessActionImpl` runs** (see Part 2 — ~57 internal branches) | `frictionlessActionLayer.ts:3996-4551` | — |
| 57 (last) | **Work Recognition's late fallthrough** | `frictionlessActionLayer.ts:4539` → `lib/estateBrain/workRecognitionFallthrough.ts:431` | Only reached if all 56 prior internal branches AND all 9 outer layers above declined |

**Also found, structurally separate from the ranked list above (Chamber/Board-specific):**
- `lib/chamber/chamberConversationLock.ts:12-20` — while a Chamber member conversation is genuinely active, **every** immediate-open field (including Work Recognition's `immediateCreateFoundationOpen`) is suppressed outright, keeping the turn in Chamber chat. No Board equivalent exists.
- `lib/conversationContinuity/resolveContinuityGate.ts:333-399` + `lib/memberIntent/classifyMemberIntent.ts:114-159` — symmetric Chamber/Board "soft invite" claims (e.g. legal/liability language), documented as outranking Create in priority, reachability against the ten verbs not fully resolved (see uncertainty notes, Part 5).

---

## Part 2 — `resolveFrictionlessActionImpl`'s own ~57 internal branches

Once (and only once) a turn survives Part 1, it enters `resolveFrictionlessActionImpl` (`frictionlessActionLayer.ts:3996-4551`), which itself checks roughly 57 branches in sequence before Work Recognition's late fallthrough (#57) is ever reached. The verb-relevant ones:

| # | Line | Branch | Verb relevance | Routes to | Workspace |
|---|---|---|---|---|---|
| 8 | 4145 | `tryWorkRecognitionResumption` | create/plan/develop/build/improve (active session only) | Continues an already-open Work Recognition journey | Only via Phase C-2's typed-confirm path |
| 19 | 4266 | `resolveFrictionlessForPrimaryTurn` (`TASK_REQUEST` case) | duplicates the CREATE FAST PATH block's own logic, scoped to `primaryTurn.type==="TASK_REQUEST"` | Same as #26 | Same as #26 |
| **26** | **4323-4345** | **CREATE FAST PATH** — `isSimpleCreateRequest` | create/write/plan/develop/build/design generically; improve/organize/launch/start only paired with a recognized artifact noun | `tryUniversalCreationFlow` (dead end) → Create-Foundation gate (Phase C-1/C-2, **current**) → else dead `none`/thin recovery reply | CreateEstateWorkingPanel (Create-Foundation path only) or none |
| **33** | **4381** | `tryUniversalCreationFlow` (2nd call site) | same as #26 | Own multi-turn Q&A, never opens a workspace | **None — confirmed dead end** |
| 34 | 4384 | Discovery flow's `create_open` action | — | Sets legacy `immediateCreateOpen` | Legacy `content-generator` |
| **38** | **4403** | `tryImmediateEstateExperienceAction` → `buildDirectActionDecision` → `resolveImmediateCreateAction` | create/write/build/design reach it via `isRegistryArtifactExecution`'s `ARTIFACT_CREATE_VERB_RE`; plan/develop/improve/organize/launch/start only via need-phrasing + a narrow noun-collision-class carve-out | `immediateCreateOpen` | **Legacy `content-generator`** — confirmed the older `ResolvedArtifact`-based mechanism that live-blocked Phase C-2 before its `turnAuthority` fix |
| 38b | 3493 | same function → `resolveImmediateCreateProjectAction`/`isProjectCreationIntent` | create ("create a project"); start/organize only in fixed phrasings ("start a new project," "organize this as a project") | `immediateCreateProjectOpen` | **Project Homes — not a Create artifact workspace at all** |
| 38c | 3511 | same function → `resolveImmediateMomentumAction`/`isMomentumForwardIntent` | plan only inside fixed compound phrases ("business plan," "weekly planning," "action plan," "roadmap") — never bare "plan X" | `immediateMomentumOpen` | **Project Homes — not Create** |

**Full verb-coverage matrix across every regex found, Parts 1 + 2 combined:**

| Verb | `creationExecutionEligibility` (canonical authority, row 2) | `SIMPLE_CREATE_VERB_RE` (row 8/#26) | `TASK_REQUEST_RE` (row 5) | `CREATE_RE`/`CREATE_DO_RE` (row 6) | `EXPLICIT_CREATE_COMMAND_RE` (row 7) | `ARTIFACT_CREATE_VERB_RE` (#38) | Work Recognition `EXPLICIT_VERB_RE` |
|---|---|---|---|---|---|---|---|
| create | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| write | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| plan | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| develop | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| build | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| improve | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| organize | ❌ | ❌ | ✅ ("help me organize") | ❌ | ❌ | ❌ | only via gerund inside two shape detectors, mislabeled build/improve |
| design | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| launch | ❌ | ❌ | ❌ | only "should I launch" → routed to THINK, not CREATE | ❌ | ❌ | ❌ |
| start | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

Six independently-maintained verb lists, and **no two of them agree.** `improve` is recognized by exactly one (Work Recognition itself). `launch` and `start` are recognized by none of these six as governing verbs at all.

---

## Part 3 — Standalone artifact-type engines (parallel discovery "brains")

These are systems that, once triggered, run their **own** question-and-answer conversation — a structurally different concern from Part 1/2's routing/classification layers, because these actually *duplicate* what `entranceUnderstanding.ts` does, under different question sets.

| Engine | Trigger | Own discovery conversation? | Reaches Work Recognition/entranceUnderstanding? | Workspace | Verdict |
|---|---|---|---|---|---|
| **Universal Creation orchestrator** (`lib/universalCreation/orchestrator.ts`) + `UNIVERSAL_DOCUMENT_PLUGINS` (`documentRegistry.ts:30-404`, 18 active plugins) | `isSimpleCreateRequest`/`detectUniversalDocumentType` — same asymmetric verb coverage as Part 2 | Yes — its own in-chat Q&A (`startUniversalCreationTurn`/`advanceUniversalCreation`) | No — orchestrator never imports `entranceUnderstanding.ts` | **None — confirmed dead end.** File header: `@deprecated` | **Legacy dead end.** |
| **`PRE_WORKSPACE_DISCOVERY_UC_TYPES`** (6 types: email, sales_funnel, website, presentation, business_plan, social_post) — `lib/creationIdentity/createFoundationRouting.ts:23-30` | Deliberate carve-out — Work Recognition's own Phase C-1 gate declines these on purpose | Yes — same dead-end orchestrator, asking its own questions from `documentCreationProfiles.ts`, **not** `entranceUnderstanding.ts`'s `create-goal/outcome/why/audience/existing` set | No, by design | None (dead end, same as above) | **Confirmed live, deliberately out-of-scope-for-C1 legacy path** — genuinely separate question wording for 6 whole document types. |
| **Events Intelligence** (`lib/eventsIntelligence/`) | `EVENT_GOAL_RE`/`shouldRouteToEventsIntelligence` — leading verbs create/plan/build/organize/design (via help/want/need wrappers); write/launch/start/improve/develop not covered as leading verbs | Yes — **own 7-question foundation set** (`q-outcomes/audience/purpose/format/dates/budget/venue`, `lifecycle.ts:62-118`), own `EventRecord` model, own storage, own lifecycle phases | Not from chat's main pipeline (zero references in `frictionlessActionLayer.ts`) — reached only via non-chat entry sources (dashboard/notification/board/search) or *after* `entranceUnderstanding.ts` already ran and the member confirmed | Yes — Event workspace/Current Focus | **Genuine standalone duplicate — the strongest one found.** Unlike SOP's discovery focus (which explicitly reuses `entranceUnderstanding.ts`'s questions verbatim), Events Intelligence authors **new** discovery logic overlapping outcome/audience/purpose under different question ids, asked a second time inside the workspace after the member already answered similar questions once. |
| **UWE Marketing Plan / Business Plan / Facebook Community** (`lib/universalWorkEngine/packages/*`) | Noun-driven, largely verb-agnostic (all 10 verbs trigger when paired with the right noun); Facebook Community is the sole engine with explicit `start`/`launch` verb coverage | No dedicated pre-open interview — routing metadata only, feeding artifact-type resolution before `entranceUnderstanding.ts`'s questions | Yes — pre-open discovery is still `entranceUnderstanding.ts`; post-open uses the **shared** UWE Adaptive Blueprint/section engine (not a second interview) | Yes, via the shared UWE runtime | **Live routing metadata, not a duplicate brain** — genuinely converges pre-open, diverges only into the shared (non-duplicative) post-open section-filling mechanism. |

**Full 10-verb coverage across every live claimant, Part 3 additions:**

| Verb | Additional recognizers found in Part 3 |
|---|---|
| organize | `EVENT_GOAL_RE`; UWE Business Plan's explicit `organiz(e/ing)` branches (physical/digital/operational/strategic) — the clearest "organize" coverage found anywhere in the audit |
| design | `document` catch-all UC plugin; `EVENT_GOAL_RE`; one specific workshop-blueprint pattern |
| launch | Facebook Community's explicit verb match; Event-domain noun phrasing ("launch event"/"launch party" — as a noun, not a governing verb); one specific product-launch blueprint pattern |
| start | **Facebook Community is the only engine anywhere in the entire audit with an explicit "start" verb match.** Every other system (Work Recognition included) omits it entirely. |

---

## Part 4 — Chamber, Board, and non-chat entry points

- **Chamber shares `handleSend` verbatim** — re-confirmed against current code (`CompanionPageClient.tsx:27171-27293`, upgraded from the earlier doc's "moderate confidence" to high). All of Parts 1-3 apply to Chamber identically, **except** one real asymmetry: `chamberConversationLock.ts` suppresses every immediate-open field (Create included) while a Chamber persona is actively engaged — keeping the turn in Chamber chat rather than opening anything. **No Board equivalent exists** for this specific suppression.
- **Board also shares `handleSend` verbatim**, confirmed the same way. Its own decision-recording flow (`recordDecision`, `assembleDirectors`) is a wholly separate UI-button mechanism, never reachable from text classification — re-confirmed, unchanged from the earlier doorway-convergence doc.
- A symmetric Chamber/Board "soft invite" mechanism exists (`resolveContinuityGate`/`classifyMemberIntent`, documented as outranking Create) — its practical reach across the ten verbs was not fully resolved (see Part 5).
- **"Business Builder" does not exist** as a named room, system, or file anywhere in `lib/` or `components/` — exhaustive grep, zero matches.
- Non-chat entry points (already well-documented pre-existing this session, cited not re-derived): the Create dropdown/catalog (`CreateEstateEntrancePanel.tsx` — the one fully-converged, intended path, per `CREATE_FOUNDATION_CONVERGENCE_REVIEW.md`), `EstateRoomExperienceMenu`'s room-gallery thunks (still bypass recognition for every room except Create, per `UNIVERSAL_DOORWAY_CONVERGENCE_MAP.md`, re-confirmed current), and `GetExpertHelpPanel.tsx`'s explicit Board/Chamber picker buttons (newly noted, not previously catalogued).

---

## Part 5 — Genuine uncertainties (flagged, not resolved)

- Exact reachability of `resolveContinuityGate`'s Chamber/Board "soft invite" branch against each of the 10 verbs' likely artifact nouns was not fully traced end-to-end.
- `resolveLegacyCreateWorkspaceGuard`'s internal "prepared_state" logic (Part 1, row 3) was not read line-by-line — its exact trigger conditions are inferred from call-site comments.
- `resolveContinuityTurnGate`'s `"destination"` action (Part 1, row 4's second trigger) was not fully traced for whether it can resolve to a Create destination without an explicit nav verb.
- `executeEstateIntelligence`/`resolveEstateIntelligenceImmediateAction`'s full capability-trigger list (Part 2, branch #15 and #38-step-1) was not exhaustively enumerated — it's a broad, string-trigger-driven system that could plausibly overlap some of the 10 verbs beyond what's cited.
- `facebookCommunity.liveRegistration.test.ts`'s existence suggests a possible second discovery mechanism for that one UWE package — not opened, not confirmed either way.
- `lib/platformIntent/classifyPlatformIntent.ts` (underlying both Events Intelligence and the 051 creation-intent resolver) was read only at the call-site level, not in full — could contain additional verb/blueprint tables.
- No standalone Checklist- or SOP-specific duplicate discovery engine was found (unlike Events Intelligence) — read as "none found," not "confirmed none exists," since a differently-named engine could exist unseen by the grep patterns used.

---

## Part 6 — The gap between current state and the desired end state

The founder's desired end state:

> All work-oriented requests converge into: **Work Recognition → Understanding Journey → Workspace/Chamber/Business Builder.** No legacy Create, Universal Creation, or ContentGenerator path should silently claim ownership before recognition.

Measured against Parts 1-4, the gap is:

1. **Nine systems run before Work Recognition even gets a chance**, three of which (`blockedCreateGuard`, `resolveCreateFastPathAction`, `tryImmediateEstateExperienceAction`'s `buildDirectActionDecision`) can open the **legacy** `content-generator`/`ContentGeneratorPanel` directly, fully bypassing both Work Recognition and `entranceUnderstanding.ts`.
2. **Two systems (`tryUniversalCreationFlow`, the base Universal Creation orchestrator) are confirmed dead ends** — they consume the turn, ask their own questions, and never open anything, so a member can get "stuck" in a conversation that structurally cannot finish.
3. **One system (Events Intelligence) is a genuine second understanding-journey brain** — not legacy, actively used, but duplicating `entranceUnderstanding.ts`'s substance under a different question set, reached from non-chat origins and again post-open.
4. **Six independently-drifted verb-recognition lists exist**, agreeing only on "create" and mostly-agreeing on "build" — meaning even where the *routing* converges correctly, *which messages count as work intent at all* is inconsistent depending on which of the nine systems happens to see the text first.
5. **Chamber has an undocumented asymmetric suppression** (Board does not) that keeps work-shaped messages from opening anything while a persona is active — arguably correct behavior, but not previously catalogued as part of the ownership map.

No fixes are proposed here, per the founder's instruction. This document is the baseline the next scoping conversation should work from.

---

## Evidence Matrix

- **Sources:** four parallel Explore-agent investigations (2026-08-07, read-only, Subagent Safety Rule observed), partitioned by layer: (1) pre-frictionless dispatch (`conversationRouter`, `turnAuthority`, `primaryTurnClassifier`, `sparkDecisionEngine`, the room-navigation dispatch), (2) `frictionlessActionLayer.ts`'s own ~57 internal branches, (3) standalone artifact-type engines (`universalCreation`, `universalCreationPlatform`, `eventsIntelligence`, `universalWorkEngine/packages/*`), (4) Chamber/Board/non-chat entry points. Cross-referenced against this session's own prior docs: `CREATE_FOUNDATION_CONVERGENCE_REVIEW.md`, `CREATE_FOUNDATION_PHASE_C_PLAN.md`, `CREATE_FOUNDATION_TRANSITION_MAP.md`, `CREATE_FOUNDATION_PHASE_C2_LIVE_VERIFICATION_FINDINGS.md`, `UNIVERSAL_DOORWAY_CONVERGENCE_MAP.md`, `UNIVERSAL_WORK_RECOGNITION_ARCHITECTURE_ANALYSIS.md`.
- **Confidence:** High for every row with a specific file:line citation (the large majority). Moderate for the items listed in Part 5, explicitly flagged rather than asserted.
- **Not done in this pass:** no code changed, no fixes proposed. This is a mapping exercise only, per explicit instruction.

**Decision Owner:** Founder. Awaiting direction on which gap(s) in Part 6 to scope first.
