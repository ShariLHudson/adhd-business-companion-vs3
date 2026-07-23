# Routing Conflict Matrix

**Automated tests:** `lib/conversationRouter/conversationRouter.conflictMatrix.test.ts`

## Legend

| Symbol | Meaning |
|--------|---------|
| NAV | Navigate + suspend prior scope |
| OWN | Route to active scope owner |
| CLR | Clear / cancel owning scope |
| GEN | Fall through to global companion / API |
| CLAR | Clarification / soft invite |
| — | Not applicable / same as GEN |

## Matrix (expected primary outcome)

| Intent ↓ \\ Context → | Global | Board awaiting | Chamber active | Create active | Project active | Destination chat | Reflective | New Day | In-flight response |
|-----------------------|--------|----------------|----------------|---------------|----------------|------------------|------------|---------|--------------------|
| Direct navigation | NAV | NAV | NAV | NAV | NAV | NAV | NAV | NAV | NAV + supersede |
| Cancel / never mind | CLR | CLR | CLR | CLR | CLR | CLR | CLR | GEN | supersede |
| Start Create | GEN/NAV | NAV?* | NAV?* | OWN/GEN | GEN | GEN | GEN | GEN | supersede |
| Open Project | GEN/NAV | NAV?* | NAV?* | GEN | OWN/GEN | GEN | GEN | GEN | supersede |
| Resume | GEN | — | — | OWN | OWN | — | — | GEN** | — |
| Answer pending | GEN | OWN | OWN | OWN | OWN | OWN | OWN | GEN | — |
| General question | GEN | GEN† | OWN/GEN | OWN/GEN | OWN/GEN | GEN | GEN | GEN | supersede |
| Ask specialist | CLAR | CLAR | OWN | CLAR | CLAR | CLAR | CLAR | CLAR | supersede |
| Find saved work | GEN | GEN† | GEN | GEN | GEN | GEN | GEN | GEN | supersede |

\* Explicit create/open with navigation verb → navigation wins.  
\*\* Resume after New Day only via explicit Continue — never auto.  
† Board awaiting must **not** capture general/find/nav; sticky draft alone is insufficient.

## Invariants (property tests)

1. Navigation intent never claimed by Board awaiting-answer.  
2. New Day never reuses an old active Board intake scope.  
3. Response with wrong `daySessionId` never renders.  
4. Unknown destinations never invent routes.  
5. One user turn → at most one primary navigate effect.  
6. Cancel does not delete saved Board discussions.  
7. Keyboard and voice (same text) produce the same routing decision.
