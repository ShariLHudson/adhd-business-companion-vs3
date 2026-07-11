# Estate Room Awareness™

**Status:** Implemented  
**Global law:** Never claim “You’re already here” unless the **live shell** and `visual_room` both confirm the place is on screen.

---

## Spark always knows

| Field | Meaning |
|-------|---------|
| `visual_room` | Place currently visible |
| `live_shell_place_id` | Place implied by the live AppSection / visit (authoritative for already-here) |
| `conversation_room` | What conversation believes is active |
| `requested_room` | Explicit navigation target (pending arrival) |
| `previous_room` | Last visual room before the current one |
| `active_workflow` | In-progress flow (recognition, navigation, create, …) |

Runtime: `lib/estate/roomAwareness/`  
Recognition mirror: `lib/sparkRecognitionEngine/roomState.ts` (delegates to awareness)

---

## Already-here gate

`canClaimAlreadyHere(placeId)` returns **true** only when:

1. `visual_room` is set and equivalent to `placeId`, and  
2. `live_shell_place_id` is set and equivalent to `placeId` (after shell sync)

Wired into:

- `roomActionMatchers` / `evaluateEstateRoomAction`
- `estateInRoomConversationIntents` (`ALREADY_HERE_RE`)
- `decisionKernel/resolveEstateAction` (same-room navigate short-circuit)

If visual is unknown, mismatched, or the live page is a non-place tool → **navigate** (or stay silent) — never a false already-here reply.

`resolveEstateAction` accepts `activeSection` and syncs awareness **before** already-here decisions.

---

## Sync rules

| Event | Behavior |
|-------|----------|
| `goToPlace` / direct visit | Sets visual + live shell + conversation; clears requested; updates previous |
| Section with known map | Updates visual + live shell (e.g. `home` → `welcome-home`, `brain-dump` → `clear-my-mind`) |
| Non-place tool section (`settings`, `focus`, …) | **Clears** visual + live shell — stale rooms cannot claim already-here |
| Unknown section | Keeps last visual for ambience only; **live shell null** → already-here blocked |
| Member requests destination | Sets `requested_room` before arrival |

---

## Routing current place

`resolveCurrentEstateRoom` priority:

1. Direct visit  
2. Live shell from section  
3. Synced `liveShellPlaceId`  
4. Memory (never alone as welcome-home)

Stale `visual_room` alone never wins.

---

## Tests

- `lib/estate/roomAwareness/roomAwareness.test.ts`
- `lib/estate/roomContext/estateRoomContext.test.ts`
- `lib/estate/estateLibraryNavigation.test.ts` (already-here visual gate)
