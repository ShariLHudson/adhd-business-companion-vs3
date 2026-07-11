# Estate Room Transition — Implementation Report

**Date:** July 2026  
**Scope:** Global fix for blank blue/gray/black screens between Spark Estate rooms

---

## Root cause

Room navigation was **instant unmount → mount** with no persistent scene layer:

1. `CompanionPageClient` swaps `activeSection` synchronously; the previous room JSX (and its `EstateRoomFullBleedBackground`) unmounts immediately.
2. Immersive mode suppresses `CompanionBackground` and used `#0e1210` as the root fallback — a near-black flash when the next `<img>` had not decoded.
3. `EstateRoomFullBleedBackground` rendered a single async `<img>` with no crossfade; gaps showed the empty root.
4. `preloadRoomBackground` was fire-and-forget and did not block or hold the outgoing plate.
5. `ambient-crossfade` is declared on canonical places but was not implemented at runtime.

Evidence Vault compounded this: `SparkEstateShell` and `EstateCollectionRoomPanel` each mounted their own full-bleed stack when switching arrival modes.

---

## Solution

### 1. Global persistent scene layer

| File | Role |
|------|------|
| `lib/estate/estateSceneTransition.ts` | Transition state machine: preload → hold outgoing → crossfade → commit |
| `components/companion/estate/EstateSceneTransitionHost.tsx` | Fixed viewport layer mounted once in layout |
| `app/companion/estate-scene-transition.css` | Crossfade keyframes + warm fallback gradient |

Mounted in `app/companion/layout.tsx` inside `HomesteadSceneProvider` — survives all room unmounts.

### 2. Preload before transition

| File | Change |
|------|--------|
| `lib/roomBackgroundPreload.ts` | Added `awaitRoomBackgroundReady()` — resolves when image decodes |
| `lib/estateMemory/estateMemoryContinuity.ts` | `recordEstateRoomTransition` calls `prepareEstateSceneTransitionFireAndForget` for every room change |

### 3. Per-room crossfade (defense in depth)

| File | Change |
|------|--------|
| `components/companion/estate/EstateRoomFullBleedBackground.tsx` | Dual-layer stack: previous plate stays visible until incoming `onLoad`, then 620ms crossfade |

### 4. Fallback color fix

| File | Change |
|------|--------|
| `app/companion/estate-immersive.css` | Replaced `#0e1210` with warm estate gradient (`#2a2420` → `#12100e`) |
| `app/companion/layout.tsx` | Import `estate-arrival.css` (was missing) |

### 5. Preparing message

After ~480ms of loading, the global host shows **"Preparing the room…"** over the **still-visible** outgoing plate — never on a blank screen.

---

## Transition behavior (canonical)

```
User navigates
  → recordEstateRoomTransition
  → prepareEstateSceneTransition (preload destination)
  → outgoing plate remains at opacity 1 (global host + local crossfade stack)
  → destination decodes
  → 620ms crossfade
  → commit active plate
```

---

## Files changed

| File | Action |
|------|--------|
| `lib/estate/estateSceneTransition.ts` | **Created** |
| `lib/estate/estateSceneTransition.test.ts` | **Created** |
| `components/companion/estate/EstateSceneTransitionHost.tsx` | **Created** |
| `app/companion/estate-scene-transition.css` | **Created** |
| `lib/roomBackgroundPreload.ts` | Extended |
| `lib/estateMemory/estateMemoryContinuity.ts` | Wired transition prep |
| `components/companion/estate/EstateRoomFullBleedBackground.tsx` | Crossfade stack |
| `app/companion/layout.tsx` | Host + arrival CSS |
| `app/companion/estate-immersive.css` | Warm fallback |

**No `loading.tsx` files exist** in companion-app — none were added; route loading was not the primary cause.

---

## Paths to verify manually

| Journey | Expected |
|---------|----------|
| Welcome Home → Evidence Vault | Crossfade into vault plate; no blue/gray flash |
| Evidence Vault entrance → interior | Same plate family; no blank between overlay and panel |
| Welcome Home → Cartographer's Studio | Outgoing home scene holds until studio plate loads |
| Clear My Mind → Back to Chat | Return crossfade; chat gradient only after plate fades |
| Breathe overlay → close | Workspace never unmounted — no full-page flash |
| Estate nav → another room | `recordEstateRoomTransition` triggers global crossfade |
| Destination Gallery → room | Preload + crossfade via same pipeline |

---

## Remaining gaps (future)

- **EstateArrivalHost** dark veil can still run over an empty scene if arrival fires before first plate — delay arrival until `phase === 'ready'`.
- **CinematicBackground / video rooms** — crossfade not yet applied to ocean conservatory / butterfly house video paths.
- **Evidence Vault door ritual** — entrance key animation not built; spec is in recognition docs.
- **Dedupe backgrounds** — SparkEstateShell and collection shells still mount local plates (now crossfading); could read from global host only in a later phase.

---

## Blank screens remaining?

- **Initial app load** (`CompanionPageLoader`) — beige “Loading your workspace…” — unchanged; first paint only.
- **Welcome Home first launch curtain** — intentional `#0a0a0a` — separate ritual.
- **Suspense `fallback={null}`** on sign-in query — rare, null not a color flash.

Room-to-room navigation should no longer expose blue, gray, or black empty screens between photographic plates.
