# 145 — Round Table Boardroom 12/10 Certification & Integration

**Status:** Provisionally certified (unit + static verification)  
**Date:** 2026-07-21  
**Scope:** Decision wizard protection · compact Director selection · Skip Optional Details · multi-Director voices · outcome integration · Current Focus · Decision Records · Call the Board · Estate linkage

## Mission

The Boardroom is Spark Estate’s executive decision center — not a standalone chat. Members bring important decisions, hear multiple perspectives, choose confidently, and turn recommendations into action across the Estate.

## PART 1 — Decision Wizard (protected)

Preserved interaction patterns:

| Pattern | Status |
|--------|--------|
| One question at a time | Pass |
| Four-step decision process | Pass |
| Visible progress (Step N of 4) | Pass |
| Save and Return Later | Pass |
| Skip Optional Details | Pass (fixed) |
| Cancel | Pass |

**No redesign** of the successful framing wizard.

## PART 2 — Compact Director Selection

| Requirement | Status |
|-------------|--------|
| Compact selector first (photo · name · role · one-line specialty · checkbox) | Pass |
| Select Recommended Directors | Pass |
| Select Core Board | Pass |
| Select All / Clear Selection | Pass |
| Learn About This Director (expand / open profile) | Pass |
| Full biographies optional (Browse full biographies) | Pass |

**Implementation:** `CompactBoardDirectorSelector` · wired in Meet the Directors gallery + intake review.

## PART 3 — Skip Optional Details

| Bug | Fix |
|-----|-----|
| Placeholder prompts shown as member answers | `formatOptionalAnswerForDisplay` + Chair opening omits empty optionals |
| Skip only advanced one step | Skip now jumps to **review** and clears remaining optional fields |

Neutral copy when skipped: *“No additional optional details were provided.”* / Decision Record risks: *“No additional concerns were provided.”*

## PART 4 — Multi-Director Discussions

| Requirement | Status |
|-------------|--------|
| Every selected Director participates | Pass (`buildDirectorPerspectiveTurns`) |
| Role- and lens-specific voice | Pass |
| Chair facilitates, does not replace others | Pass |
| Speakers clearly distinguished | Pass (`speakerName` / `data-speaker`) |

## PART 5 — Board Outcome Integration

| Requirement | Status |
|-------------|--------|
| Primary: **Use This Recommendation** | Pass |
| Progressive secondary actions (batches of 3) | Pass |
| Not all actions at once | Pass |

**Component:** `BoardDiscussionOutcomePanel`

Secondary options include: Add to Current Project · Plan My Day · Task · Reminder · Evidence · Record as Decision · Board History · Chamber · Related Strategy.

## PART 6 — Current Project Awareness

| Requirement | Status |
|-------------|--------|
| Call the Board / source context surfaces Current Focus | Pass |
| Recommendations attach to related Project by default (Decision Record fields) | Pass |
| Never silently create a new Project | Pass (no auto-create path) |

## PART 7 — Decision Record

Structured record on every completed Path A discussion:

- Decision title · Date · Participating directors · Summary · Key risks · Opportunities · Final recommendation · User’s final choice · Related Project / Strategy / Cartography / Evidence / Wins hooks

Searchable via **Review Past Board Discussions** (Path A rows openable → Decision Record detail).

## PART 8 — Estate Integration

Connect surfaces:

| Surface | Hook |
|---------|------|
| Projects | Call the Board + relatedProjectId |
| Strategies | Call the Board from execution footer |
| Plan My Day / Evidence / Chamber / Strategy | Progressive outcome actions |
| Cartography / Wins / Hall | Decision Record fields reserved |

## PART 9 — Hall of Accomplishments

Lineage fields ready on Decision Record (`relatedWinId`, project linkage). Full Hall ceremony wiring remains follow-up when a Board-guided milestone is marked complete — architecture does not orphan Board → Project → Win.

## PART 10 — Accessibility & Navigation

| Check | Status |
|-------|--------|
| Compact selector checkboxes + keyboard focus | Pass (native inputs + focus-visible) |
| Expandable biographies | Pass |
| Selected-state indicators | Pass (`aria-selected` / `--selected`) |
| Reliable return to source | Pass (`onReturnToSource` / outcome control) |

## PART 11 — Browser Certification Matrix

| Flow | Unit / static | Browser |
|------|---------------|---------|
| Start Decision | Pass | Provisional |
| Save and Resume | Pass (draft persistence) | Provisional |
| Skip Optional Details | Pass | Provisional |
| Director Selection (compact) | Pass | Provisional |
| Multiple Directors | Pass | Provisional |
| Board Discussion | Pass | Provisional |
| Decision Record | Pass | Provisional |
| Integration with Project | Pass (Call the Board) | Provisional |
| Evidence / Business Pulse | Progressive actions present | Provisional |
| Return to Source | Wired | Provisional |
| Accessibility | Static | Provisional |
| Regression (no placeholders / no missing voices / no orphaned Path A past) | Pass | Provisional |

**Provisional note:** Full MCP browser matrix not executed in this pass. Re-run against Production/Preview when available.

## Call the Board (architectural improvement)

From Project Homes (primary + tools) and Strategy execution “More…”:

1. Captures Current Focus / strategy title into `sourceContext`
2. Seeds Board intake draft (decision prefilled → review)
3. Opens Boardroom intake without restating everything

**Runtime:** `lib/board/callTheBoard.ts`

## Final Product Principle

Members should finish every Board session feeling:

- “I heard thoughtful perspectives.”
- “I understand my options.”
- “I know what to do next.”
- “That decision is now part of my business, not just another conversation.”

## Key files

- `lib/board/boardDiscussion/boardDirectorDiscussion.ts`
- `lib/board/callTheBoard.ts`
- `lib/board/boardDiscussion/boardOutcomeActions.ts`
- `components/companion/board/CompactBoardDirectorSelector.tsx`
- `components/companion/board/BoardDiscussionOutcomePanel.tsx`
- `components/companion/board/BoardDirectorDiscussionIntake.tsx`
- `components/companion/board/BoardDirectorsMeetExperience.tsx`
- `components/companion/boardroom/BoardroomRoomPanel.tsx`
- `components/companion/projectHomes/ProjectHomeDetail.tsx`
- Tests: `lib/board/boardDiscussion/boardDirectorDiscussion.prompt145.test.ts`

## Certification verdict

**Provisionally certified for Prompt 145** — wizard protected; friction reduced; functional defects addressed; Board outcomes and Call the Board integrate with Projects/Strategies. Promote to full certification after browser matrix on Preview.
