# Spark Estate — Beta Experience Readiness Audit

**Date:** 2026-07-31
**Branch:** `audit/beta-experience-readiness`
**Governing standard:** The Spark Estate Companion Manifesto + binding constitutions 114, 117, 128, 131, 132
**Acceptance question:** *Would a member feel that Shari was sitting beside them, helping them make meaningful progress without adding pressure, confusion, or unnecessary work?*

---

## Verdict

**Not beta-ready yet — held by truthfulness / completion-integrity blockers, not by feel.**

The *experience design* is, in places, genuinely excellent (voice architecture, return-after-absence intent, momentum recovery language). What holds beta back is **foundational, not cosmetic**: most beta-critical member work still has no durable home (durable persistence exists and is proven for one domain, but the migration is incomplete), and the system's own safety net against false "I saved / I did that" claims has been disconnected from the live path — with the guardrail tests that were supposed to catch this now silently failing.

> **Correction (2026-07-31, post-audit):** An earlier version of Blocker 1 stated there was "no database and no server-side persistence." That was inaccurate — it reflected a grep scoped only to `app/api/**`, which missed the browser-side Supabase persistence layer. The finding below is corrected: Supabase auth + durable persistence already exist and are used by the Creation domain; the real blocker is **incomplete migration and inconsistent save verification**, not the absence of a backend. The blocker status is unchanged.

Per your Category 5 rule ("any serious truthfulness or false-completion issue is a potential beta blocker regardless of score"), the two blockers below govern the verdict over the weighted total.

| # | Category | Weight | Score /100 | Weighted |
|---|----------|--------|-----------|----------|
| 1 | Companion Voice, Judgment & Relationship | 25% | 78 | 19.5 |
| 2 | Cognitive Load, Simplicity & Decision Burden | 20% | 62 | 12.4 |
| 3 | Momentum, Continuity & Return | 20% | 55 | 11.0 |
| 4 | Interface, Navigation & Flow | 15% | 58 | 8.7 |
| 5 | Truthfulness, Capability & Completion Integrity | 10% | 48 🚫 | 4.8 |
| 6 | Business Value & Implementation | 10% | 65 | 6.5 |
| | **Weighted total** | | | **≈ 63 / 100** |

🚫 = contains beta blocker(s). **Total is advisory; blockers gate release.**

---

## Method & evidence levels

This pass audited **code, tests, registries, and product constitutions** — the running architecture, not a full clicked-through session. Every finding is tagged:

- **[VERIFIED]** — confirmed by reading source and/or running tests during this audit.
- **[ARCHITECTURE]** — established from the codebase structure and canon; high confidence, not runtime-observed.
- **[NEEDS RUNTIME]** — requires a live dev-server walkthrough to certify (recommended Phase 2).

Grounding covered: the member-facing experience inventory (~80 sections in one shell at `/companion`), the voice-source map (`lib/shariVoiceBible/`, `lib/companionPrompt.ts`), and the truthfulness/completion-guard map (`lib/trustKernel/`, `lib/trustContract/`, Create turn logic).

---

## 🚫 Beta blockers (must clear before beta)

### BLOCKER 1 — Most beta-critical member work is localStorage-only; migration to the existing durable layer is incomplete and save verification is inconsistent
**Category 3 + 5 · Constitution 117 ("Never lose user work") · [VERIFIED]**

- **Durable server persistence already exists.** Supabase is fully configured (`@supabase/supabase-js` in `package.json:29`; `lib/supabase/companionClient.ts`), authentication is real (Supabase Auth, `components/companion/CompanionAuthProvider.tsx`), and there is a **stable server-authoritative member id** (Auth `user.id` UUID).
- **One domain is already durable and verified.** Creation workspaces persist through a proper write→read-back→verify→receipt pipeline to the Supabase table `companion_creation_workspaces` (`lib/creationDurable/repository.ts:127-235`); billing entitlements are similarly durable. *(The earlier "no database" claim was a grep artifact — member persistence runs through the browser Supabase client, not `app/api/**`.)*
- **But most other beta-critical member work is still browser `localStorage`.** ~25 Tier-A stores remain local: `savedWorkStore.ts`, `clearMyMindSessionStore.ts` + brain dumps, `growthJournalStore.ts`, `evidenceBankStore.ts`, `growthPortfolioStore.ts`, `confidenceVaultStore.ts`, `companionProjectsStore.ts`, `lib/planMyDay/*`, `profile/businessEstateProfile.ts`, `decisionCompassSessionStore.ts`, `strategyChamber/*`, `boardroom/store.ts`, and more. These are device-local, un-synced, and lost on cache clear or device switch.
- **Save verification is inconsistent.** Only 3 of ~25 Tier-A stores signal write failure to the caller; the rest **swallow silently** (`savedWorkStore.ts:57` → `catch { /* noop */ }`) and return success-looking objects. Four stores have **no try/catch and throw uncaught on quota** (`brainDumpCustomCategories.ts`, `projectConversations.ts`, `tomorrowFocus.ts`, `boardroom/store.ts`), which can break the render.

**Why it's a blocker:** The manifesto promises *"Spark Estate remembers so members don't have to"* and *"Nothing valuable should disappear."* Constitution 117 opens with *"Never lose user work."* Today, most of a member's business work is device-local, un-backed-up, erased by a cache clear or a browser switch — and can vanish silently mid-session while the member is told it was saved. The backend exists; the migration and the honest save-verification simply haven't reached these domains yet. This remains the single highest-risk gap for a product asking people to build a business inside it.

**Remediation:** Extend the existing verified durable pattern (`lib/creationDurable/`) to the remaining Tier-A domains, one contained vertical slice at a time, with honest success/failure receipts. Full plan: `docs/BETA_BLOCKER_1_DURABLE_PERSISTENCE_PLAN.md`. Beta requires an internet connection for authoritative durable saves, with recoverable local work and calm retry when durable saving is unavailable.

---

### BLOCKER 2 — The completion-integrity guard is disconnected from the live path; its tests are silently failing
**Category 5 · Constitution 132 Rule 5 (Interface Truthfulness) · [VERIFIED]**

- The Trust Kernel "sole egress" (`lib/trustKernel/soleEgress.ts` → `authorizeCreationEgress`) and the promise scrubber (`lib/trustContract/scrub.ts` → `scrubUnverifiedPromises`) exist and are well-designed: they gate any "I saved / opened / created" claim on a **verified receipt**.
- **They are not wired into the live client.** Grep of `app/companion/CompanionPageClient.tsx` (~22k lines, the chat/Create turn orchestrator) for `authorizeCreationEgress | openUniversalCreationFromText | scrubUnverifiedPromises | honestCreationFailureMessage | trustKernel` returns **0 matches**. In production code these guards are referenced only by the narrow `lib/currentFocus/submitCurrentFocusResponse.ts` path.
- **The guardrail tests meant to protect this are red.** `npx vitest run lib/trustKernel/t1SoleEgress.test.ts` → **3 failed / 8 passed**. T1-07 and T1-10 read the client file and assert it contains `authorizeCreationEgress` / `function openUniversalCreationFromText`; both now resolve to index −1. The Sprint T1 hardening report the suite expects is also gone.

**Why it's a blocker:** General assistant chat claims ("I've added that," "Done," "Saved") no longer pass through the promise-authorization layer that was built to prevent false completion. The safety net rotted without anyone noticing because its own tests were failing unaddressed.

**Important nuance (fair to the team):** The *specific* "false Create workspace" claim **is** correctly gated — the recent `fix(create)` work added a separate, working guard in the client (`resolveLegacyCreateWorkspaceGuard` → `createWillOpen`, `CreationTurnEnvelope`), with passing tests (`createDestination.test.ts`, `blockedCreateNormalization.test.ts`, `creationTurnEnvelope.test.ts`). Blocker 2 is about the **general** claim path, not Create-open specifically.

**Remediation:** Re-wire `scrubUnverifiedPromises` / `authorizeMemberClaim` into the assistant-message render path in `CompanionPageClient.tsx` (or the `companion-chat` route before render), then restore the T1 guardrail suite to green. Treat a red guardrail test as a release-blocking signal, not noise.

---

### BLOCKER-ADJACENT — Ungated "Saved to:" announcement
**Category 5 · [VERIFIED] · promote to blocker if Create drafts are a primary beta flow**

`lib/createDraftPersistence.ts:16` `buildDraftSavedAnnouncement()` unconditionally emits **"Saved to: {location}"**, while `persistGeneratedDraft()` returns `{item, record}` with no success signal, over a store (`savedWorkStore.writeAll`) that swallows write errors. So a Create draft can be announced as saved while the write silently failed. This is the exact false-completion pattern the Trust Kernel exists to prevent — bypassed because this path doesn't consult it. Same root cause as Blockers 1 + 2.

---

## Category-by-category

### 1. Companion Voice, Judgment & Relationship — 78/100 (25%)
**The strongest area.** [ARCHITECTURE], voice quality [NEEDS RUNTIME]

**Strengths**
- Dedicated **Shari Voice Bible** (`lib/shariVoiceBible/`) with real guardrails: `rules.ts` bans software language via regex (`dashboard`, `workflow`, `optimize`, `you should`, `you've got this`) and encodes principles ("Never sound like software," "Silence is hospitality," "Fewer words as trust grows").
- Tone adapts to channel: `VOICE_TONE_MODIFIER` ("They spoke aloud. Shorter sentences.") vs `TEXT_TONE_MODIFIER` in `lib/companionPrompt.ts`.
- Explicit **anti-guilt welcome rule** in `lib/sparkCompanion/getSparkCompanionPromptBlock.ts`: *"never streaks, day-counts, guilt, or abandoned-project language."*
- Runtime enforcement: `app/api/companion-chat/route.ts` runs `enforceRelationshipResponse`, `applyShariVoiceLayer`, `enforceHumanConversation` on model output.
- Warm, specific fallbacks (`coachingFallback.ts`: "Something got tangled for a second, but I'm still here.") and gentle return greetings (`journalGazebo/returnGreetings.ts`).

**Concerns**
- Voice quality ultimately depends on the runtime LLM + enforcement firing correctly on every turn — **not certifiable without a live session** across emotional states.
- Dual naming in source ("Shari" the persona vs "Spark" the brand) risks member-facing inconsistency; confirm which name members actually see.

**Recommendation:** Runtime voice pass across overwhelmed / stuck / returning-after-absence / celebratory states. Architecture is beta-grade; certification is pending observation.

---

### 2. Cognitive Load, Simplicity & Decision Burden — 62/100 (20%)
[ARCHITECTURE] + [NEEDS RUNTIME]

**Strengths**
- Constitution 128 is a real, binding gate (15 rules + 10-question Mandatory Simplicity Audit + ADHD-experience certification requirement).
- Voice-layer bias toward "one helpful suggestion over many options" (114) and "recommend before asking" (128 Rule 9).

**Concerns**
- **Surface-area sprawl is itself cognitive load.** ~80 `AppSection` states, 10 experiences / 30 legacy rooms / 66 canonical places. Breadth this large is hard to reconcile with 128 Rule 2 ("every screen answers one question") and the Ten-Second Rule.
- One ~28,500-line client shell suggests heavy accretion; hard to guarantee per-screen simplicity certification at that scale.
- No evidence the mandatory per-feature Simplicity Audit is enforced in CI/release; it reads as aspirational.

**Recommendation:** Pick the top ~8 member entry surfaces and run the 128 audit for real, per screen. Verify the room count members can actually perceive is far smaller than the registry count.

---

### 3. Momentum, Continuity & Return — 55/100 (20%)
[ARCHITECTURE], undermined by Blocker 1

**Strengths**
- Deliberate momentum design: `lib/companionLedContinue.ts` ("Continue Where I Left Off" resumes last meaningful activity), `lib/arrivalIntelligence/`, `returnState.ts` (RETURN_AFTER_ABSENCE_DAYS=3, LONG_ABSENCE_DAYS=14), celebration engine with specific wins.
- 132 Rule 8 momentum-recovery intent is present in design ("You were writing your Flyer. Ready to continue?" over "Welcome Home. Start over.").

**Concerns**
- **Continuity sits on unreliable storage (Blocker 1).** The best "welcome back, here's where you were" is worthless if the underlying `localStorage` was cleared or silently failed. Continuity is well-designed at the UX layer and fragile at the data layer.
- Return experience [NEEDS RUNTIME] confirmation that resume actually reconstructs state, not just greets.

**Recommendation:** Resolve Blocker 1 first — continuity cannot be certified above the persistence it depends on.

---

### 4. Interface, Navigation & Flow — 58/100 (15%)
[VERIFIED] structural findings + [NEEDS RUNTIME] flow

**Strengths**
- Navigation Golden Rule + intent-first routing (`routeIntentFirstNavigation.ts`, `resolveEstateNavigation.ts`) — members describe goals, Spark routes.
- Some honest not-ready guards already exist: Create "still being prepared" placeholder, and multiple explicit "Coming soon" labels (Cartographer's Atlas, Stables, Visual Focus, PDF export, digital sharing).

**Concerns**
- **Three registries disagree** (10 experiences / 30 legacy rooms `@deprecated` / 66 canonical places) — a documented mid-flight migration. Divergent sources of truth risk inconsistent labels/counts, which 132 Rules 5–6 explicitly forbid ("the interface must never contradict itself").
- **No systematic build-status navigation gate found** (0 matches for status-based `isNavigable`/`!== "live"` filtering in `lib/estate`). The legacy registry alone marks 2 partial + 2 planned + 1 future rooms against 11 live. Guards are per-surface (Create, coming-soon labels), not global — so a not-built destination reachable via chat intent could produce a dead end (also a Category 5 false-destination risk).

**Recommendation:** Converge on one runtime registry as source of truth; add a global "is this destination actually shippable" gate so intent routing can never land a member somewhere unbuilt without an honest placeholder.

---

### 5. Truthfulness, Capability & Completion Integrity — 48/100 (10%) 🚫
[VERIFIED] — see Blockers 1, 2, and Blocker-adjacent

**Strengths**
- The design intent is excellent: Trust Kernel (`authorizeClaim.ts`, `soleEgress.ts`, `creationEvidence.ts` — "Facts only from completed runtime state — never intent or assumption") and Trust Contract (`promises.ts`, `scrub.ts`) are sophisticated and correct.
- `saveExportTrust.ts` models honest Google-export receipts (`isGoogleCreateSuccess` requires both `id` and `url`; explicit failure receipts).
- Recent Create truthfulness work is real and tested (Create-open false-workspace claim is gated).

**Concerns** — the guarantees are largely **unwired** (Blocker 2), member work can silently fail to persist (Blocker 1), and at least one success announcement is ungated (Blocker-adjacent). The gap between the *designed* integrity layer and the *wired* one is the core beta risk.

---

### 6. Business Value & Implementation — 65/100 (10%)
[ARCHITECTURE]

**Strengths**
- The product genuinely drives toward tangible outputs: Create produces artifacts saved to My Work, Google Docs export, projects/plans/client avatars/strategy. Implementation Principle is honored in flow design.

**Concerns**
- Value is only as durable as storage — outputs that can silently vanish (Blocker 1) undercut real business value.
- Several business surfaces are still "coming soon" (Board of Directors review of visual focus, PDF export, digital sharing) — fine to defer, but confirm none present as done.

**Recommendation:** Once persistence is trustworthy, this category is close to beta-grade.

---

## Prioritized remediation

| Priority | Item | Category | Effort |
|----------|------|----------|--------|
| P0 | Durable member-work persistence (server sync) **or** explicit browser-only contract + honest quota-failure UX | 3, 5 | High |
| P0 | Re-wire `scrubUnverifiedPromises` / `authorizeCreationEgress` into the live chat/Create render path; restore T1 guardrail suite to green | 5 | Medium |
| P1 | Gate `buildDraftSavedAnnouncement` on a verified persist receipt | 5 | Low |
| P1 | Converge registries to one runtime source of truth; add global build-status navigation gate | 4 | Medium |
| P2 | Per-screen Constitution 128 simplicity audit on top ~8 entry surfaces | 2 | Medium |
| P2 | Live runtime voice + flow walkthrough across emotional states (certifies Cat 1, 2, 4) | 1, 2, 4 | Medium |

---

## Recommended Phase 2

This audit certified architecture and code. The remaining uncertainty is **felt experience** — Categories 1, 2, and 4 need a live dev-server walkthrough (first-touch → action → saved state → next step → return) across ADHD-relevant states: overwhelmed, distracted, fatigued, returning after absence. That is the pass that turns "architecture is ready" into "the member felt Shari sitting beside them."
