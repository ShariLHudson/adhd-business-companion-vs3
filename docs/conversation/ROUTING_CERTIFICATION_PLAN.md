# Conversation Routing Certification Plan

## Not certified until all are true

- [ ] Every production conversational entry path uses `routeConversationTurn` (or a documented approved exception)
- [ ] Every sticky experience implements / maps to `ConversationScopeOwner`
- [ ] All CPC async companion-chat responses use `validateResponseEnvelope`
- [ ] Canonical registries shared (destinations, Chamber, Create, hard-nav)
- [ ] Conflict matrix automated tests pass
- [ ] Generated paraphrase tests pass for navigation + interrupts
- [ ] Keyboard and voice routing match (same text)
- [ ] New Day and Continue Previous are distinct
- [ ] No known stale-context defect remains (Board after New Day)
- [ ] Founder browser journeys pass (Board→New Day→Music Room, Chamber interrupt, Create interrupt, Project interrupt, delayed response)

## Founder browser journeys (representative)

1. **A — Board → New Day → Music Room** (original failure)  
2. **B — Saved Board history resume**  
3. **C — New Day general chat**  
4. **D — Nav overrides** Create / Project / Chamber  
5. **E — Delayed response discarded** after navigation / New Day  
6. **F — Ambiguous place** → one clarification, ≤4 options  
7. **G — Cancel** while awaiting → scope released, work preserved  

## Current status (2026-07-23)

| Gate | Status |
|------|--------|
| Arbiter + types | Done |
| CPC wired to arbiter + envelope | Done (primary path) |
| Conflict + paraphrase tests | Done (initial matrix) |
| Talk It Out / Create composer exceptions | Documented |
| Full scope migrations (chatScope kinds on activate) | Remaining |
| Founder browser full D–E re-cert | Remaining — see prior PARTIAL cert |

## Next founder validation step

Re-run Journeys A–E on build containing the conversationRouter commits, with emphasis on:

1. Create **companion chat** awaiting → `go to the music room`  
2. Chamber Strategy Intelligence active → `go to the music room` (destination must change)  
3. Create estate composer: note whether still exception or fixed  
