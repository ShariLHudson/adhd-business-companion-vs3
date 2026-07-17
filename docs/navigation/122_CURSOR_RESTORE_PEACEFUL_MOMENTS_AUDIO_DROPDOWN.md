# Cursor Implementation Prompt — Restore Peaceful Moments to Audio Dropdown Only

## Purpose

Restore Peaceful Moments to its approved simple experience.

Peaceful Moments is not a routing destination, guided calming workflow, room chooser, or scripted intervention.

It should contain only:

- the approved woodland pathway background
- one scrollable dropdown containing the available music audio tracks
- the normal audio playback controls required to play the selected track

## Approved Background

Use exactly:

```text
C:\Users\Shari\spark-ecosystem-v4\companion-app\public\backgrounds\woodland-pathway.png
```

In the web application, reference the public asset as:

```text
/backgrounds/woodland-pathway.png
```

Do not import the Windows filesystem path directly into runtime code.

## Background Requirements

- fill the Peaceful Moments experience
- preserve image proportions
- use `cover` unless existing approved behavior requires otherwise
- keep the central interaction area readable
- do not replace it with another nature image
- do not use a video
- do not add room signs, destination cards, or decorative clutter

## Approved Peaceful Moments Experience

Peaceful Moments should show:

1. the woodland pathway background
2. a clear Peaceful Moments title if the approved design includes one
3. one music-audio dropdown
4. playback controls for the selected audio

That is the entire primary experience.

Do not add:

- calming-location cards
- Lakeside Hammock
- Ocean Conservatory
- breathing scripts
- grounding scripts
- task-help prompts
- emotional-analysis questions
- recommendation cards
- multiple audio category panels
- print, save, journal, or reflection actions
- auto-started conversation
- automatic Shari message
- a second chooser after the dropdown

## Music Audio Dropdown

The dropdown must display the existing approved list of music audio tracks.

Use the authoritative audio registry or existing Peaceful Moments audio source.

Do not:

- invent track names
- duplicate tracks
- include non-music soundscapes unless they are explicitly part of the approved Peaceful Moments music list
- replace the list with room or destination names
- hard-code a second competing track registry

The dropdown must be vertically scrollable when the track list exceeds its visible height.

Required:

- a reasonable maximum height
- every track remains reachable
- final track is not clipped
- mouse-wheel scrolling works
- trackpad scrolling works
- keyboard navigation works
- touch scrolling works where supported
- visible selected state
- visible focus state
- no nested scroll trap
- dropdown remains above the background and other controls

## Dropdown Interaction

- clicking the dropdown opens the music list
- clicking a track selects it
- selected track name appears in the control
- selection does not automatically route anywhere
- selection does not close the entire Peaceful Moments window
- outside click closes only the dropdown
- Escape closes the dropdown first
- another Escape may close the containing Peaceful Moments window under the global dismissal contract

## Audio Playback

Preserve or connect the existing audio player.

Required controls where already supported:

- play
- pause
- current track
- volume
- stop or restart if part of the approved player

Required behavior:

- choosing a track prepares or plays the correct audio according to existing approved behavior
- only one Peaceful Moments track plays at a time
- changing tracks stops the prior track cleanly
- leaving Peaceful Moments follows existing global audio persistence rules
- no duplicate audio layers
- no autoplay before user interaction unless explicitly approved and browser-safe
- loading or playback errors are handled honestly

## Entry Behavior

Opening Peaceful Moments must:

- show the woodland pathway
- show the music dropdown
- not trigger a conversation
- not route to another estate room
- not show a canned overwhelm response
- not automatically choose a track
- not display multiple category screens

The user should be able to open Peaceful Moments, choose music, and listen.

## Clarify Relationship to Other Audio Experiences

Do not merge Peaceful Moments with unrelated audio experiences.

If the platform has:

- Peaceful Places
- Soundscapes
- Focus Audio
- Listening Room
- Studio

preserve their separate ownership.

Peaceful Moments owns only its approved music list and simple listening experience.

## Layout and Readability

Use a calm, minimal overlay or control area over the woodland background.

Required:

- large readable dropdown label
- large readable track names
- sufficient contrast
- dropdown does not cover the full image unnecessarily
- no large blank white panel
- no text wall
- no content clipped by fixed chrome
- Welcome Home return remains accessible

## State Ownership

Identify the authoritative owners for:

- Peaceful Moments destination
- background
- audio registry
- selected track
- playback state
- dropdown open state

Do not create duplicate stores if existing owners already exist.

Clear stale destination or script state that causes the wrong Peaceful Moments UI to appear.

## Required Automated Tests

### Background

- Peaceful Moments uses `/backgrounds/woodland-pathway.png`
- no legacy Peaceful Moments background overrides it
- background renders correctly

### Dropdown

- one music dropdown appears
- approved tracks populate it
- no duplicate dropdown appears
- list scrolls
- last track is reachable
- selected state works
- keyboard selection works
- outside click closes dropdown
- Escape closes dropdown first

### Playback

- selected track maps to correct audio
- play/pause works
- switching tracks stops the prior track
- only one track plays
- playback error does not break the room

### Simplification

- no destination cards
- no calming scripts
- no automatic Shari message
- no second chooser
- no unrelated Peaceful Places or Soundscapes content

### Navigation

- Peaceful Moments opens directly
- Welcome Home works
- global close behavior works
- no stale overlay reopens

## Live Verification

1. Open Peaceful Moments.
2. Confirm woodland pathway background.
3. Confirm exactly one music dropdown.
4. Open dropdown.
5. Scroll from first track to last.
6. Select a track.
7. Play and pause it.
8. Select another track.
9. Confirm previous audio stops.
10. Close dropdown with outside click.
11. Reopen and close with Escape.
12. Confirm no scripts, cards, or destination choices appear.
13. Return to Welcome Home.
14. Reopen Peaceful Moments and confirm stable behavior.

## Constraints

- do not redesign Peaceful Moments into a larger experience
- do not add calming scripts
- do not create new audio categories
- do not invent track names
- do not use the absolute Windows path in browser code
- do not alter unrelated audio destinations
- do not deploy production until authenticated preview passes

## Required Report

Return:

- exact files changed
- Peaceful Moments route owner
- background owner
- audio registry owner
- selected-track owner
- playback owner
- dropdown-scroll owner
- removed legacy UI or scripts
- automated tests
- local result
- preview URL
- screenshots
- remaining limitations
- deploy or do-not-deploy recommendation
