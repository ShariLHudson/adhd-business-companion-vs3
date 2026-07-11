# 154_CLEAR_MY_MIND_EXPERIENCE_ARCHITECTURE

# Spark Estate™
## Clear My Mind™ Experience Architecture

**Version:** 2  
**Status:** Architecture + background alignment  
**Date:** 2026-07-09  
**Primary location:** Treehouse Reflection Desk™  
**Background asset:** `/backgrounds/treehouse-possibility-reflection-desk-background.png`  
**Runtime section:** `brain-dump` · place id `clear-my-mind`

**Related:**
- [`docs/estate/clear-my-mind.md`](../../clear-my-mind.md)
- [`docs/protocols/CLEAR_MY_MIND_FLOW_PROTOCOL.md`](../../../protocols/CLEAR_MY_MIND_FLOW_PROTOCOL.md)
- [`lib/clearMyMind/`](../../../../lib/clearMyMind/)
- [153 Room Access Matrix](./153_SPARK_ESTATE_ROOM_ACCESS_MATRIX.md)

---

## Purpose

Clear My Mind™ is the primary intake experience for Spark Estate™.

It replaces separate Brain Dump and Parking Lot features.

Members never decide where information belongs.

They simply empty their mind.

Spark organizes everything.

---

## Trigger Phrases

Spark should recognize natural phrases such as:

- Brain dump
- Clear my mind
- Too much on my mind
- My brain is full
- I have too many ideas
- I'm overwhelmed
- I don't know where to start
- My thoughts are everywhere
- I keep thinking about...
- Don't let me forget...
- I'm stuck
- I'm frozen
- I have a million things to do

Spark responds:

"It sounds like Clear My Mind™ could help. Would you like to open it?"

---

## Primary Location

**Treehouse Reflection Desk™** (`house-possibility-reflection-desk`)

This becomes the Estate's thinking space.

**Page background (binding):**  
`public/backgrounds/treehouse-possibility-reflection-desk-background.png`

Runtime constant: `CLEAR_MY_MIND_REFLECTION_DESK_BG` in `lib/clearMyMind/conservatory.ts`  
(aliases: `CLEAR_MY_MIND_SUNROOM_BG`, `CLEAR_MY_MIND_CONSERVATORY_BG` — deprecated names kept for imports).

---

## Member Flow

1. Open Clear My Mind™
2. Enter unlimited thoughts (typing, paste, or voice)
3. Save
4. Spark organizes automatically
5. Member reviews, edits, filters, or acts

---

## Automatic Organization

Spark may classify items as:

- Do Now
- Schedule
- Waiting On
- Someday / Later
- Ideas
- Projects
- Research
- Questions
- Recognition Candidates

No manual sorting before capture.

---

## Every Item Can

- Edit
- Delete
- Merge
- Archive
- Complete
- Estimate Time
- Start Focus Timer
- Add Reminder
- Add to Calendar
- Add to Existing Project
- Create New Project
- Open Decision Compass
- Open Visual Thinking
- Send to Creative Studio
- Save to Evidence Vault™

---

## Universal Filters

- Today
- This Week
- Projects
- Ideas
- Waiting
- Someday
- Research
- Recognition
- Priority
- Time Required
- Quick Wins
- Recently Added
- Recently Updated
- Completed
- Tags
- Search

---

## Focus

Every task may start a Focus Session.

Timer choices:

5 · 10 · 15 · 25 · 45 · 60 · Custom

The timer is a universal utility available everywhere in Spark.

---

## Calendar

Any item can be:

- Scheduled
- Added to Google Calendar
- Added to Outlook
- Given a Spark reminder

---

## Recognition

If Spark detects an accomplishment, ask:

"This sounds worth preserving. Would you like to save it to your Evidence Vault™?"

Never save automatically.

---

## Spin the Wheel™

The wheel uses Clear My Mind™ items as its source.

Examples:

- Random task
- High impact
- Low energy
- Five-minute task
- Project work
- Waiting follow-up
- Quick win

The wheel is filtered, not random.

---

## Design Principles

- One capture experience
- Unlimited thoughts
- Lowest possible friction
- Spark organizes
- Member stays in control
- Everything remains searchable
- Everything remains editable
- Resume exactly where the member left off

Success means members leave with a clearer mind while Spark quietly connects their thoughts to the rest of the Estate.

---

## Implementation map (current)

| Concern | Path |
|---------|------|
| Open room | `openClearMyMindCore` → section `brain-dump` |
| Background | `lib/clearMyMind/conservatory.ts` · `CANONICAL_PLACE_BACKGROUNDS["clear-my-mind"]` |
| Workspace shell | `ClearMyMindConservatoryWorkspace.tsx` |
| Capture / organize | `lib/clearMyMindCapture.ts`, `lib/clearMyMindIntelligence.ts` |
| Routing / triggers | `lib/clearMyMindRouting.ts` |
