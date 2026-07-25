# Talk It Out — Ownership Architecture Decision (Phase 3)

**Decision date:** 2026-07-25  
**Status:** Binding for Phase 3 — **not migrated in this slice**

## Recommendation: Option 2 — Explicitly separate domain

Talk It Out remains **outside** Main Companion `ConversationSession.ownership` for this product phase. It is an intentional reflective domain with its own session store, not an accidental compatibility exception.

### Why not Option 1 (bound separate ConversationSession) yet

Option 1 is the long-term ideal (dedicated spine per TIO conversation). Migrating now would expand Phase 3 into a second full spine dual-write/hydration program before Continuity/Help/Intent are certified on the Main Companion spine. Option 2 documents the boundary now; Option 1 can be scheduled as a dedicated Phase 3 completion or Phase 4 prep task.

### Contract answers

| Question | Answer |
|---|---|
| Transcript authority | `lib/talkItOut/sessionStore.ts` — session messages for the active TIO session id |
| Ownership | TIO session lifecycle owns reflective turns; **not** written to Main Companion `ConversationSession.ownership` |
| Reset (New Chat / New Day) | Clears Main Companion spine + Continuity/UC/help/etc. **Does not** clear TIO session history (documented exclusion) |
| Navigation away | Ends active TIO UI context; session may remain resumable by id |
| Return | Resume by active/resumable session id — no Main Companion ownership inheritance |
| Reload | TIO localStorage sessions survive; Main Companion spine ownership does not import TIO |
| Cross-contamination | Router scope `talk_it_out` + modeBoundaries; Main Companion adapters must not claim `talk_it_out` unless `talkItOutActive` is explicitly true in the legacy snapshot |
| Handoff to Main Companion | Only with **user-approved** handoff (future); never automatic ownership transfer |

### Adapter note

`collectOwnershipClaims` may emit `talk_it_out` **only** when CPC passes `talkItOutActive: true`. Default Companion turns do not set this flag — TIO cannot seize Main Companion ownership by accident.

### Next step before Phase 3 completion

Either:
1. Implement Option 1 (dedicated TIO ConversationSession + reset policy), or  
2. Keep Option 2 and mark TIO as **explicitly excluded** from Phase 3 completion criteria with this document as the authority.
