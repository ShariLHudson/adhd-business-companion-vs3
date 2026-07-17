# 152–154 — Boardroom Decision and Selection (Live Results)

**Status:** `unit_verified` · authenticated preview **Pending**  
**Do not deploy production** until `153_BOARDROOM_DECISION_AND_SELECTION_LIVE_CHECKLIST.md` passes.

## Root cause

`BoardDirectorDiscussionIntake` hard-gated on **“The Chair is required”** before decision intake. Start Discussion from Meet the Directors only opened that intake (often with empty/non-Chair selections), so discussion never began. `ensureChairInDraft` / `createBoardDirectorDiscussionFromDraft` also auto-inserted the Chair.

## What shipped

- Chair optional — no Chair-required dead-end screen
- Bring a Decision → fresh decision intake (“What decision, situation, or question…”)
- Meet the Directors → Start Discussion preserves selection; asks for topic if needed
- Session created with selected Director IDs + topic (no forced Chair)
- Skip optional context; Begin requires topic + ≥1 Director
- Choose Directors from review when none selected

## Owners

| Concern | Owner |
|---------|--------|
| Board session | `BoardDirectorDiscussionRecord` in `boardDirectorDiscussion.ts` |
| Decision intake | `BoardDirectorDiscussionIntake.tsx` |
| Director selection | `BoardDirectorsMeetExperience` + board review state |
| Chair rule | `ensureChairInDraft` (optional only) |
| Start Discussion | `BoardroomRoomPanel.beginDiscussionWithDirectors` |
| Active discussion | intake result / upsert store |

## Automated tests

`boardDirectorDiscussion.chairOptional.test.tsx` + related intake/thomas tests — **passed**

## Limitations

- Live multi-Director contribution rounds still use opening turns (not a full multi-round debate engine)
- Authenticated checklist not yet run
