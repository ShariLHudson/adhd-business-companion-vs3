# Universal Doorway Convergence — Current vs. Target Map

**Status:** Mapping only, per founder instruction — before any Phase 2
code.
**As of:** 2026-08-06, after Create Phase 1, Universal Reasoning Journey
Build Order Step 1, Universal Work Recognition Step 1 + priority fix, and
the continuation fix — all shipped and verified this session.
**Target (Founder):**

```
User thought/request
      ↓
Work Recognition
      ↓
Universal Reasoning Journey
      ↓
Workspace when ready
      ↓
Expertise / research / support as needed
```

---

## Current state, per doorway

| Doorway | Recognition on arrival? | Journey reached? | Workspace opens? | Expertise woven in? |
|---|---|---|---|---|
| **Create (dropdown → entrance)** | N/A — arrival *is* the recognition surface | **Yes, fully** — `entranceUnderstanding.ts`'s five questions (outcome/why/audience/existing/constraints), same conversation for typed text *and* catalog picks (Build Order Step 1: the entrance is the only doorway) | **Yes** — confirm → open, Working Memory carries the answers | No — journey is Create-only, no expert voice |
| **Chat** | **Partial** — the Work Recognition seam (Step 1 + priority fix) fires only as the *last-chance* fallthrough, after every other detector fails; the older `create` goal (explicit verbs) routes through a **separate**, pre-existing `universalCreation` orchestrator, not `entranceUnderstanding.ts` | **Split** — develop/build/improve-shaped requests reach the shared journey engine; explicit "create X" requests do not | **No** — the seam's journey ends at "recognition + confirmation only" (deliberately deferred) | No |
| **Dropdown → other rooms** (Chamber, Board, Projects, Strategy Library) | **No** — `EstateRoomExperienceMenu` calls `open*Core()` thunks directly; landing is each room's own gallery/menu, not a question | No, until the member subsequently *types* something | No | No |
| **Chamber** | **Inherited, not owned** — Chamber shares `handleSend` verbatim (confirmed by trace), so a work-shaped message typed *while a persona is active* reaches the same seam as plain chat, automatically | Same split as Chat, once reached | No | Persona voice is one hint among ~60 in the same completion call — not deliberately sequenced with the journey |
| **Board** | **Inherited, not owned** — the Boardroom's own parallel Shari chat thread (`boardroomShariChatOpen`) also shares `handleSend`, so the same seam fires there too | Same split as Chat, once reached | No | The Board's actual decision flow (assemble directors, meeting turns, `recordDecision`) is a wholly separate mechanism that never reads or writes journey state |

**The headline finding:** recognition is no longer *absent* from Chamber and Board — Work Recognition Step 1 already reaches them for free, exactly as designed, because they share the chat pipeline. What's still missing is not "recognition doesn't happen there" — it's that (1) arriving *at* those rooms via the dropdown still skips recognition entirely until the member types something, and (2) even where recognition does fire, nothing after it opens a workspace or hands off to that room's own expertise.

---

## The three real gaps, in the founder's own vocabulary

1. **Chat's own "create" goal doesn't reach the journey.** The one place recognition is *most* mature (Create's entrance) and the one place it's *most* reachable (chat, via the Step 1 seam) are still two different mechanisms for the single most common request shape ("I need a newsletter"). This is the gap the earlier architecture review flagged as highest-risk to fix (shared routing surface) and is why it was deliberately deferred out of Step 1.
2. **"Workspace when ready" doesn't exist yet outside Create's own entrance.** Work Recognition's journey currently always ends at a warm confirmation message, never an opened workspace — by design, for Step 1. Converging doorways onto one journey only matters if that journey can finish somewhere.
3. **Dropdown arrival bypasses recognition for every room except Create.** The Golden Rule ("the member should never need to know where a feature lives") is only true for Create today. Landing in Chamber or the Boardroom still means facing a gallery or a seating chart before the member can express what they're trying to do.

---

## Proposed order (not yet approved — for review)

Smallest-safe-slice, matching this session's build discipline; each independently shippable and checkpointed:

1. **Converge chat's `create` goal onto the shared journey.** The highest-value, highest-risk piece — this is exactly the work the architecture review's §8 cross-system risk section already scoped (the `sourceExperience`-style safety check used for the ADR-013 fix). Closes gap 1.
2. **Let the journey open a workspace when ready**, reusing Create's own open/confirm pipeline (`resolveCreateBeginOutcome` → confirm → `onBeginCreate`) from wherever the journey completes — chat, Chamber, or Board — not just the Create entrance. Closes gap 2. This is the natural moment "Workspace when ready" in the founder's diagram becomes literally true everywhere, not just at the entrance.
3. **Dropdown lands on the conversation, not the gallery**, for Chamber and Board specifically (Create already does this). The room's existing gallery/seating UI is demoted the same way Browse Categories was — reachable, never first. Closes gap 3.
4. **Expertise as a hint inside the journey**, not a parallel persona — Chamber's `chamberMemberChatHint` and the Board's decision flow both become moments the journey can *invoke* (matching the design doc's original "Chamber becomes intelligence inside the journey" framing) rather than separate systems the member has to navigate to.

Steps 1–2 are the load-bearing pair — without a workspace to open, "converging onto one journey" has no finish line. Steps 3–4 are the visible, member-facing payoff.

---

## Evidence Matrix

- **Sources used:** `docs/create-experience/UNIVERSAL_REASONING_JOURNEY_DESIGN.md` (doorway design, Part 2), `docs/create-experience/UNIVERSAL_WORK_RECOGNITION_ARCHITECTURE_ANALYSIS.md` (chat/Chamber pipeline trace, `handleSend` fallthrough), commits `54623f4c`/`b77afcbe` (Work Recognition Step 1 + priority fix, current behavior verified via 23 passing tests), commit `b76229e3`/`994333ff` (Create entrance as the only doorway), the original Explore agent trace of Boardroom's `boardroomShariChatOpen` shared thread.
- **Confidence:** High for Chat/Create/Chamber (directly traced and test-verified this session). Moderate for Board — the shared-thread finding is from an earlier-session trace, not re-verified against the current commit; should be re-confirmed before Phase 2 code touches it.

**Approval Status:** Proposed — awaiting founder review of the proposed order before any Phase 2 code.
**Decision Owner:** Founder.
