# Create Foundation Convergence Review

**Status:** Analysis only, per founder instruction — no code in this pass.
**As of:** 2026-08-07, after Work Recognition Phase A + Phase B.
**Trigger:** `WORK_RECOGNITION_ACCEPTANCE_TESTS.md`'s case 2 gap — "I want to create a newsletter." is intercepted by Create Foundation routing but the hand-off never completes.
**Method:** four parallel read-only traces (obeying the Subagent Safety Rule), no assumptions carried over from earlier sessions — every claim below is cited to a specific file:line.

---

## Headline finding, before the five questions

**"Create Foundation" is not a workspace, screen, or experience. It is a routing gate with no positive destination.** `lib/creationIdentity/createFoundationRouting.ts`'s `shouldRouteDirectlyToCreateFoundation()` answers one question — "should this text skip Universal Creation's old discovery interview?" — and every one of its five call sites in `lib/frictionlessActionLayer.ts` and `lib/universalCreation/orchestrator.ts` uses a `true` answer only to **decline the turn** (`return null` / `return finish({...none})`). Nothing downstream opens anything. The one test that documents an intended hand-off (`lib/creationIdentity/checklistCreateFoundationHandoff.test.ts`) **fails against current `CompanionPageClient.tsx`** — the strings it asserts (`CREATE_FOUNDATION_HANDOFF`, `openUniversalCreationFromText`) don't exist in that file today.

Meanwhile, a **second, completely separate system already works end-to-end**: the Create entrance catalog (`components/companion/CreateEstateEntrancePanel.tsx`) → `lib/createEstate/entranceUnderstanding.ts`'s 5-question conversation → confirm → open workspace. It has **zero references** to `createFoundationRouting.ts` anywhere in its code. Picking "Newsletter" from the dropdown works today; typing "I want to create a newsletter" in chat does not — not because the two paths disagree about what a newsletter is, but because they are **two unconnected systems**, and only one of them was ever finished.

That reframes the whole task: this isn't "fix the Create Foundation newsletter handoff." It's "stop routing chat's Create-Foundation-classified messages into a dead end, and instead hand them to the entrance conversation that already works" — reusing proven code, not building new code to complete an abandoned design.

---

## 1. Current Create Foundation responsibility

**What it actually does today:** a pure classifier + negative gate. `resolveCreateFoundationClassification(userText)` derives a `classificationType`/`universalDocumentType` (via `deriveCreationIdentity.ts`'s `ARTIFACT_KIND_RE` and a "lightweight" reimplementation of `UNIVERSAL_DOCUMENT_PLUGINS` pattern-matching — explicitly commented `"avoids importing orchestrator (circular risk)"`, `createFoundationRouting.ts:61`), then `shouldRouteDirectlyToCreateFoundation()` returns `true` for a fixed set of 16 labels (`CREATE_FOUNDATION_DIRECT_LABELS`) and `false` for 6 others (`PRE_WORKSPACE_DISCOVERY_UC_TYPES`: email, sales_funnel, website, presentation, business_plan, social_post — these still get Universal Creation's own interview).

**What it's supposed to prevent:** Universal Creation's own discovery interview (`lib/universalCreation/orchestrator.ts`) claiming document types that don't need it — confirmed a structural dead-end in earlier work this session (never opens a workspace, separate session store).

**What it does NOT do, contrary to its name:** open anything called "Create Foundation." There is no such component. Its intended fallback, per `lib/companionBehaviorAudit.ts:529-537`, is the generic `content-generator` panel — which has no 5-question understanding logic of its own.

**A genuine, pre-existing bug, independent of anything the founder asked about:** `shouldRouteDirectlyToCreateFoundation()` checks `ucType` membership in `PRE_WORKSPACE_DISCOVERY_UC_TYPES` *before* checking `CREATE_FOUNDATION_DIRECT_LABELS` (`createFoundationRouting.ts:94-96` runs before `:106`). "Landing page" is declared a Create-Foundation-direct label (line 47) but its own pattern also matches the `website` UC plugin's `detectPatterns` (`documentRegistry.ts:96`) — so `ucType` resolves to `"website"` first, the early `PRE_WORKSPACE_DISCOVERY_UC_TYPES` check fires, and the label check is never reached. **"I want a landing page" is silently routed into the dead-end UC interview today, despite being on the direct-label list meant to prevent exactly that.** This is not caused by this convergence — it already exists — but any convergence work touches this exact file and should fix it as a natural side-effect, not leave it.

**Duplication already present, before any convergence work:** creation-type classification currently exists in **four independent places** — `orchestrator.ts`'s `detectUniversalDocumentType`, `createFoundationRouting.ts`'s `detectDocumentTypeForFoundationRouting` (a thinner copy of the same plugin list, missing several of the original's guards), `deriveCreationIdentity.ts`'s `ARTIFACT_KIND_RE` (a fourth, fully independent hand-written pattern list — doesn't recognize "landing page," "lead magnet," "offer," "course outline," or "training manual" as phrases at all, only single words), and `lib/createEstate/resolveCreateBeginOutcome.ts`'s `resolveArtifactType` (the classifier `entranceUnderstanding.ts`'s *typed* path already uses). The founder's "do not duplicate Create logic" constraint is already violated in the current codebase, independent of this work — a convergence that adds a fifth classifier would make it worse; one that collapses onto an existing classifier makes it better. Treat this as a **cleanup opportunity inside the same files this convergence must touch anyway**, not scope creep.

---

## 2. Safest convergence point

**Reuse the exact call sites that already exist; change only what happens when the gate says "true."**

Today, five call sites in `lib/frictionlessActionLayer.ts` (`:1516-1521`, `:1956-1962`, `:4277-4282`, `:4503-4508`, `:4520-4524`) and one in `orchestrator.ts` (`:984-990`) all do the same thing when `routeDirectlyToCreateFoundation` is `true`: bail out with nothing. **The convergence point is exactly here** — replace "bail with nothing" with "start `entranceUnderstanding.ts`'s conversation, pinned to the already-classified type," at the same positions, changing nothing about *when* the gate fires or *what* it excludes.

Concretely, this means extending the pattern Work Recognition Phase 1/A/B already built (`lib/estateBrain/workRecognitionFallthrough.ts`) with a **typed sibling**, not a new engine:

- `resolveWorkRecognitionNewRecognition(text)` already calls `startEntranceUnderstanding(text)` (untyped — the classifier lives inside `entranceUnderstanding.ts` itself, via `resolveCreateBeginOutcome.ts`).
- A new `resolveCreateFoundationHandoff(text)` would call `startEntranceUnderstandingForCatalogType(label, text)` — **the exact same function the working catalog-pick path already calls** (`CreateEstateEntrancePanel.tsx:384-388`) — using the label `resolveCreateFoundationClassification` already computed, so the type is *trusted*, not re-derived. Same chat-native session persistence Work Recognition already built (`saveWorkRecognitionSession`/`loadWorkRecognitionSession`, or a sibling storage key) — proven, tested pattern, reused verbatim.

**Why this is the safe point and not, say, moving the check to Work Recognition's late fallthrough (line 4478):** the 9 catalog-pickable Create-Foundation types already work perfectly via the dropdown, completely unaware this gate exists — nothing about them needs to change. Only the *chat* path is broken, and it's broken at these exact five/six call sites, which currently do nothing. Fixing the "do nothing" branch in place is the minimal-diff option; relocating the whole decision elsewhere would touch more code for no additional benefit and risk the exact regressions the file's own "sole authority gate" comment warns about.

**Why this preserves "previous work recognition" for free, not by extra effort:** `tryWorkRecognitionResumption` (the early priority check from Phase A/AT-5.7) sits at `frictionlessActionLayer.ts:4091` — *before* every Create-Foundation call site (`4269`+). As long as the new handoff code is inserted at the existing positions (never earlier), an in-flight Work Recognition/entrance session already wins the turn before the Create-Foundation gate is ever consulted, exactly as it does today for every other detector. No new resumption logic is needed — the existing priority ordering already covers this case structurally.

---

## 3. How Chat / Create / dropdown should share one journey

Today there are effectively two parallel paths into the same underlying question-conversation:

| Entry | Classifier used | Destination |
|---|---|---|
| Dropdown/catalog pick | none — label trusted directly (`resolveCatalogCreateConfirm`) | `entranceUnderstanding.ts`, works |
| Chat, shape-matched (develop/build/improve/create/plan, untyped) | `detectWorkRecognitionShape` | `entranceUnderstanding.ts` (`startEntranceUnderstanding`), works — Phase B |
| Chat, Create-Foundation-classified type (newsletter, SOP, checklist, ...) | `resolveCreateFoundationClassification` | **dead end** |

The convergence collapses this to one shape: **every entry point ends up calling one of `entranceUnderstanding.ts`'s two start functions** (`startEntranceUnderstanding` for untyped/shape-matched, `startEntranceUnderstandingForCatalogType` for typed/classified) — never a third engine, never a parallel session store. The distinction between "dropdown," "chat shape match," and "chat Create-Foundation match" becomes purely about **which classifier decided the type**, not which conversation runs afterward:

- Dropdown: type chosen explicitly by the member (highest confidence, no classifier needed).
- Chat + Create-Foundation label match: type inferred with high confidence from text (`resolveCreateFoundationClassification`) — trust it the same way the dropdown does (`startEntranceUnderstandingForCatalogType`), skip re-classification.
- Chat + shape match only (no specific type inferred): stays on the existing untyped path (`startEntranceUnderstanding`), unchanged from Phase B.

This is also the natural point to fix the "landing page" precedence bug (§1): once `resolveCreateFoundationClassification`'s output feeds the SAME typed hand-off as a genuine catalog label, a landing-page request should resolve to the `"landing page"` catalog type, not silently fall into UC discovery.

**What stays untouched:** the 6 `PRE_WORKSPACE_DISCOVERY_UC_TYPES` (email, sales_funnel, website, presentation, business_plan, social_post) are *explicitly excluded* from Create-Foundation-direct routing today — that exclusion is intentional (per `createFoundationRouting.ts`'s own header) and out of this convergence's scope. They keep going through Universal Creation's own interview for now. Converging *those* onto `entranceUnderstanding.ts` is a separate, larger decision — flagged in §5, not proposed here — because it would require porting their embedded tone/audience discovery questions (see next section) and is a bigger blast-radius change than the founder asked for.

---

## 4. How the existing split-screen should become a later-stage, optional workspace view

The mechanism the founder is describing already exists and is already structured close to what was asked: `components/companion/WorkspaceLayout.tsx`, governed by `chatLayoutMode: "split" | "workspace-focus"` (`lib/workspaceNav.ts:9`). It defaults to `"workspace-focus"` (single-pane, `lib/workspaceChatPreference.ts:6`) and only becomes split via an explicit member click on a toggle in the workspace header (`WorkspaceLayout.tsx:275-299`) or transiently while a document is still mid-build. Split shows the same content either way — it never contains distinct functionality of its own, only the conversation alongside whatever the workspace pane already shows. This already matches "optional, later-stage" for the legacy `content-generator` document path.

**A real conflict that must be surfaced, not silently resolved:** `docs/create-experience/standards/066_SINGLE_EXPERIENCE_WORKSPACE_STANDARD.md` — binding, in force on this branch — declares the split architecture **retired** for the newer Creation Destination model (Event/Course/Project/etc., the path `entranceUnderstanding.ts` + `CreateEstateWorkingPanel`/`CurrentFocusInteraction` already serve). This isn't just doc language — it's enforced at runtime: `assertCreationDestinationQuestionMode()` (`lib/currentFocus/questionMode.ts:34-44`) **throws** if split mode is requested for a Creation Destination session, and `lib/singleExperienceWorkspace/bannedCopy.ts` actively scrubs "split screen"/"split view"/"beside chat" language from Shari's copy.

Since this convergence routes newsletter/SOP/checklist/etc. through the same `entranceUnderstanding.ts` → Current Focus → workspace path Creation Destinations already use, those types would **inherit the existing split-screen ban automatically**, which contradicts "preserve split-screen as optional later-stage view" for them specifically.

**Reading 066 closely, the conflict may be narrower than it first appears.** 066's banned conditions target *permanence* — "a permanent interface showing Chat | Workspace," "opening Create into `chatLayoutMode: 'split'`" (i.e., split as the *landing* state). What the founder is describing — reachable only later, via explicit toggle, after Current Focus/the full workspace is already open — is arguably not what 066 was written to prohibit. But this is an interpretation, not a fact, and 066 is a binding standard document with active enforcement code, not a casual note. **This needs an explicit founder decision, not a code-level judgment call:** either (a) confirm the founder's "optional later-stage split" intent is compatible with 066 as written, and amend 066 with an explicit carve-out for a member-triggered, non-default toggle, or (b) treat this as a genuine standards conflict requiring its own review before touching `CreateEstateWorkingPanel`'s question-mode assertion. I have not touched `assertCreationDestinationQuestionMode` or 066 in this pass — flagging only.

One small, low-risk item found in passing: `components/companion/CreateSplitScreenStatus.tsx` is dead code (exported, never imported anywhere in the repo) — worth a separate cleanup ticket, unrelated to this convergence.

---

## Preservation checklist — where each founder-named system actually stands

- **Client avatar intelligence** — real, working, but **not connected to the entrance conversation at all**. Saved avatars (`lib/companionStore.ts`) feed generation through a *separate*, global, localStorage-persisted Audience picker (`lib/contentAudience.ts`), consumed directly by `lib/currentFocus/buildCreationDraft.ts`. Converging Create Foundation onto `entranceUnderstanding.ts` **does not touch this mechanism at all** — it keeps working exactly as it does today, independent of whatever the conversation asks. Nothing to preserve *changes*; nothing new needs to be built for this convergence to be safe here.
- **Voice/tone intelligence** — same shape as client avatar: a global tone picker (`CONTENT_VOICE_TONES`, same file) feeds generation the same way, untouched by this convergence. **Separately**, the 6 `PRE_WORKSPACE_DISCOVERY_UC_TYPES` currently carry their own embedded tone/audience questions inside Universal Creation's own interview (`lib/universalCreation/documentCreationProfiles.ts`) — since those 6 types are explicitly *out of scope* for this convergence (§3), their tone questions are undisturbed too.
- **A gap worth naming, not fixing here:** `entranceUnderstanding.ts`'s `"create-audience"` answer already maps into `workingMemory.intendedAudience` (`lib/currentFocus/sopDiscoveryFocus.ts:49`), but `buildCreationDraft.ts`'s actual generation call **never reads `workingMemory` at all** — the conversation's own audience answer currently has no effect on the draft; only the separate global picker does. This is a pre-existing disconnect, not something this convergence creates or is required to fix — but it's the kind of gap `CREATE_WORKSPACE_TRANSITION_REVIEW.md` already flagged (`workingMemory` is "write-mostly"), and closing it would make "asks purpose/audience questions before workspace" (the founder's own newsletter acceptance criterion) actually mean something for generation, not just for the confirm message. Recommend a future, separately-scoped phase — noted here so it isn't lost.
- **Previous work recognition** — preserved structurally for free, per §2 (resumption check already runs before every Create-Foundation call site).
- **Split-screen as optional later-stage view** — mechanism already matches for legacy content-generator types; genuine standards conflict for Creation-Destination-routed types, flagged in §4 for explicit founder decision.

---

## 5. Required acceptance tests (for Phase C, when approved)

1. **The founder's original case, end-to-end:** "I want to create a newsletter." in chat → recognized, asks purpose/audience/existing/constraints (the same 5-question set the catalog path already uses), reaches a confirm step, opens a workspace — parity with picking "Newsletter" from the dropdown.
2. **Parity test, not just a passing test:** the chat-typed and catalog-picked paths for the same type produce the *same* session shape, confirm copy, and workspace-open call — proving genuine convergence onto one journey, not a second copy that happens to look similar.
3. **Full label coverage, not just newsletter:** all 9 already-catalog-pickable `CREATE_FOUNDATION_DIRECT_LABELS` (checklist, newsletter, sop, proposal, document, lead magnet, landing page, offer, course outline) work via chat the same way. Separately, document current behavior (pass or documented gap, founder's call) for the 7 that have no catalog entry point at all (guide, playbook, workbook, agenda, template, course, training manual) — these may still collapse to a generic label and that's acceptable as long as it's consistent and never silently wrong.
4. **The landing-page precedence bug, regression-fixed:** "I want a landing page" no longer routes into Universal Creation's dead-end interview; resolves to the `"landing page"` catalog type through the same typed hand-off.
5. **Previous work recognition wins:** an active Work Recognition/entrance session (e.g., mid-workshop understanding conversation) is not interrupted or hijacked by a Create-Foundation-classified message in the same turn sequence, unless the member explicitly redirects — reusing the existing AT-5.7 resumption-priority test pattern, extended to cover a Create-Foundation-classified reply specifically.
6. **Client avatar / voice-tone regression, not new coverage:** the global Audience/Tone picker (`lib/contentAudience.ts`) still feeds `buildCreationDraft.ts` identically before and after convergence — existing `contentAudience.test.ts`/`audienceContext.test.ts` coverage should be re-run as the regression floor, not rewritten.
7. **Out-of-scope types unaffected:** the 6 `PRE_WORKSPACE_DISCOVERY_UC_TYPES` (email, sales_funnel, website, presentation, business_plan, social_post) still route through Universal Creation's own interview exactly as before — this convergence must not change their behavior.
8. **Split-screen still reachable for legacy content-generator types** after the convergence code lands nearby — a regression test that toggling to split still works for a document-shaped creation untouched by this change.
9. **No fifth classifier introduced:** a review-level check (not necessarily a runtime test) that the convergence code calls `resolveCreateFoundationClassification`'s existing output rather than adding new type-detection logic — enforces "do not duplicate Create logic" as a design constraint, not just an aspiration.
10. **Decide the fate of `checklistCreateFoundationHandoff.test.ts`** before coding: it currently fails and asserts a different, seemingly abandoned design (`CREATE_FOUNDATION_HANDOFF`, `openUniversalCreationFromText`, `bootstrapWorkspaceV2Session`). Read it in full first — it may contain a genuine design lead worth folding in, or it may simply need to be rewritten against the design in this doc.

---

## Evidence Matrix

- **Sources:** four parallel Explore-agent traces (2026-08-07, read-only, Subagent Safety Rule observed) covering (a) Create Foundation identity vs. `entranceUnderstanding.ts`, (b) split-screen implementation and Standard 066, (c) client avatar / voice-tone systems, (d) the four-classifier document-type routing map. `lib/creationIdentity/createFoundationRouting.ts`, `lib/createEstate/entranceUnderstanding.ts`, `components/companion/CreateEstateEntrancePanel.tsx`, `components/companion/WorkspaceLayout.tsx`, `docs/create-experience/standards/066_SINGLE_EXPERIENCE_WORKSPACE_STANDARD.md`, `lib/contentAudience.ts`, `lib/currentFocus/buildCreationDraft.ts`, `WORK_RECOGNITION_ACCEPTANCE_TESTS.md`.
- **Confidence:** High for the routing/classifier map, the catalog-pick reference path, split-screen's current mechanism, and the client-avatar/voice-tone disconnection finding — all directly traced with file:line citations, several with a failing/passing test run as direct evidence. Moderate for what happens to a chat message *after* `resolveFrictionlessActionImpl` returns `"none"` (not traced past the frictionless boundary — plausible dead end, not fully confirmed to the rendered screen).
- **Not done in this pass:** no code changes. `assertCreationDestinationQuestionMode`, `bannedCopy.ts`, and Standard 066 were read, not touched.

**Decision Owner:** Founder. Awaiting approval of §2's convergence point and §4's split-screen/066 resolution before any Phase C code.
