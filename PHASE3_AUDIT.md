# Phase 3 Conversation & Routing Architecture Audit

**Branch:** `deploy/companion-app-v3` · **Verified baseline:** `2144d535715a6cea5f8c5b79323a044827bad89d`
**Scope:** Read-only. No code changed, nothing committed. Phase 4 not begun.
**Method:** Five parallel read-only investigations across (1) conversation ownership + short-answer binding, (2) routing/navigation, (3) recommendation/suggestion injection, (4) classifiers/topic/emotional routing, (5) prompt assembly + dormant/legacy systems. Every claim is cited to `file:line`. Each finding is labelled **CONFIRMED** (code read and traced) or **HYPOTHESIS** (mechanism seen, full trigger not traced end-to-end).

> **Fact vs hypothesis discipline:** Sections marked CONFIRMED were read line-by-line. Where only the *mechanism* is confirmed but real-world *frequency/trigger* is inferred, it is labelled CONFIRMED (mechanism) / HYPOTHESIS (frequency).

---

## The one root cause (read this first)

**Phase 3 built a correct, well-typed conversation-ownership spine (`lib/conversationSession/ownership/`) — but nothing else in the turn pipeline is required to consult it.** Navigation routers, the recommendation/proactive-offer stack, the rhythm fire-loop, the acceptance regexes, and the LLM system prompt each make their own decision from the raw user string. The spine also (a) runs *late* in `handleSend` (after ~15 imperative fast-path handlers) and (b) only ever sees *structured* stores — so the single most common real event, a free-form assistant question ("want to build one?"), registers **no owner at all**, and the confirming "yes" is arbitrated by whichever subsystem happens to match first.

Every finding below is a facet of that. Fix the spine's authority (make it the one gate every actor checks, and make a trailing assistant question a first-class spine claim) and most scenarios collapse together.

---

# REPORT 1 — TECHNICAL ARCHITECTURE AUDIT

## Finding index (severity · status)

| ID | Title | Sev | Status |
|----|-------|-----|--------|
| F1 | Free-form assistant offer arms no binding; confirming "yes" is unowned | **Critical** | CONFIRMED |
| F2 | Prompt pressures the model to volunteer offers the spine never registers | High | CONFIRMED |
| F3 | Recommendation/proactive stack gated by latency, not ownership | High | CONFIRMED |
| F4 | Navigation decided without consulting spine ownership | High | CONFIRMED |
| F5 | Multiple competing navigation routers run in parallel (flag/order-decided) | High | CONFIRMED |
| F6 | Ownership turn-gate opens too late to protect early short-answer handlers | High | CONFIRMED |
| F7 | Acceptance vocabulary fragmented across ≥4 regexes; many affirmations fall through | High | CONFIRMED |
| F8 | "Awaiting answer" state tracked in ≥5 independent places | High | CONFIRMED |
| F9 | "Overwhelmed" short-circuits practical task help into a canned relief menu | High | CONFIRMED |
| F10 | Generic recovery fallback drops the active thread (context branches are dead) | High | CONFIRMED |
| F11 | A clarification silently kills a pending offer | High | CONFIRMED |
| F12 | Rhythm/reminder fire-loop speaks with no turn and no ownership check | Medium | CONFIRMED |
| F13 | "Stay here / work through it here" has no first-class guard; "take me there" overrides locks | Med-High | CONFIRMED / part HYP |
| F14 | Stale pending offer can be resumed by a later "yes" (turn-count, not topic, expiry) | Med-High | CONFIRMED (mech) |
| F15 | Chamber "specialist owns turn" has a duplicate/dead implementation | Med-High | CONFIRMED |
| F16 | ~40-stage positional precedence chain in the frictionless hub | Medium | CONFIRMED |
| F17 | No first-class side-question / auto-return; stale threads resurface at home | Medium | CONFIRMED |
| F18 | Seven topic-change detectors + nine emotional classifiers, no shared authority | Medium | CONFIRMED |
| F19 | Ownership released a turn before confirmation for informational offers | Medium | CONFIRMED (mech)/HYP |
| F20 | Ten dead prompt body fields; dormant per-domain engine stack; legacy compat layer | Med/Low | CONFIRMED |
| F21 | Wrong-room / "blue text" mis-route from weak trigger scoring | Medium | CONFIRMED (mech)/HYP |

---

### The turn lifecycle (shared context for §1–§10)

Single send handler: `app/companion/CompanionPageClient.tsx` (referred to as **CPC**). Per user turn, in line order:

1. User text committed to transcript — `appendConversationSpineTurn` (CPC:14354)
2. ~15 imperative fast-path handlers, each able to `return` — create-consent (CPC:15209), frictionless "yes" (CPC:15804), decline (CPC:16055), win-save (CPC:16649), collection (CPC:16870) …
3. Acceptance turn — `resolveCompanionAcceptanceTurn` (CPC:12957)
4. Continuity gate (CPC:14815–14901)
5. Primary classifier — `classifyPrimaryConversationTurn` (CPC:14908)
6. Universal capability — `resolveExplicitCapabilityIntent` (CPC:14992)
7. **Spine ownership resolved — `resolveConversationOwnership` (CPC:16617) + `applyOwnershipResolution` (CPC:16624)** — this runs *after* steps 2–6
8. Collection-save offer (CPC:18203), frictionless routing/navigation (CPC:18334), proactive phase 2–11 observers (CPC:18456–18501), then the LLM call (CPC:20462 → `/api/companion-chat`)

A second, parallel ownership model — `decideConversationTurnAuthority` (CPC:14385) — coexists with the spine and is unreconciled with it.

---

## §1 Conversation ownership

**Does one system clearly own each turn?** Only for signals that routed through a *structured* store (Create session, collection/win-save pending, `awaitingUserConfirmation`, spine ownership). A free-form assistant question that armed none of those leaves `currentOwner = "none"` and nothing protects the follow-up. — **F1**

**Can multiple systems act on one turn?** Yes. The declarative spine (step 7) runs *after* imperative fast-path handlers (step 2) that can each `return`; the spine's priority ladder never governs them. `pendingCreateOpen` (React state, CPC:4087) is never represented as an ownership claim, so create-consent vs collection vs frictionless is decided by code order, not intent. — **F6, F19 (O5)**

**Released too early?** For free-form offers, effectively never held: an LLM invitation never sets `awaitingConfirmation.active`, so no `confirmation` claim exists next turn (`adaptLegacyOwnership.ts:202-206`); the resolver's "acceptance stays with confirmation owner" branch (`resolveOwnership.ts:244-263`) can't fire. Structured offers (collection/win-save) *do* hold correctly via `beginSpineOwnership status:"awaiting_user"`. — **F19**

**Can background systems interrupt an active conversation?** Yes — see §5. Neither the proactive stack nor the rhythm loop consults ownership. — **F3, F12**

**Can pending collection/creation/project/navigation/recommendation state compete?** Yes — multiple pending stores can be live simultaneously and are resolved by handler order, not by the ladder. — **F6 (O5)**

> **F1 — Free-form assistant offer arms no binding; confirming "yes" is unowned · CRITICAL · CONFIRMED**
> - **Files/functions:** `lib/conversationSession/conversationConfirmationGate.ts` `CONFIRMATION_QUESTION_PATTERNS` (14-29), `messageAsksUserConfirmation` (57-61), `shouldStopAfterAssistantOffer` (63-65); CPC arming site (14309-14325); `adaptLegacyOwnership.ts` `collectOwnershipClaims` (100-307); `resolveOwnership.ts` (266-278).
> - **Runtime path:** Informational answers ("what is a customer persona") stream from the LLM, not the frictionless-local branch. The only post-response confirmation-arming code (CPC:14309) is gated by `shouldStopAfterAssistantOffer`, whose patterns are navigation phrases ("want me to open", "should I open"). "want to build one?" / "want to create one?" match **none** of them → no `awaitingUserConfirmation`, no pending create/collection, no spine ownership armed. Next turn "yes" finds all pending stores empty → `resolveConversationOwnership` returns `action:"handle_by_companion"`, `owner:"none"` → "yes" flows down to frictionless routing + phase observers + LLM, anchored to nothing.
> - **Competing systems:** With nothing owning the turn, `maybeProactiveBusinessSupport` (phase4:372) and the business-os opportunity injectors run uncontested and can steer the "yes" into a warm-relationship/opportunity suggestion — the Scenario A failure.
> - **User impact:** User says "yes" to "want to build one?" and gets an unrelated suggestion instead of the persona builder.
> - **Root cause:** No universal "assistant just asked a question → arm a topic-bound pending on the spine" step. Binding exists only for a few structured producers + a navigation-flavoured regex.
> - **Minimal safe fix:** At response-finalize, when an assistant reply ends in a question (`\?\s*$`) and nothing is already bound, arm `awaitingUserConfirmation` / spine `confirmation` ownership seeded with the topic + `expectedReply.kind`. Interim: widen `CONFIRMATION_QUESTION_PATTERNS` to include build/create/draft/make invitations.
> - **Larger fix:** ConversationSession records a first-class `pendingAssistantQuestion { topic, expectedReply, offeredAtTurn }`; `resolveConversationOwnership` treats it as top-priority; observers/frictionless are hard-gated while it is unanswered.
> - **Risk:** Medium — an over-broad question regex could capture rhetorical questions; needs turn-distance expiry + clean "decline" release.
> - **Cert tests:** persona explain → "want to build one?" → "yes"/"sure"/"let's do it"/"the first one" opens persona build, no pivot; proactive support suppressed while question pending; "no" releases cleanly.

> **F6 — Ownership turn-gate opens too late · HIGH · CONFIRMED**
> - **Files:** `beginOwnershipTurnGate` is called *only* inside `resolveConversationOwnership` (`resolveOwnership.ts:75`; grep: no other caller). Enforcement in `claimTurnOwnership.ts:105-132`.
> - **Runtime path:** ~15 fast-path handlers (CPC:15209–16350) run and `return` *before* CPC:16617. The "one successful claim per turnKey" guarantee only exists after 16617, so two early handlers can each act.
> - **Impact:** Occasional double-handling / wrong handler winning a short answer when >1 pending store is live.
> - **Minimal fix:** Call `beginOwnershipTurnGate(turnKey)` at the top of `handleSend` (~CPC:14360), before any pending handler; make it idempotent per turnKey.
> - **Larger fix:** Route every early handler's acceptance through `claimTurnOwnership`.
> - **Risk:** Low-Medium. **Cert:** both create-consent + frictionless pending live → single "yes" triggers exactly one handler; trace shows one selected owner.

> **F19 — Informational offers not held across the turn boundary · MEDIUM · CONFIRMED (mech)/HYP (freq)** — same defect as F1 viewed from the "release" side; `collectOwnershipClaims` requires `legacy.awaitingConfirmation?.active` (202-225) which free-form offers never set. Fix = F1's minimal fix.

## §2 Routing systems

**Duplicate/competing routers — CONFIRMED.** Inside `resolveFrictionlessActionImpl` (`lib/frictionlessActionLayer.ts:3846`) at least four place/experience routers can each emit navigation, tried sequentially: `executeEstateIntelligence` (:4055, flag-gated, short-circuits the Brain), `tryImmediateEstateExperienceAction` (:3250, the *declared* primary → `routeEstateIntelligence.ts:228`), `tryEstateNavigationIntelligence` (:3627, a contract-labelled "helper" running as a peer), `tryEstateNavigationPhilosophy` (:3720). Inside the "primary" router, `resolveIntentFirstRoute` (`routeIntentFirstNavigation.ts:135`) wins *unconditionally first* (`routeEstateIntelligence.ts:130-131`) before capability scoring runs. — **F5**

**Old + new paths in parallel — CONFIRMED.** The Routing Ownership Contract (`lib/estateBrain/routingOwnershipContract.ts`) *names* one primary owner but is documentation/lint metadata — nothing consumes `isPrimaryRoutingIntelligence()` at runtime to suppress the adapters/helpers. — **F5**

**Inconsistent precedence — CONFIRMED.** `resolveFrictionlessActionImpl` is a ~40-stage straight-line `if (x) return` chain; first non-null wins, so precedence is positional. — **F16**

**Route decided before conversational context resolved — CONFIRMED.** The frictionless hub is called at CPC:18334 and never receives `ownershipResolution` or `turnAuthority`; grep of `frictionlessActionLayer.ts` for `ownership|resolveOwnership|claimTurn` returns zero. Only two owners gate navigation: `create_execution` (CPC:18373) and active-Chamber (CPC:14116). Spine owners `collection_offer` and `confirmation` do **not** block navigation. — **F4**

**Navigation that bypasses ownership — CONFIRMED.** `isDirectNavigationPriorityTurn` (`lib/chatScope/directNavigationPriority.ts:23`) makes "take me to / go to / open / show me" outrank awaiting-answer locks *and* the active Chamber lock (CPC:14218). — **F13**

> **F4 — Navigation ignores spine ownership · HIGH · CONFIRMED** · Files: `lib/frictionlessActionLayer.ts` (whole module), consumed CPC:18334; gates at CPC:18373 / 14116. · Impact: while Spark is awaiting a yes/no, a message a router scores as create/momentum/place can fire an immediate room-open, abandoning the pending question. · Root cause: two parallel ownership models + a router that reads neither. · Minimal fix: pass `ownershipResolution.nextOwner` (or a `navigationAllowed` bool) into `FrictionlessActionInput`; suppress `immediate*Open` in `presentFrictionlessLocalReply` when an awaiting-reply owner holds the turn (mirror the `create_execution` gate). · Larger fix: collapse spine ownership + `turnAuthority` into one resolver that every navigation branch checks. · Risk: Medium (must not swallow legitimate explicit navigation). · Cert: pending collection_offer + "make me a checklist" → no auto-open; pending confirmation + "go to the boardroom" → allowed; create_execution active → unchanged.

> **F5 — Competing navigation routers in parallel · HIGH · CONFIRMED** · Files as above + `routeEstateIntelligence.ts:127/130/228`, `resolveEstateNavigationIntent.ts:202`, `resolveEstateNavigation.ts:131/150`, `routingOwnershipContract.ts`. · Impact: the same utterance routes differently by flag state / chain position; a "helper" can win a destination the Brain would score differently. · Minimal fix: have the helpers return null when the Brain already produced a route this turn; make `executeEstateIntelligence` feed the Brain, not short-circuit it. · Larger fix: one `resolvePlace(userText, ownership)` entry; adapters register as scorers, not parallel deciders. · Risk: Medium. · Cert: flag matrix (runtime on/off × stabilization on/off) × fixed nav phrase → single stable destination.

> **F16 — Positional ~40-stage precedence · MEDIUM · CONFIRMED** · `frictionlessActionLayer.ts:3846-4315+`. · Impact: adding/reordering any block silently changes routing (e.g. `simpleCreate` fast-path :4160 pre-empts coaching/impliedNeed). · Minimal fix: document intended precedence + invariant tests pinning key orderings. · Larger fix: scored arbiter (candidate + confidence; highest wins). · Cert: golden fixtures for phrases straddling adjacent stages.

> **F15 — Chamber "specialist owns turn" duplicate/dead impl · MED-HIGH · CONFIRMED** · `buildChamberSpecialistPrimaryTurn` (`lib/chamber/chamberConversationLock.ts:26`) sets `blockSecondaryResponders:true` but is referenced *only by its own test* — never by CPC. Live protection is the continuity gate (`resolveActiveOwner.ts:84-104`) + scattered `isChamberMemberConversationActive` checks (CPC:8368/14116/20378/22119), and the gate at CPC:14218-14220 lets `immediateEstatePlaceNavigate` **override** the chamber lock via `isDirectNavigationPriorityTurn`. · Impact: edits to the "obvious" chamber-lock helper have no runtime effect (correctness trap). · Minimal fix: wire it in, or delete it + its test. · Cert: assert production builds the chamber primaryTurn via the continuity gate; snapshot `blockSecondaryResponders` while a member is active.

> **F21 — Wrong-room / "blue text" mis-route · MEDIUM · CONFIRMED (mech)/HYP (freq)** · `routeEstateIntelligence.ts:56-67/155-161` scores by `q.includes(trigger)` with a low `score<14` cutoff and `confidence>=28 ⇒ high`; short single-word triggers (20 pts) can push a tangential capability to high. When every stage returns null the turn falls through to generic companion-chat, so a request for a specific Chamber member that no stage claims yields a generic ("blue text") answer instead of that member (the member persona hint is only injected when `chamberConversationActive`, CPC:20382). · Minimal fix: raise the confidence floor for no-confirm navigation; require verb-anchored/multi-word triggers for high; when a named member is requested but not active, route into that member (or offer a choice) rather than generic chat. · Cert: corpus of "wrong room" utterances → correct member or a clarifying choice, never silent generic.

## §3 Short-answer & confirmation handling

**Do bare affirmations bind to the most recent unanswered question before anything else acts? — NO, in two ways.** (1) When the question was free-form, there *is* no registered pending, so the "yes" binds to nothing (F1). (2) Even when a pending exists, the acceptance vocabulary is narrow and fragmented, so many of the listed answers never register as acceptance. — **F1, F7**

`conversationConfirmationGate.ts` `ACCEPT_RE` (89-90) = `^(?:yes|yep|yeah|yup|sure|ok(ay)?|please|open it|take me there|go ahead|do it|sounds good|that works|that would be great|let's do it|please do)\b`.

| Your listed answer | Recognised as acceptance? |
|---|---|
| yes / okay / let's do it | ✅ matched |
| go | ❌ not matched |
| continue | ❌ not matched (matches **no** detector at all — falls to `RELATIONSHIP_CHAT`) |
| next | ❌ not matched |
| that one / the first one | ❌ not matched (no ordinal/choice vocabulary) |
| help me with that | ❌ not matched |
| work through it here | ❌ not matched |

Plus four *different* "yes" regexes exist across modules (`pendingAcceptanceAuthority.ts:26`, `isAffirmativeReply.ts:5` — the only one matching bare "do it"/"yes please" — `assistedActionBridge.ts:27`, `conversationCommitmentEngine/affirmation.ts:6`); the central `isAcceptanceAttempt` consults only two of them, so "do it"/"yes please" is honoured or ignored depending on which path handles the turn. — **F7**

> **F7 — Fragmented acceptance vocabulary · HIGH · CONFIRMED** · Minimal fix: add choice ("the first/second one", "that one") + continuation ("continue", "next", "go") alternatives to `ACCEPT_RE`; when spine `expectedReply.kind==="choice"`, match `allowedValues`/ordinals; unify the four regexes on one exported constant and have `isAcceptanceAttempt` consult `isAffirmativeReply`. · Risk: Medium — keep decline precedence (`isPureConfirmationDecline`) so "no, take me to X" still declines-and-navigates. · Cert: offer with two options → "the first one"/"that one"/"go"/"continue"/"do it"/"yes please" each bind; "no thanks, take me to X" declines.

## §4 Topic change & continuity

- **New-topic detection — CONFIRMED fragmented:** seven separate topic-change detectors, each own regex + own consumer, run per turn and disagree (see F18).
- **Are stale pendings cleared/paused/wrongly resumed? — CONFIRMED problematic:** a clarification ("what does that mean?") is misread as a topic change and silently clears a pending offer (F11); conversely a stale offer can survive and be resumed by a later "yes" because expiry is turn-count-based, not topic-based (F14).
- **Side question then return? — CONFIRMED weak:** there is no first-class side-question/park-and-restore in chat; the user must literally say "return to the original conversation" (`conversationHandoffRecovery.ts:18`) (F17).
- **True topic change vs clarification distinguished? — NO** at the offer-invalidation path (F11).
- **Old conversations/suggestions resurface after a topic change? — CONFIRMED possible:** `companionOutcomeThread` persists `pendingAction` in localStorage and clears only on a narrow regex; misses resurface across sessions and at home entry via `companionLedContinue` (F17).

> **F11 — Clarification silently kills a pending offer · HIGH · CONFIRMED** · `pendingAcceptanceAuthority.ts:375` `topicChangeInvalidatesOffer` keys purely on word-overlap (`<12 chars ⇒ keep`, else no shared >4-char word ⇒ invalidate) and never calls `isClarificationRequest` (`clarificationDetection.ts:8`), which *correctly* classifies "what does that mean?". Consumed at CPC:16242. · Worked case: pending "hiring a marketing assistant" + "What does that mean?" (len 20, zero overlap) → offer cleared. · Minimal fix: `if (isClarificationRequest(t)) return false;` at the top of `topicChangeInvalidatesOffer`. · Larger fix: route offer-invalidation through the TCAI anchor decision. · Risk: Low. · Cert: pending offer + "what do you mean?" → preserved; + genuine new subject → cleared.

> **F14 — Stale offer resumed by later "yes" · MED-HIGH · CONFIRMED (mech)** · `pendingAcceptanceAuthority.ts:53` `PENDING_ACCEPTANCE_TURN_LIMIT=2`; `:113` expiry on turn-count OR panel change, **not topic**; `:385` word-overlap keeps the offer alive if an aside reuses any >4-char word. · Minimal fix: topic-aware expiry (clear on confirmed anchor change); drop the "shared word cancels invalidation" branch. · Risk: Medium. · Cert: offer → aside reusing one word → "yes" → offer must NOT fire.

> **F17 — No first-class side-question/return; stale threads resurface · MEDIUM · CONFIRMED** · Only side-question detector is a branch in `createTurnRelationship.ts:188`; no auto topic-stack restore (`topicHistory` restores only after a rejected misread). `companionOutcomeThread.ts:29` localStorage `pendingAction` resurfaces via `threadAwareAcceptanceFallback` (:184) across sessions; `companionLedContinue.ts:58-66` ranks stored conversation at priority 1 at home. · Minimal fix: clear `pendingAction` on any confirmed anchor change; add an abandonment/recency check before `companionLedContinue` re-offers. · Larger fix: a real conversation stack on top of `pauseResume`. · Cert: side-question → answer → offer to return; topic change → no stale resurface; abandoned topic not re-offered at next home entry.

## §5 Suggestion & recommendation injection

**Every system that can inject unsolicited content (CONFIRMED table):**

| System | File:line | Speaks unsolicited | Checks ownership |
|---|---|---|---|
| Phase 2–11 proactive stack (trust/awareness/business-partner/opportunity/reuse/BI/autonomous/wisdom/transformation/ecosystem) | CPC:18456-18501, 20646-20706; `phase4BusinessOperatingPartner.ts:372,558` | yes (deep-classified turns) | **no** |
| Business-os opportunity/health ("follow up with one warm relationship") | `business-os/businessInsights.ts:235`, `businessSignals.ts:240` → phase4 hint | yes | **no** |
| Rhythm + reminder fire-loop | CPC:7424-7451; `rhythms/delivery.ts:28,61` | **yes — no user turn at all** | **no** |
| Ecosystem Risk Engine — the exact warm-lead string | `ecosystem/intelligence/riskEngine.ts:62` | yes (founder/GHL surfaces only) | n/a (not in member chat) |
| Ecosystem Recommendation Engine (promotes topRisk) | `ecosystem/intelligence/recommendationEngine.ts:92-104` | yes (founder/GHL) | n/a |
| Board Reasoning `deliberate()` (sales warm-lead default) | `ecosystem/board/boardReasoningEngine.ts:86` | **dead code — no runtime caller** | n/a |
| Arrival greeting/presence | `arrivalIntelligence/…`; CPC:22094,24818 | yes (arrival only) | partial (CB-022 blocks generic greeting during unresolved topics) |

**Which can speak without a request?** The whole phase 2–11 stack (on deep-classified turns), the business-os layer feeding it, the rhythm loop (no turn required), and the arrival greeting.
**Can any interrupt an active conversation?** The rhythm loop can raise a notice/chime mid-turn (30s timer, no ownership check). The phase stack can't start a turn but can inject off-topic content into the current reply. **None consult `conversationSession/ownership`.**
**Do stale suggestions survive topic change?** Yes — offers derive from accumulated state with per-phase cooldowns and no topic-pivot invalidation, and `record…Shown()` fires at *compute* time so cooldowns are spent even on suppressed turns.
**One shared timing rule or several?** Several — **six** partially-overlapping gates: latency/speed profile, per-phase eligibility+cooldown, `menuContinuation.active`, `turnAuthority`, the ownership spine precedence list, and the rhythm Notification Load Manager. The two authoritative ones (turn ownership, spine) do **not** cover the two highest-volume injectors (phase stack, rhythm loop).

**Source of the exact quoted string (CONFIRMED):** `"List 3 warm leads and message one today — one touch keeps the pipeline alive."` is a hard-coded `suggestedAction` on risk `risk-no-sales` in `ecosystem/intelligence/riskEngine.ts:62-63` (fires on 14 days no sales activity), promoted to a next-action by `recommendationEngine.ts:92-104`. **It is wired only to founder/GHL surfaces, not the member Companion chat.** The member-chat analog is the business-os "warm relationship follow-up" line. A bare "yes" routes to the `instant` latency class and *skips* the phase stack (`companionLatencyProfiler.ts:181-190`), so the narrow "yes-meant-for-something-else → warm-lead" misfire is mitigated for short affirmations but **not** for longer reflective replies.

> **F3 — Proactive stack gated by latency, not ownership · HIGH · CONFIRMED (gap)** · Gate CPC:18456 checks `menuContinuation.active` but not `turnAuthority.owner`; `record…Shown()` fires at compute time (CPC:18463-18500). · Minimal fix: add a turn-ownership guard — skip phase observers unless `turnAuthority.owner==="companion"` (or explicitly proactive-eligible); move `record…Shown()` to emission (CPC:20657+). · Larger fix: route every volunteer-content generator through one spine ownership check ("may the companion speak unprompted this turn?" answered once). · Risk: Low. · Cert: mid-Create/collection-pending deep reply → no phase hint, no `Shown` increment, cooldown not consumed; `owner==="companion"` deep reply → still allowed.

> **F12 — Rhythm/reminder fire-loop speaks with no turn/ownership · MEDIUM · CONFIRMED** · CPC:7424-7451 (30s `setInterval`) → `collectDueDeliverables` raises notice card + chime + optional browser notification; only quiet-hours/caps (`rhythms/loadManager.ts`) throttle it. · Minimal fix: before `setDeliverableNotice`, if a turn is streaming/owned, queue and surface after it settles. · Risk: Low. · Cert: deliverable due mid-stream → deferred; quiet-hours respected.

## §6 Acceptance & confirmation lifecycle

- **Duplicated acceptance state — CONFIRMED (F7):** four "yes" regexes, no shared source.
- **Duplicated pending-confirmation state — CONFIRMED (F8):** ≥5 independent "awaiting answer" trackers.
- **Conflicting "awaiting answer" logic — CONFIRMED (F8):** the CPC ref can say "awaiting confirmation" while the spine says `owner:none` (adapter only lifts the ref into a `confirmation` claim when Collection-family absent AND Create absent, `adaptLegacyOwnership.ts:202-206`).
- **Gates not sharing one source of truth — CONFIRMED:** `questionGuard.ts` tracks *answered slots* (Create re-interview prevention) and is imported only by `createExperienceAdapter.ts` + the barrel — it is **not** the general awaiting-answer authority, though its name implies it.
- **A casual "yes" authorizing an unrelated action — CONFIRMED as possible (F1 + F2 + F3).**

> **F8 — "Awaiting answer" tracked in ≥5 places · HIGH · CONFIRMED** · (1) `awaitingUserConfirmationRef` (CPC:4095, 40+ mutation sites); (2) spine `expectedReply` (`adaptLegacyOwnership.ts:118/138/157`; `resolveOwnership.ts:44-47`); (3) continuity `awaitingAnswer` (`conversationContinuity/ownerStore`); (4) pending-offer stores (collection/winSave/frictionless); (5) `questionGuard` answered-slots (different axis). · Impact: divergence windows — accepted "yes" sometimes honoured, sometimes dropped to companion fallback. · Minimal fix: make spine `expectedReply` the read authority everywhere; treat the CPC ref as write-through only; document `questionGuard`'s scope. · Larger fix: collapse trackers 1/3/4 into spine `expectedReply`. · Risk: Med-High (40+ mutation sites). · Cert: property test — every `setAwaitingUserConfirmation(state)` ⇒ resolved spine owner's `expectedReply` presence matches `state.active`.

## §7 Classifiers & detectors

**CONFIRMED: a single message is scored by up to five independent intent engines per turn** (`classifyMemberIntent`, `classifyPrimaryConversationTurnLegacy`, `evaluateSparkDecisionEngine`, the acceptance regexes, `resolveExplicitCapabilityIntent`), reconciled ad hoc in `sparkCompanion/intentAdapter.ts:83`, with runtime precedence = line order. See the full 35-row classifier/detector table in Appendix A (below). Concrete divergences where the same message gets different classifications:

- **"Actually, let's talk about my pricing strategy instead."** → `topicChangeClearsThread` TRUE + `detectsExplicitTopicChange` TRUE, but `isExplicitTopicChangeRequest` (activeTopicGate) FALSE → outcome thread cleared while active-topic store keeps the old topic (split-brain).
- **"I need to fold my laundry."** → `shouldClearPendingChoiceForTopicChange` TRUE (has a literal "laundry" heuristic) but thread/anchor unchanged.
- **"I'm overwhelmed by these tasks, help me prioritize"** vs **"I'm frustrated by these tasks, help me prioritize"** → route differently based only on the feeling-word (F9).
- **"do it" / "yes please"** → recognised by one acceptance regex but not the central authority (F7).

> **F18 — 7 topic-change detectors + 9 emotional classifiers, no shared authority · MEDIUM · CONFIRMED** · Topic: `topicChangeDetection.ts:6`, `companionOutcomeThread.ts:123`, `pendingAcceptanceAuthority.ts:375`, `pendingChoice/resolve.ts:349`, `activeTopicGate.ts:149`, `priorityEngine.ts:88`, `companionIntelligenceRouter.ts:483`. Emotional: `stressRouting.ts:79`, `messageClassification.ts:135`, `classifyStrategicInput.ts:104`, `sparkWisdom/emotionalBlocker.ts:51`, `overwhelmNeedClassifier.ts:54`, `frictionFirst/struggleSignals.ts:65`, `primaryTurnClassifier.ts:121`, `sparkDecisionEngine/classifyIntent.ts:46`, `estateCoaching.ts:64`. · Fix (larger, sequence last): one `classifyTurn()` authority → `{topicChange, clarification, sideQuestion, emotionalState, practicalAsk, acceptance}` consumed by all. · Cert: ~20-message corpus asserting identical verdicts across consumers.

## §8 Prompt assembly & dead fields

> **F2 — Prompt pressures unsolicited offers the spine never registers · HIGH · CONFIRMED** · `lib/companionPrompt.ts` repeatedly mandates an action-close: `:104` "End turns with: decision, next step, action…", `:298` "offer ONE action: 'Want to start this now?'", `:403` "ask exactly ONE question OR offer ONE action", `:282` FOUNDER BOARD FLOW (surface top 2-3 flagged items + ask which to start), `:188-195` ECOSYSTEM FEATURE INTELLIGENCE. The model invents an end-of-turn offer the spine never registers as `expectedReply`; next turn "YES MEANS CONTINUE" (`:183`) + `globalConversationContinuityOverride.ts:34` tell the model "yes continues my offer" while `resolveOwnership.ts:244` only binds "yes" to a *spine-registered* owner. So "yes" binds to two different "last questions". This is the mechanism that *manufactures* the untracked awaiting-state behind F1. · Minimal fix: soften mandatory action-close (:104/:298/:403) to "offer an action only when it maps to a registered owner offer"; gate FOUNDER BOARD FLOW + ECOSYSTEM FEATURE INTELLIGENCE behind an explicit ask. · Larger fix: route injects the current spine `expectedReply` as the single authoritative "pending question is X" line; instruct the model "yes" binds only to that. · Risk: Medium (tone/behaviour). · Cert: model makes no offer unless an owner offer exists; bare "yes" with no spine `expectedReply` → no navigation/create; FOUNDER BOARD FLOW not emitted unsolicited.

> **F20 — Dead prompt fields, dormant engines, legacy compat · MED/LOW · CONFIRMED** ·
> - **10 dead body fields** consumed by `app/api/companion-chat/route.ts` (`userHealthHint`/`decisionHint`/`recoveryHint`/`environmentHint`/`futureHint`/`momentumHint`/`businessOSHint`/`chiefHint` :237-244; `intelligenceContext`/`hiddenIntentHint` :246-247) — **no caller populates any** (grep: 0 setters); superseded by the single `ecosystemGuidance` block (CPC:20892), and `route.ts:285-287` skips the whole else-branch when `ecosystemGuidance` is present. `wisdomLoopBlock = hiddenIntentBlock` (:292) is a leftover rename alias. Fix: delete the reads/blocks; define a typed `CompanionChatRequest`. Risk: Very low (only ever produced `""`).
> - **Dormant per-domain engines** (`recovery/environment/future-shari/momentum/chief-of-staff/user-health/decision-intelligence`) — not imported by CPC; only wiring was the 10 dead fields. Superseded by `ecosystem-intelligence/ecosystemEngine.ts`.
> - **Legacy ownership compat layer** (`adaptLegacyOwnership.ts:100`) reads 8 legacy stores/turn; `active_topic` kept at `priority:0` only to be excluded (dead ladder slot). `legacyWorkspaceMap.ts`: 12 `move` + 7 `remove` dispositions still present (migration-freeze surfaces).
> - **Duplicated prompt instructions:** "yes continues the active task" in 3 places; "never open workspaces from chat" across `companionPrompt.ts:36-42/52-56/253-258/359-365/391-400`.

## §9 Dormant / legacy systems
Covered by **F20** (dead fields, per-domain engines, compat adapter, workspace-map) and **F15** (dead chamber-lock helper) and **F10** (dead context-preserving fallback branches behind `BRIDGE_RESPONDER_DISABLED`). Also: `boardReasoningEngine.deliberate()` is dead at runtime (no caller); Talk-It-Out is a second isolated system-prompt path (`route.ts:151-204`) — intentional but a duplicate LLM-call path to keep in view.

## §10 Navigation behaviour

**Are "take me there / let's do it here / work through it here / help me with this / continue here" handled consistently? — NO (CONFIRMED asymmetry).** Explicit "go/take me there" is first-classed and *overrides* awaiting-answer and Chamber locks (`isDirectNavigationPriorityTurn`, `directNavigationPriority.ts:23`; `AFFIRMATION_RE`, `frictionlessActionLayer.ts:548`). But "let's do it here / work through it here / continue here" have **no dedicated stay-here handler** in the routing hub — whether they suppress an otherwise-high-confidence create/nav open depends on `isSimpleCreateRequest`/scoring not matching first. — **F13**

**Does the platform auto-open Create/Projects/Chamber/Board/another room or convert a conversation to a task without explicit request/confirm? — CONFIRMED it can:** high-confidence Brain routes open **without a permission ask** (`immediateNavigate = confidence === "high"`, `routeEstateIntelligence.ts:174-177`; "No permission ask on high confidence", :328); immediate create/momentum/research execute directly in `presentFrictionlessLocalReply` (CPC:14140-14184) with no confirmation gate — only `blockImmediateForAnswerFirst` (CPC:14040) and the chamber lock can stop them. — **F13** (compounds with **F4**)

> **F13 — "Stay here" has no first-class guard; explicit nav overrides locks; high-confidence opens without confirmation · MED-HIGH · CONFIRMED / part HYP** · Minimal fix: add an early high-priority "stay in place / do it here" guard in `resolveFrictionlessActionImpl` (before `simpleCreate` :4160 and the immediate-experience block :4233) that suppresses all `immediate*Open`/navigate for the turn; raise the confidence floor for no-confirm opens. · Risk: Medium (don't block legitimate explicit navigation). · Cert: "let's just work through it here" / "help me with this right here" / "continue here" → conversation, zero `immediate*Open`; "take me to Momentum" → navigates.

---

# REPORT 2 — USER EXPERIENCE BEHAVIOR AUDIT

For each scenario: what the user experiences · why · systems · severity · isolated or platform-wide.

### A. Customer-persona interruption — **CONFIRMED · Critical · platform-wide pattern**
- **Experience:** User asks what a customer persona is; Spark explains and asks "want to build one?"; user says "yes"; Spark replies with a warm-lead/pipeline suggestion instead of starting the persona. User must say "let's work through it here in chat."
- **Why:** The persona offer is a *free-form* LLM question, so no pending/owner is armed (**F1**). The "yes" arrives unowned; the spine returns `owner:none`; the turn falls through to the proactive business stack, which injects a warm-relationship/opportunity line (**F3**), and the prompt actively pressures an action-close (**F2**). (The *exact* "List 3 warm leads…" string is a founder/GHL surface, not member chat — the member-chat analog is the business-os warm-relationship line.)
- **Systems:** `conversationConfirmationGate` + spine ownership (F1) · `phase4BusinessOperatingPartner`/business-os injectors (F3) · `companionPrompt` action-close (F2).
- **Isolated or platform-wide:** Platform-wide — *any* "want me to…/should we…/want to build/draft/make one?" free-form offer has the same hole.

### B. Side-question recovery — **CONFIRMED · High · platform-wide**
- **Experience:** User is creating something, asks a side question, gets an answer, says "continue" / "go back" — and is **not** reliably returned to the exact prior step; "continue" in particular matches no detector and falls to relationship-chat.
- **Why:** No first-class side-question park/restore in chat (**F17**); bare "continue" is unhandled (**F7** note); the aside can even clear the pending offer if it's read as a topic change (**F11**).
- **Systems:** `createTurnRelationship` side-branch · `topicHistory`/`conversationHandoffRecovery` · acceptance regexes · `topicChangeInvalidatesOffer`.
- **Isolated or platform-wide:** Platform-wide.

### C. Explicit in-chat preference ("let's work through it here in chat") — **CONFIRMED · Med-High · platform-wide**
- **Experience:** User explicitly asks to stay in chat, but a create/nav-scoring token in the sentence can still trigger a room open or Create.
- **Why:** No first-class "stay here" guard; explicit-stay is not symmetric with explicit-go (**F13**); navigation ignores ownership (**F4**).
- **Systems:** `frictionlessActionLayer` precedence · `directNavigationPriority` · immediate-open execution.
- **Isolated or platform-wide:** Platform-wide.

### D. Topic change — **CONFIRMED · High · platform-wide**
- **Experience:** User clearly changes subject, but the old pending suggestion/action can either override the new topic (survives) or a clarification can wrongly nuke a valid offer — depending on lexical overlap.
- **Why:** Seven disagreeing topic-change detectors (**F18**); offer-invalidation uses word-overlap, not a topic/clarification classifier (**F11**); expiry is turn-count not topic (**F14**); stale threads persist in localStorage (**F17**).
- **Isolated or platform-wide:** Platform-wide (root: F18).

### E. Short-answer binding — **CONFIRMED · Critical/High · platform-wide**
- **Experience:** Spark asks a direct question; user answers "yes / one / that one / go / okay / let's do it"; only some bind; "that one"/"the first one"/"go"/"continue"/"next" don't register as acceptance, and even a matched "yes" can be outranked because binding isn't enforced before other systems act.
- **Why:** No binding for free-form questions (**F1**); narrow, fragmented acceptance vocabulary with no choice/ordinal support (**F7**); spine resolves after fast-path handlers and isn't consulted by navigation/recommendation (**F4, F3, F6**).
- **Isolated or platform-wide:** Platform-wide.

### F. Unrelated action injection — **CONFIRMED · High · platform-wide**
- **Paths found that can interrupt an active conversation:** the phase 2–11 proactive stack (F3), the business-os warm-relationship injector (F3), the rhythm/reminder 30s fire-loop with no turn at all (F12), high-confidence navigation opens without confirmation (F13/F4), and the arrival greeting. None consult ownership.
- **Isolated or platform-wide:** Platform-wide — the shared defect is "injectors don't check ownership."

### G. Generic answer vs Spark Estate behaviour — **CONFIRMED · High · platform-wide**
- **Experience:** On any model failure/empty response mid-thread, the user gets "I'm here — tell me what you need and we'll take it from there," abandoning the thread and forcing a restate — even though the caller supplied full memory.
- **Why:** The context-preserving fallback branches are dead code behind `BRIDGE_RESPONDER_DISABLED=true`; the live guard reads a global topic store, ignoring the passed transcript (**F10**). Corroborated by the project's own gap-map docs.
- **Systems:** `sparkConversation/coachingFallback` · `bridgeResponderGuard` · `activeTopicGate` · API-route callers passing no memory.
- **Isolated or platform-wide:** Platform-wide on the failure path.

> **F10 — Generic recovery fallback drops the active thread · HIGH · CONFIRMED** · `coachingFallback.ts:288` (context branch) dead behind flag; `:340` also dead (after an always-returning block :334); live path returns `GENERIC_RECOVERY_BRIDGE` (:77-78); guard `shouldBlockGenericFallback()`/`topicPreservingFallbackLine()` called with no args (:322-329), reading a module-global not the in-flight text. Callers passing no memory: `route.ts:429/641`, `SparkAlphaPage.tsx:367/395`, `routeCompanionFailure.ts:50`. · Minimal fix: have those guards accept and prefer the passed `input` (priorUserText/lastAssistantText) before the global store; ensure API callers pass `memory`. · Larger fix: retire `BRIDGE_RESPONDER_DISABLED`; one topic-aware continuation always receiving the live transcript. · Risk: Low (verify the bug that prompted the kill flag). · Cert: forced API failure mid-thread → reply references prior topic; each caller passes memory.

### H. Old conversation resurfacing — **CONFIRMED · Medium · platform-wide**
- **Experience:** An abandoned topic or stale `pendingAction` re-offers itself later — including at home ("Continue where I left off") and on an ambiguous later "yes" across sessions.
- **Why:** `companionOutcomeThread` localStorage clears only on a narrow regex; `companionLedContinue` ranks stored conversation at priority 1 with no abandonment check (**F17**); `pendingAcceptanceAuthority` can resume a stale offer within its turn window (**F14**).
- **Isolated or platform-wide:** Platform-wide.

### I. Canned emotional routing — **CONFIRMED · High · platform-wide**
- **Experience:** "I'm overwhelmed by all these tasks, help me prioritize" returns a relief options card (Breathing / Calm Audio / Clear My Mind / Safe For Today / Talk It Through) and the practical "help me prioritize" is dropped; prioritization is only reachable on a *second* turn.
- **Why:** `shouldOfferStressRelief` fires on the feeling-word via `STRESS_ROUTING_RE` and never consults `classifyOverwhelmNeed`/`isPrioritizingConversation`; the stress offer then *nulls* the workspace and support-tool offers (CPC:19572-19608), and the chat hint says "do NOT name a tool" (**F9**). Asymmetry: "frustrated" routes to practical help, "overwhelmed" doesn't.
- **Scope note (CONFIRMED):** the full-screen Breathe/Peaceful Places launch is correctly guarded (requires explicit "breathe" language); `reliefIntelligence.ts` is invisible telemetry, not a router. The leak is specifically the **stress-relief options menu**, not Peaceful Places.
- **Isolated or platform-wide:** Platform-wide for any distress-word + practical-ask combination.

> **F9 — "Overwhelmed" suppresses practical task help · HIGH · CONFIRMED** · `stressRouting.ts:50/79/192`; nulling at CPC:19572-19608; hint at CPC:20595 / `stressRouting.ts:324-330`; unused discriminator `overwhelmNeedClassifier.ts:54`. · Minimal fix: in `shouldOfferStressRelief`, when the message also contains an explicit practical ask (route via `classifyOverwhelmNeed`/`isPrioritizingConversation`), return `false` (or map to Today's Reality) instead of the generic menu. · Larger fix: single emotional-vs-practical arbiter classifying "distress + practical ask" → task triage with a brief empathy preface. · Risk: Low (keep relief for pure-distress "I'm overwhelmed"). · Cert: "overwhelmed by all these tasks, help me prioritize" → prioritization; bare "I'm overwhelmed" → relief still offered; "frustrated" vs "overwhelmed" + practical ask → parity.

### J. Wrong destination / room — **CONFIRMED (mechanisms) / HYPOTHESIS (frequency) · Medium · platform-wide**
- **Experience:** Natural language opens the wrong room, or a request for a specific Chamber member returns a generic ("blue text") answer instead of routing into that member, or resumes the wrong experience.
- **Why:** Weak substring trigger scoring with a low confidence floor (**F21**); competing routers where a "helper" can win over the Brain (**F5**); explicit-nav override can exit an active room (**F13/F15**); requested member not active → falls to generic chat (**F21**).
- **Isolated or platform-wide:** Platform-wide (root: F5 + F21).

---

# SYNTHESIS

## 1. Consolidated root-cause map

| Root cause | Findings | One-line |
|---|---|---|
| **R-A · Ownership is not a shared gate** (spine runs late, only sees structured stores, and navigation/recommendation/prompt don't consult it) | F1, F4, F6, F19, F3, F12, F2 | The central defect. Every actor decides for itself. |
| **R-B · No first-class "pending assistant question"** (free-form offers register nothing) | F1, F19, F2, F8 | The Scenario-A/E hole. |
| **R-C · Short-answer binding fragmented** (≥4 acceptance regexes, narrow vocabulary, no choice/ordinal) | F7, F8 | "that one/go/continue/do it" fall through. |
| **R-D · Navigation authority decoupled + competing routers** | F4, F5, F16, F13, F15, F21 | Wrong-room, lock overrides, no "stay here". |
| **R-E · Recommendation injection ungoverned** (6 timing gates, none = ownership) | F3, F12, F14 | Unsolicited/mistimed offers. |
| **R-F · No single turn classifier** (5 intent engines, 7 topic detectors, 9 emotional) | F18, F9, F11, F14 | Same message → different verdicts. |
| **R-G · Emotional word pre-empts practical intent** | F9 | "Overwhelmed" → relief menu. |
| **R-H · Failure fallback drops context** (dead branches behind a kill flag) | F10 | "Tell me what you need." |
| **R-I · Stale state survives** (turn-count/lexical expiry, localStorage) | F14, F17 | Old threads resurface. |
| **R-J · Prompt/legacy debt** | F2, F20, F15 | Prompt fights the spine; dead fields/engines. |

## 2. Recommended fix order (by user harm × breadth × safety × dependency)

1. **F9** — "Overwhelmed" relief-menu hijack. *Worst everyday harm, smallest safe guard.*
2. **F11** — Clarification kills a pending offer. *One-line guard.*
3. **F1 + F19 + F2** *(one fix)* — First-class "pending assistant question" on the spine + soften the prompt's action-close. *Closes Scenario A/E; unblocks C/D/H.*
4. **F10** — Context-aware failure fallback. *Stops the "tell me what you need" thread-drop.*
5. **F7** — Unify + widen acceptance vocabulary (choice/ordinal/continuation). *Depends on #3's `expectedReply`.*
6. **F4 + F13** — Navigation consults ownership + a first-class "stay here" guard + confidence floor for no-confirm opens.
7. **F6** — Open the ownership gate at the top of `handleSend`.
8. **F3 + F12** — Enroll the proactive stack and rhythm loop in the ownership gate; move `record…Shown()` to emission.
9. **F14 + F17** — Topic-aware expiry + abandonment check + a real conversation stack.
10. **F5 + F16 + F21** — Enforce the routing contract (one `resolvePlace`, scored arbiter, higher confidence floor).
11. **F8 + F18** *(architectural)* — Collapse awaiting-state trackers into spine `expectedReply`; one `classifyTurn()` authority. *Sequence last.*
12. **F20 + F15** — Cleanup: delete dead prompt fields/engines, wire-or-delete the dead chamber-lock helper, execute `remove` workspace dispositions.

## 3. Fix boundaries

| Finding(s) | Boundary |
|---|---|
| F9, F11 | **Safe isolated fix** (single guard, local blast radius) |
| F10 | **Safe isolated fix** (re-wire a guard + pass memory) — verify the historical kill-flag bug first |
| F7 | **Shared behavior change** (acceptance vocabulary touches many call sites) |
| F1/F19/F2 | **Shared behavior change** (new spine field + prompt reconciliation) |
| F4/F13, F3/F12, F6 | **Shared behavior change** (ownership gate consumed by nav + recommendation) |
| F14/F17 | **Shared behavior change** |
| F5/F16/F21 | **Architecture change** (collapse routers behind one arbiter) |
| F8/F18 | **Architecture change** (single awaiting-state + single classifier) |
| F20 (dead fields/engines), F15 (dead helper), `active_topic` slot, `deliberate()` | **Cleanup only** |
| `legacyWorkspaceMap` move/remove entries, `BRIDGE_RESPONDER_DISABLED` retirement | **Do not touch until later** (migration-freeze / needs the historical-bug check) |

## 4. Duplication assessment (don't fix the same defect twice)

- **F1 = F19** — same defect (free-form offer not held/bound), two vantage points. **One fix.**
- **F2 ⊂ F1's cause** — the prompt's action-close is the *mechanism* that manufactures the untracked awaiting-state in F1. **Fix together.**
- **F7 ⊃ the `ACCEPT_RE` half of §3** and the four-regex fragmentation — **one unification**, not two.
- **F8 and F18** are the *state* and *classification* faces of "no single authority" — related but distinct deliverables (awaiting-state vs turn-classification); each done once.
- **F4, F3, F12** are the same principle ("subsystem acts without checking ownership") applied to navigation / recommendation / rhythms — **one ownership gate**, three call-site enrolments.
- **F11, F14, F17** all stem from **F18** (fragmented topic detection) — fix the guards now, but the durable fix is the single classifier.
- **F5, F16, F21** are one router-consolidation deliverable.
- **F15, `deliberate()`, F20 dead fields/engines** — pure cleanup, batch once.

**Net: ~21 findings collapse to ~9 distinct fixes.**

## 5. Certification plan — reusable test matrix

| # | Dimension | Representative assertion |
|---|---|---|
| C1 | Active conversation ownership | Pending confirmation + a create/nav-scoring message → no auto-open; owner retained |
| C2 | Short answers | Offer with 2 options → "yes"/"okay"/"the first one"/"that one"/"go"/"continue"/"do it"/"yes please" each bind to the offer |
| C3 | Free-form question binding | Explain X → "want to build one?" → "yes" starts building X, no proactive pivot |
| C4 | Side questions | Mid-Create → side question → "continue"/"go back" → resumes exact prior step |
| C5 | Topic changes | Clear new subject → old pending does not override; clarification ("what does that mean?") preserves the offer |
| C6 | Stale suggestions | Offer → aside reusing one word → later "yes" → offer does NOT fire; abandoned topic not re-offered at home |
| C7 | Explicit in-chat continuation | "let's work through it here" → conversation only, zero `immediate*Open`, no Create/Project/task |
| C8 | Navigation requests | "take me to Momentum" navigates; "help me with this here" does not |
| C9 | Creation flow | Explicit create request opens Create; casual "yes" never silently opens Create (Const. 130/131) |
| C10 | Project flow | No auto-project-conversion without explicit confirm |
| C11 | Chamber flow | Named member request routes into that member (or offers a choice), never generic "blue text"; active member lock not silently overridden |
| C12 | Board flow | FOUNDER BOARD FLOW / board recommendations never emitted unsolicited in member chat |
| C13 | Reminders & rhythms | Deliverable due mid-stream → deferred until the turn settles; quiet-hours respected |
| C14 | Generic questions | Model failure mid-thread → context-preserving continuation, not "tell me what you need" |
| C15 | Emotional wording + practical intent | "overwhelmed … help me prioritize" → prioritization; bare "I'm overwhelmed" → relief; "frustrated" vs "overwhelmed" parity |
| C16 | Injection governance (property test) | For every proactive/rhythm emission, an ownership check passed and `record…Shown()` fired only on actual emission |
| C17 | Awaiting-state invariant (property test) | Every `setAwaitingUserConfirmation(state)` ⇒ resolved spine owner `expectedReply` presence == `state.active` |

Existing `ownershipPhase3.test.ts` + `ownershipPhase3Slice2.test.ts` (18 tests, currently green) are the seed; extend with C1–C17.

## 6. Executive summary (plain English, for Shari)

**What's working.** The Phase 3 ownership spine you just certified is genuinely well-built — it's the right foundation, it holds structured offers (like collection saves) correctly, and its recovery guard is sound. Explicit navigation ("take me to X") works. The dangerous full-screen relaxation launch is correctly locked behind the word "breathe." The build is green and the 18 ownership tests pass.

**What's not working.** The new spine is like a great traffic controller that everyone else is allowed to ignore. Navigation, background suggestions, the reminder chime, the acceptance logic, and the AI's own instructions each still decide things on their own without asking the controller. And the single most common moment — Spark asks a plain-English question ("want to build one?") and you answer "yes" — isn't registered as a question at all, so your "yes" lands on nothing and whatever background system speaks loudest wins.

**Why it sometimes feels like the platform stops listening.** Three reasons, all confirmed in the code: (1) your short answers ("yes," "that one," "go," "continue") often aren't recognized as answers to the last question; (2) background systems (business suggestions, reminders, the "overwhelmed → relaxation menu" reflex) can speak over the thread you're in; and (3) when the AI hiccups, the safety net says "tell me what you need" and throws away everything you'd just said. None of these are random — they're the same missing rule ("check who owns this turn before acting") showing up in different places.

**What to fix first, and what you'll notice:**
1. **"Overwhelmed" stops hijacking task help** → asking for help while stressed gives you a plan, not a breathing menu.
2. **Clarifying questions stop deleting your offers** → asking "what do you mean?" no longer loses the thing you were about to say yes to.
3. **Register the assistant's question so your "yes" sticks** → "yes" to "want to build one?" actually starts building it — no sales-pipeline detour. *(This is the Scenario A fix and the biggest single win.)*
4. **Context-preserving fallback** → a hiccup resumes your topic instead of "tell me what you need."
5. **Wider answer vocabulary** → "that one," "the first one," "go," "continue," "do it" all count.

After those five, the platform will feel like it's holding one continuous conversation with you instead of five systems talking past each other. The deeper cleanups (one classifier, one awaiting-state, one router) come last — they make it durable, but the five above are what you'll *feel*.

---

## Appendix A — Full classifier/detector inventory
(35 rows; from the classifiers investigation — every per-turn detector, its file:function, what it keys on, and what it overlaps with. Retained in the investigation record; the operative duplications are summarised in F7 and F18.)

## Appendix B — Router/navigation entry points
Primary hub `frictionlessActionLayer.ts`; Estate Brain (`routeEstateIntelligence.ts`, `routeIntentFirstNavigation.ts`, `estateCoaching.ts`, `discoveryMode.ts`, `search.ts`); adapters/helpers (`estateIntelligenceRuntime`, `estateRouter.ts`, `estateCommandRouter.ts`, `estateCapabilityRegistry`); navigation helpers (`resolveEstateNavigationIntent.ts`, `resolveEstateNavigation.ts`, `intentToExperience.ts`, `estateDestinationResolver.ts`, `estateIntentBridge.ts`, `estateDirectRoomResolve.ts`, `estateRoomAliasRegistry.ts`, `resolveEstateAction.ts`, `directNavigationPriority.ts`, `impliedNeed.ts`, `createExperienceRouting.ts`); two ownership resolvers (`resolveConversationOwnership` + `decideConversationTurnAuthority`); home/continue (`companionLedContinue.ts`, `arrivalIntelligence/`).
