# Cursor Implementation Prompt — Fix Create Scrolling and Simplify Peaceful Places

## Purpose

Correct two specific usability failures:

1. Create content is clipped, difficult to scroll, and some items cannot be opened.
2. Peaceful Places is more complicated than intended and audio behavior is not safely opt-in.

Do not redesign unrelated areas. Do not create new engines.

## Create Requirements

Create must have one reliable vertical scroll owner.

The user must be able to:
- scroll from the very top to the very bottom
- see all Start, Browse, and Continue content
- open every visible card, item, button, menu, and link
- reach all bottom actions
- use mouse wheel, trackpad, keyboard, and touch scrolling

Audit:
- overflow
- height/min-height/max-height
- 100vh/100dvh usage
- flex parents
- nested scroll containers
- fixed elements
- z-index
- pointer-events
- transparent overlays
- backdrop layers
- outside-click handlers
- event propagation
- disabled states
- stale loading state
- room shell clipping
- top navigation overlap
- bottom safe-area overlap

Identify the exact cause of every unclickable element. Do not solve this with blanket z-index increases.

Every visible interactive element must:
- receive pointer events
- have visible hover and focus states
- work with Enter or Space where appropriate
- open the correct destination or workflow
- not sit under an invisible overlay

Add tests for:
- root scroll owner
- no clipped lower controls
- Start opens
- Browse opens
- Continue opens
- all visible buttons receive pointer events
- keyboard activation
- no invisible overlay
- Escape
- outside-click
- Welcome Home reachability

## Peaceful Places Requirements

Peaceful Places should contain only:
- the approved woodland background
- one simple scrollable music dropdown
- clear playback controls

Use:
`public/backgrounds/woodland-pathway.png`

Do not add:
- guided prompts
- breathing exercises
- journaling
- reflection questions
- session flows
- multiple activity cards
- extra menus
- automatic audio
- unrelated wellness content

The dropdown should be labeled clearly, such as **Choose Music**.

Preferred flow:
1. user opens the dropdown
2. user selects a track
3. selected track appears
4. user presses Play
5. audio begins

Opening the room, opening the dropdown, highlighting a track, or selecting a track must not start audio automatically.

Visible controls must include:
- Play
- Pause
- Stop
- Sound Off / Mute
- Volume
- current track

The user must always have a clear way to turn sound off.

## Global Sound Rule

No audio may start automatically when:
- the user logs in
- Welcome Home opens
- Peaceful Places opens
- another room opens
- the dropdown opens
- the page refreshes
- the route changes
- a saved preference loads
- a background image or video loads

Sound begins only after a deliberate user action.

Use the existing global audio owner. Ensure one authoritative:
`stopAllAudio()`

It must stop:
- Peaceful Places music
- soundscapes
- ambient tracks
- focus audio
- room audio
- hidden audio elements
- video audio

Do not create a second audio engine.

When leaving Peaceful Places:
- stop room audio unless an approved visible persistent player remains
- never allow hidden sound to continue with no controls
- never orphan an audio element

Default:
- autoplay disabled
- audio off until Play
- background video muted
- refresh does not resume sound
- returning to the room does not resume sound automatically

## Required Live Verification

### Create
1. Open Welcome Home → My Work → Create.
2. Scroll top to bottom.
3. Open Start.
4. Return and open Browse.
5. Return and open Continue.
6. Open every visible card and item.
7. Confirm no lower content is clipped.
8. Confirm no dead click areas.
9. Confirm Welcome Home, Escape, and outside-click work.

### Peaceful Places
1. Open Peaceful Places.
2. Confirm no sound plays.
3. Confirm only the approved simple experience appears.
4. Open and scroll the music dropdown.
5. Select a track.
6. Confirm sound does not begin until Play.
7. Test Play, Pause, Stop, Sound Off/Mute, and Volume.
8. Leave the room.
9. Confirm no hidden sound continues.
10. Refresh.
11. Confirm sound does not restart.

## Required Report

Return:
- exact root cause of Create scrolling failure
- exact root cause of Create items not opening
- exact files changed
- Create scroll owner
- Create routing owner
- Peaceful Places owner
- dropdown owner
- audio owner
- stopAllAudio owner
- automated test results
- preview URL
- unrelated WIP in preview
- remaining limitations
- deploy or do-not-deploy recommendation

Do not deploy production. Stop after authenticated preview and report results.
