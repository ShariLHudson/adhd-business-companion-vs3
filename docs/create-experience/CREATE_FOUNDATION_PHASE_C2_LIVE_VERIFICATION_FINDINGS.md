# Phase C-2 Live Verification Findings — Not Fully Resolved

**Status:** C-2 code shipped and unit-tested. Live end-to-end verification found a deeper, pre-existing blocker that is **not fixed by this change** and needs its own scoped review.
**As of:** 2026-08-07.

---

## What C-2 built and verified

Per `CREATE_FOUNDATION_TRANSITION_MAP.md`'s own verdict, C-2 wires the chat-confirmed understanding conversation into the exact same completion path the Create entrance catalog already uses:

- `lib/estateBrain/workRecognitionFallthrough.ts` — a typed Create Foundation confirm now requires one explicit "yes" (the 130 One Creation Rule's chat-side equivalent of the catalog panel's confirm button — `entranceUnderstanding.ts`'s own header comment: *"this module only ever returns the classifier's own confirm/clarify outcomes — it cannot open Work"*). That "yes" arms `armEntranceUnderstandingHandoff` and returns an `openWorkspace` payload.
- `lib/frictionlessActionLayer.ts` — `immediateCreateFoundationOpen` carries that payload through `FrictionlessActionDecision`.
- `app/companion/CompanionPageClient.tsx` — consumes it by calling `startFreshCreateFromEstate` **unchanged** — the identical function the catalog confirm click calls.

**Unit-tested exhaustively** (`workRecognitionFallthrough.test.ts`, `frictionlessActionLayer.test.ts`, `CompanionPageClient.createFoundationOpenWiring.test.ts` — the last using this codebase's own established source-locking pattern for a file too large to mount). All pass. Full regression sweep: 571 passing, 16 pre-existing failures confirmed via direct A/B (identical with the change present and reverted).

## What live browser verification found

Testing the founder's own example — typing "I want to create a newsletter" into the Companion home's default composer — revealed the message never reaches any of this session's Create-reasoning work at all. Instead, it opens the **legacy, quarantined `ContentGeneratorPanel`** (`workspacePanel: "content-generator"`, `chatLayoutMode: "split"` — the exact split-screen mechanism `CREATE_FOUNDATION_PHASE_C_PLAN.md` §2 already flagged as retired by Standard 066), via a completely separate code path: `lib/conversationRouter/` classifies the message as `create_or_project_action` and calls `executeCreateOpenInternal` (`app/companion/CompanionPageClient.tsx:8497`) directly — room-navigation semantics, not a chat reply.

This is the **third** distinct system found to compete for this exact message shape, on top of the two already known (Work Recognition/`entranceUnderstanding.ts`, and the older `universalCreation` orchestrator):

1. `lib/conversationRouter/` (`classifyTurnIntent.ts`, `resolveTurnPriority.ts`) — classifies intent and can trigger direct room-navigation-style workspace opening, entirely bypassing `resolveFrictionlessAction`.
2. `lib/shariAnswerFirst/turnAuthority.ts` — independently decides turn ownership; `decideConversationTurnAuthority` sets `owner: "create_execution"` whenever `decision.explicitCreationRequested` is true (very likely true for "I want to create X" phrasing), which **skips `presentFrictionlessLocalReply` entirely** — including all of `resolveFrictionlessAction`'s own `localReply`/`immediate*Open` handling — unless `frictionlessIsCreatePresentation` says otherwise.
3. `resolveFrictionlessAction` (Work Recognition, C-1/C-2) — the layer this session's work lives in.

## What was fixed, and what wasn't

**Fixed, verified, committed:** system 2. `frictionlessIsCreatePresentation`'s bypass previously only recognized `category === "universal_creation"`; Work Recognition's own decisions (`category: "estate_discovery"`) were silently blocked the same way. Added `isWorkRecognitionJourney: true` to every Work Recognition decision and a `frictionlessBypassesTurnAuthority` check that includes it — a small, targeted, unit-tested extension of an existing gate, not a redesign. This is a genuine, real fix — it was necessary regardless of system 1, and it retroactively explains why parts of Phase B/C-1 may not have been reaching the live app either (their own unit tests, which call `resolveFrictionlessAction` directly, never exercised this app-level gate).

**Not fixed:** system 1. `lib/conversationRouter/`'s room-navigation dispatch runs *before* `turnAuthority` is even relevant — it doesn't consult `resolveFrictionlessAction`'s decision at all for messages it classifies as `create_or_project_action`. Re-verified live after the system-2 fix landed: identical result (`content-generator`, `chatLayoutMode: split`). Fixing this would mean either teaching `conversationRouter` about Work Recognition's in-progress typed conversations, or changing when/whether it claims a bare "I want to create X" message ahead of chat's own reply — a change to a fourth, previously-unmapped system, well beyond "match the catalog path order exactly" or "scoped implementation only."

## Recommendation

Do not attempt to fix `lib/conversationRouter/`'s room-navigation dispatch under the current scope. It needs its own review: what governs `create_or_project_action` classification, why it takes direct-navigation priority over a chat reply, and whether Work Recognition's in-progress session should be a signal it consults (mirroring how `turnAuthority` already needed a Work-Recognition-aware exception). Flagging this precisely, with file names, rather than leaving it as a vague "still doesn't work" — the founder's own acceptance test ("Chat creation request completes understanding journey") is not yet satisfied for the exact phrasing tested, and that should not be implied otherwise.

## Evidence

- Live browser session (2026-08-07, `companion-dev-verify`, port 3010), full console trace captured before and after the `turnAuthority` fix — identical `conversationRouter`/`executeCreateOpenInternal` outcome both times.
- `lib/conversationRouter/classifyTurnIntent.ts:110-118`, `resolveTurnPriority.ts:19-62`, `routingTypes.ts:17,37` — the classifier.
- `app/companion/CompanionPageClient.tsx:8453-8512` — the room-navigation dispatch, `executeCreateOpenInternal` call, `directOpen` branch.
- `lib/shariAnswerFirst/turnAuthority.ts:116-153` — `explicitCreate`/`create_execution` ownership (system 2, fixed).
