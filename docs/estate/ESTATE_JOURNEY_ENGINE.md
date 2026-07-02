# Estate Journey Engine™

The Spark Estate™ is one continuous journey. The **Estate Journey Engine™** is the central state manager for where the member is, what they were doing, and what comes next — without ever making them feel like they are starting over.

## What it tracks

| Track | Purpose |
|-------|---------|
| Current / previous room | Where they are now and where they came from |
| Room history | Compact path (e.g. Welcome Home → Momentum Institute™ → Creative Studio™) |
| Current conversation | Fresh chat sessions vs preserved journey |
| Current artifact | Active build-in-progress |
| Paused work | Workshops, funnels, lessons, decisions — nothing lost |
| Learning memory | Knowledge Cards, lessons, apprenticeships, labs, challenges, Make It Mine™, reflections |
| Current goal / focus / mood / energy | Quiet context for Shari |
| Sessions | Per-visit rooms, learning, projects, challenges, ideas |

## Storage

Journey state lives on `EstateMemory.journeyEngine` in session storage (`spark:estate:memory:v1`), merged never overwritten.

**Module:** `lib/estateJourneyEngine/`

## Key APIs

- `onEstateJourneyRoomTransition` — wired from `recordEstateRoomTransition`
- `onEstateJourneyConversationTurn` — wired from `recordEstateConversationTurn`
- `pauseJourneyWork` / `captureActiveArtifactAsPausedWork` — paused work on room leave
- `recordJourneyLearning` — learning + profile touches (Cabinet, Journal, Portfolio…)
- `buildEstateJourneyReturnGreeting` — "Welcome back. Last time we were building your workshop…"
- `beginEstateJourneyNewDay` — fresh conversation; preserves journey (wired to **Start New Day Conversation**)
- `buildJourneySessionSummary` — optional end-of-session summary
- `estateJourneyIntelligenceHint` — room recommendations from sustained study (e.g. Marketing → Creative Studio™)

## Return experience

When paused work or an active task exists, Shari can welcome the member back and offer to continue — one invitation, no pressure.

## New day

**Start New Day Conversation** ends the current journey session, starts a new `conversationId` and session, increments `newDayCount`, and keeps room history, paused work, learning, and memories intact.

## Intelligence

Topic study duration feeds gentle room suggestions (never menus). Example: three weeks of Marketing study may surface applying learning in Creative Studio™.

## Tests

`lib/estateJourneyEngine/estateJourneyEngine.test.ts`
