# Talk It Out — Authenticated Preview Live Results

**Date:** 2026-07-18  
**Environment:** `http://localhost:3000/companion?previewTest=1` (signed-in local workspace)  
**Branch tip at test:** `ad9f0db8` (includes Shari Response Engine `015f41eb`)  
**Tester:** Cursor browser smoke

## Verdict

**PASS** for authenticated multi-turn smoke (banned phrases + topic continuity + pause/resume).

Do not treat this as production deploy approval — Vercel production was not exercised in this pass; local authenticated workspace was.

## Smoke script (from 206)

| Step | Input / action | Result |
|------|----------------|--------|
| 1 | Open Talk It Out (Welcome Home → Take a Moment → Talk It Out) | Opening present: “What would you like to talk through?” |
| 2 | “I need to decide whether to hire a marketing assistant.” | Reply stayed on hiring; asked what makes them consider it now |
| 3 | “What do you mean?” | Clarification repair; stayed on hiring topic |
| 4 | “Cost.” | Grounded on cost + hiring; one follow-up question |
| 5 | “Nothing underneath.” | Correction path; returned to hiring framing |
| 6 | Pause and Continue Later | Pause ack shown |
| 7 | Refresh → reopen Talk It Out | History restored; re-entry: “We were talking about hiring a marketing assistant…” |
| 8 | Banned phrase scan | None of the three permanent failures |

## Banned phrases (must never appear)

| Phrase | Seen? |
|--------|-------|
| Take your time with that | **No** |
| quieter question underneath | **No** |
| something around does | **No** |

Also scanned for AI tells (`It sounds like`, `Great question`) — **not present** in delivered turns.

## Representative transcript (abridged)

1. **User:** I need to decide whether to hire a marketing assistant.  
   **Shari:** You're still deciding whether hiring a marketing assistant makes sense. What is making you consider it now?

2. **User:** What do you mean?  
   **Shari:** I did not explain that clearly. You are deciding whether hiring a marketing assistant makes sense. What I meant to ask was what is making you consider hiring a marketing assistant now. What is making you consider it now?

3. **User:** Cost.  
   **Shari:** Cost is sitting right next to the hiring question. What result would make the spend feel justified?

4. **User:** Nothing underneath.  
   **Shari:** You're right — I was looking at the wrong thing. You're wondering whether hiring a marketing assistant makes sense. What is making you consider it now?

5. **After pause + refresh + reopen:**  
   History intact + re-entry naming hiring / “nothing underneath.”

## Local automated companion

`lib/talkItOut/permanentFailureRegressions.test.ts` — **10/10 passed** in the same session (engine path used by the UI).

## Notes / follow-ups (non-blocking for this smoke)

1. Clarification turn (step 3) still contained **two** question marks — repair path may bypass the single-question Shari Response Engine reshape. Soft quality follow-up.
2. Workspace sometimes stuck on “Loading your workspace…” until a hard navigation with `?previewTest=1`; hydration warning on `SparkLoadingState` appeared in Next.js overlay.
3. Latest Vercel preview (`ovnx6pq01`) was Ready but this pass used local authenticated session so the newest engine code was guaranteed.

## Overall

- **Authenticated TIO multi-turn smoke:** PASS  
- **Production deploy:** still **No** until you explicitly choose to ship
