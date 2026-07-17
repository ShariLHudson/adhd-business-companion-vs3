# Cursor Implementation Prompt — Fix Create Scrolling/Clickability and Make All Sound Opt-In

## Purpose

Fix two current usability failures:

1. The Create destination does not scroll correctly and some controls cannot be clicked.
2. Sound starts or remains active without clear user control.

Treat these as:
- a focused Create layout/input fix
- a global audio behavior contract

## Create: Required Behavior

The entire Create destination must be vertically scrollable.

Required:
- all entrance choices reachable
- Browse and Continue content reachable
- How Do I… reachable
- every visible control clickable
- no controls hidden behind fixed headers or footers
- no invisible overlay or pointer blocker
- no click-through to the background
- mouse, trackpad, keyboard, and touch scrolling
- no unnecessary nested scroll traps

Audit:
- z-index
- pointer-events
- fixed layers
- transparent overlays
- outside-click handlers
- event propagation
- disabled-state logic
- full-bleed room host
- backdrop ownership
- Daily Spark suppression layer
- Welcome Home control

Identify the exact cause of every unclickable control. Do not solve this by blindly increasing z-index values.

Use one authoritative scroll container for Create, accounting for top navigation, bottom safe areas, mobile viewport height, and fixed controls.

## Sound: Global Governing Rule

No sound may begin unless the user explicitly chooses to start it.

No automatic audio on:
- login
- Welcome Home arrival
- room entry
- navigation
- hover
- Spark Estate Guide
- Peaceful Moments
- Focus Audio
- Listening Room
- soundscapes
- ambient loops
- music rooms
- background video

Selecting a room or track is not consent to play audio.

## Required Audio Controls

Whenever audio is active, the user must have a visible way to:
- Play
- Pause
- Stop
- Mute / Unmute
- adjust Volume
- see the current audio
- Stop All Sound

Create or identify one authoritative:

```ts
stopAllAudio()
```

It must stop every active audio source, including hidden or orphaned players.

## Default Audio Preference

Use an account/user preference such as:

```ts
type AudioPreference = {
  autoplayAllowed: false;
  globalMuted: boolean;
  volume: number;
};
```

Default behavior:
- autoplay disabled
- no audio until explicit Play
- background videos muted
- refresh or relogin does not restart sound

Do not rely on browser autoplay blocking as the safeguard.

## Audio Lifecycle

- selecting a track prepares it but does not play it
- starting another source must not create duplicate audio layers
- leaving a room must not orphan hidden sound
- hidden components must not continue playback
- Stop All Sound must recover from stuck audio
- route changes must keep global active-audio state accurate

## Required Automated Tests

### Create
- full vertical scrolling
- all primary choices clickable
- How Do I… clickable
- Browse and Continue reachable
- no invisible pointer blocker
- keyboard activation works
- Welcome Home remains clickable
- Escape and outside-click work correctly

### Audio
- no sound on login
- no sound on Welcome Home arrival
- no sound on destination open
- no sound on Peaceful Moments open
- no sound on track selection alone
- Play starts audio
- Pause pauses
- Stop stops
- Mute works
- Stop All Sound stops all sources
- background video starts muted
- refresh does not restart sound
- hidden players do not continue
- starting a second source does not duplicate playback

## Constraints

- do not patch only Peaceful Moments
- do not make sound opt-out
- do not hide the audio controls
- do not rely on browser autoplay blocking
- do not use blanket z-index escalation
- do not deploy production until authenticated preview passes

## Required Report

Return:
- exact root cause of Create scroll failure
- exact root cause of unclickable controls
- exact files changed
- Create scroll owner
- pointer-event owner
- overlay/backdrop owner
- global audio owner
- mute/volume owner
- stopAllAudio owner
- preference persistence owner
- automated tests
- local result
- preview URL
- remaining limitations
- deploy or do-not-deploy recommendation
