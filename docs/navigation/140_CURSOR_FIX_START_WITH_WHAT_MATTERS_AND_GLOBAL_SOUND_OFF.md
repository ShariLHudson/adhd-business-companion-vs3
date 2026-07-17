# Cursor Implementation Prompt — Fix “Start With What Matters Most” and Add an Obvious Global Sound-Off Control

## Purpose

Correct two experience problems:

1. The Welcome Home choice **Start With What Matters Most** currently routes directly to Plan My Day, which makes it overlap with other choices and does not match its promise.
2. Users cannot easily find where to stop or turn off sound.

These are global experience corrections. Do not solve them with one-off wording or room-specific controls.

---

# Part 1 — Clarify the Three Welcome Home Choices

The three choices must have clearly different jobs.

## Choice 1 — Start With What Matters Most

### Intended Role

This is the fastest path into one meaningful action.

It is for a user who does not want to review previous work, plan the whole day, or browse several options.

It should answer:

> What is the one thing worth moving forward right now?

### It Must Not

- automatically open the full Plan My Day workflow
- show a large menu of suggestions
- reopen previous work
- ask the user to prioritize a long task list
- duplicate Help Me Choose
- duplicate Plan My Day

### Required Experience

Open a lightweight **Meaningful Start** experience.

Use known context where available, such as:

- current commitments
- active projects
- urgent obligations
- deadlines
- calendar
- recently mentioned work
- important but stalled work
- user goals
- available time
- energy, when known

Present one recommended starting point.

Example:

> Based on what is active right now, I think the most meaningful next step is:
>
> **Review the Create preview and note what still cannot be opened.**
>
> We can keep this small and work through it together.

Provide only a few actions:

- **Start This**
- **Show Me Another**
- **Plan More of My Day**
- **Help Me Choose**

### When Context Is Insufficient

Ask one simple question:

> What feels most important today: finishing something, handling something urgent, or making progress on something meaningful?

Do not open a full intake flow.

### Start This Behavior

When the user chooses **Start This**:

- create or identify one concrete next action
- make it small enough to begin
- keep Shari in the conversation
- optionally place it in Focus View
- do not automatically create a Project, Reminder, Rhythm, or full day plan

### Plan More of My Day

This is the explicit route into Plan My Day.

The user chooses it intentionally.

---

## Choice 2 — Plan or Adapt My Day

This remains the complete daily planning destination.

It owns:

- task capture
- available time
- energy
- motivation
- planning style
- sequence
- timeline
- adaptation

It should not be triggered automatically from Choice 1.

---

## Choice 3 — Help Me Choose

This is the broader decision-support route.

It may:

- ask what kind of help is needed
- compare several reasonable paths
- suggest destinations
- help distinguish between Create, Projects, Strategy, Plan My Day, Chamber, Board, or other areas

It should not duplicate the single-action focus of Choice 1.

---

# Choice Separation Contract

| Choice | Primary Job | Number of Options |
|---|---|---:|
| Start With What Matters Most | Recommend one meaningful next action | One primary recommendation |
| Plan or Adapt My Day | Build or revise the day | Full planning workflow |
| Help Me Choose | Help decide among possible directions | Small set of paths |

The choices must remain distinct in copy, routing, state, and tests.

---

# Part 2 — Add an Obvious Global Sound-Off Control

## Current Problem

Users cannot easily find how to turn off sound.

A sound control hidden inside a room, settings panel, or dropdown is insufficient.

## Required Global Control

Add a persistent, clearly visible audio control in the global Spark Estate interface.

Preferred location:

- top navigation or another globally consistent header location
- available in every room and destination
- not hidden behind multiple menus

Use a familiar speaker icon plus a readable label or accessible tooltip.

Required states:

- **Sound Off**
- **Sound On**
- **Sound Playing**

When sound is active, the control must become visually obvious.

## One-Click Sound Off

Clicking **Sound Off** must immediately:

- stop every currently playing audio source
- mute global audio
- update the visible state
- prevent hidden playback
- retain the user's sound-off preference

Do not require the user to:

- find the originating room
- reopen Peaceful Places
- locate a track
- open multiple settings panels
- lower volume manually

## Global Audio Menu

Clicking the global audio control may open a small, simple panel containing:

- current audio name, when applicable
- Play / Resume
- Pause
- Stop
- Sound Off / Mute
- Volume
- **Stop All Sound**
- optional link to Audio Settings

Keep this panel compact.

## Default Rule

Sound remains opt-in.

No sound begins from:

- login
- Welcome Home
- room entry
- destination entry
- track selection
- saved preference restoration
- refresh
- route changes
- ambient backgrounds
- background videos

The user must deliberately press Play or another unambiguous start-audio control.

## Stop All Sound Owner

Use one authoritative global action:

```ts
stopAllAudio()
```

It must stop and clean up:

- Peaceful Places music
- soundscapes
- focus audio
- ambient room audio
- Listening Room audio
- videos with audio
- DOM audio/video elements
- registered programmatic players
- hidden or orphaned sources

Do not create a competing audio manager.

## Persistence

Persist:

- sound off / muted state
- user-set volume

Do not persist or restore active playback.

On login or refresh:

- no audio plays
- the visible control accurately shows Sound Off or the saved mute state

## Leaving an Audio Destination

If no approved persistent player is visibly active:

- stop room-specific audio

Never allow audio to continue invisibly.

---

# Required Ownership Report

Return authoritative owners for:

- Welcome Home choice definitions
- Welcome Home choice routing
- Meaningful Start state
- meaningful-action recommendation
- Plan My Day route
- Help Me Choose route
- global audio UI
- active audio state
- mute state
- volume
- stopAllAudio
- audio preference persistence
- Shari visible response

Do not duplicate ownership.

---

# Required Automated Tests

## Welcome Home Choices

- Start With What Matters Most does not automatically open Plan My Day
- Start With What Matters Most does not resume previous work
- it produces one meaningful recommendation
- Show Me Another returns another appropriate recommendation
- Plan More of My Day intentionally opens Plan My Day
- Help Me Choose opens its existing decision-support route
- all three choices remain behaviorally distinct
- stale workflow state is not resumed

## Global Sound

- global sound control appears in every primary destination
- control is keyboard accessible
- Sound Off stops all active audio
- Stop All Sound stops all registered and DOM audio/video
- mute state updates visibly
- sound-off preference persists
- playback does not persist
- refresh produces silence
- login produces silence
- track selection alone produces silence
- no hidden audio continues after navigation

---

# Authenticated Live Verification

## Start With What Matters Most

1. Open Welcome Home.
2. Select Start With What Matters Most.
3. Confirm Plan My Day does not open automatically.
4. Confirm previous work does not open.
5. Confirm one meaningful next action is recommended.
6. Select Show Me Another.
7. Confirm a different relevant action appears.
8. Select Plan More of My Day.
9. Confirm Plan My Day opens intentionally.
10. Return and select Help Me Choose.
11. Confirm it opens broader decision support rather than the Meaningful Start experience.

## Sound

1. Log in and confirm silence.
2. Confirm the global sound control is visible.
3. Start audio deliberately in Peaceful Places.
4. Navigate elsewhere.
5. Confirm the global control indicates active sound, if persistent playback is approved.
6. Click Sound Off.
7. Confirm all sound stops immediately.
8. Start another audio source.
9. Click Stop All Sound.
10. Confirm no hidden source continues.
11. Refresh.
12. Confirm silence.
13. Confirm Sound Off remains easy to find.

---

# Constraints

- do not turn Choice 1 into another planning workflow
- do not duplicate Help Me Choose
- do not reopen old work from Choice 1
- do not create another audio engine
- do not hide Sound Off inside Settings only
- do not autoplay
- do not deploy production
- stop after authenticated preview and report results

---

# Required Implementation Report

Return:

- exact root cause of Choice 1 routing to Plan My Day
- exact files changed
- final copy for all three choices
- choice-routing owners
- Meaningful Start owner
- recommendation logic owner
- global audio UI owner
- stopAllAudio owner
- automated test results
- preview URL
- unrelated WIP included in preview
- remaining limitations
- deploy or do-not-deploy recommendation
