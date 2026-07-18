# 197 — Conversation Decision Pipeline

**Status:** Implemented via `processConversationTurn`

## Stage map

1. Receive turn  
2. Literal meaning (user text as stated)  
3. Priority event detection  
4. Load / validate state  
5. Select primary mode  
6. Update topic and focus  
7. Determine phase  
8. Route intelligence (experience draft / polish)  
9. Retrieve Gold Standard examples  
10. Select conversational move  
11. Build response plan  
12. Generate draft (`draftText` or `generateDraft`)  
13. Validation gates  
14. Regeneration (max 2) then grounded fallback  
15. Persist state + telemetry  
16. Deliver  

## Talk It Out path

Experience builds draft through RCI → CI → Grounded → Gold replace → TCAI → CQRI, then CIE runs stages 9–15 on the polished draft.
