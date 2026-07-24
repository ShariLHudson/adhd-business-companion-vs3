# Boardroom Entry and View State

**Product rule:** Entering a destination is different from resuming its last conversation.

Ordinary Estate navigation to **Round Table Boardroom** means: *Take me to the Boardroom* — not *Automatically resume my previous Board discussion*.

## Boardroom view modes

One mode controls the main Boardroom content at a time:

| Mode | Runtime view(s) | Purpose |
|------|-----------------|--------|
| `boardroom_home` | `meet-directors` (primary), `home` (legacy three-choice) | Round Table + directors + seating |
| `director_profile` | Meet route `profile` inside `meet-directors` | Single director card |
| `board_discussion` | `board-director-intake`, `discussion`, … | Active Board intake / meeting |
| `saved_discussions` | `past`, `past-detail` | History browser |

Types: `BoardroomViewMode` in `lib/boardroom/boardroomViewState.ts`.

## Boardroom home

Every ordinary navigation (`openBoardroomCore({ intent: "home" })` or menu / Explore “Round Table Boardroom”) opens:

- `boardroomViewMode = boardroom_home`
- seating / director overview (`meet-directors`)
- Round Table open by default on first paint

Home shows:

- the room and Round Table seating layout
- all available Board members in assigned seats
- ability to select directors and begin a discussion
- optional secondary **Resume Discussion** when a draft exists

It does **not** show full Board chat immediately on destination entry.

## Seating map source

Canonical seats: `lib/board/roundTable/seats.ts` (`ROUND_TABLE_SEATS`).

Directors resolve from `lib/board/boardDirectorRegistry.ts` via `getBoardDirectorById`.

UI: `RoundTableOverlay` + `BoardDirectorsMeetExperience`. Do not invent a second seating list.

Each seat exposes director id, name, role, position, selection state, and keyboard focus.

## Director profile

Selecting a director opens the profile route inside Meet (`director_profile`).

Provide Add to Discussion / Talk With This Director / **Back to Boardroom** (returns to seating / gallery, not Welcome Home).

## Board discussion

Enter `board_discussion` only when the member:

- chooses Ask the Full Board / Start New
- selects directors and begins
- explicitly **Resume Discussion**
- uses Call the Board / deliberate intake deep link (`intent: "intake"`)

Leaving discussion preserves the draft (suspended) and returns to Boardroom home.

## Re-entry behavior

1. Enter Boardroom → seating home  
2. Begin or open a Board discussion  
3. Leave Boardroom  
4. Click Round Table Boardroom again  

**Expected:** seating overview again. Prior chat does **not** auto-open. Resume is secondary.

Do **not** restore `board_discussion` solely because of:

- last active Board scope  
- draft existence  
- `awaitingAnswer`  
- recent Board message  
- Call-the-Board sessionStorage  
- previously selected directors  

## Resume behavior

When a resumable intake draft exists, show:

> You have an unfinished Board discussion.

Actions: **Resume Discussion** · **Start New** · **View Board Members** / Previous Discussions.

- Resume → `resumeBoardIntakeConversation()` then intake view  
- Start New → `clearBoardIntakeDraft()` (saved history records remain)  
- View members → stay on / return to seating  

## Persistence boundaries

| Persist | On ordinary home entry |
|---------|------------------------|
| Intake draft content | Kept (may be suspended) |
| `conversationSuspended` | Set true on leave / home re-entry |
| Call-the-Board session payload | Consumed/cleared on ordinary home |
| Conversation owner `board_intake` | Cleared on leave / home re-entry |
| Selected directors (Board Review) | May remain remembered without opening chat |
| Saved discussion records | Untouched |

## Chat scope interaction

- Destination entry: `boardroomShariChatOpen = false`, estate room chat hidden  
- Continuity owner must not choose the initial Boardroom view  
- Board intake UI mounts only in `board_discussion`  
- Do not hide chat with CSS while leaving discussion mounted  

## Deep links

Deliberate intents still work:

- `intent: "intake"` + `sourceContext` → discussion  
- `meet-thomas` / other meet-* → profile path  
- `past` → saved discussions  

Ordinary Estate navigation always resolves to home seating.

## Tests

- `lib/boardroom/boardroomViewState.test.ts`  
- `lib/boardroom/boardroomEntry.test.ts`  
- `components/companion/boardroom/BoardroomRoomPanel.test.tsx`  
- Intake suspend/resume: `lib/board/boardDiscussion/boardDirectorDiscussion.intake.test.ts`  

## Certification checklist

- [ ] Direct nav opens boardroom_home / seating  
- [ ] Re-entry after discussion still shows seating  
- [ ] Resume only on explicit action  
- [ ] Start New does not delete past discussion history  
- [ ] Back to Boardroom returns to seating  
- [ ] Board chat not mounted on home  
- [ ] Awaiting-answer cannot force discussion mode  
- [ ] Explicit deep link to intake still works  
