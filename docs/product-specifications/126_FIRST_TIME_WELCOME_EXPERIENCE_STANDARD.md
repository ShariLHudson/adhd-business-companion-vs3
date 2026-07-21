# 126 — First-Time Welcome Experience Standard

**Status:** Binding Spark Estate™ Constitutional Rule  
**Date:** 2026-07-21  
**Series:** Product Specifications (after 112; constitutions remain 113–117)  
**Runtime:** `lib/firstLoginWelcome/` · `components/companion/FirstLoginWelcomeOverlay.tsx`  
**Current-state map:** [126_FIRST_TIME_WELCOME_EXPERIENCE_CURRENT_STATE_MAP.md](./126_FIRST_TIME_WELCOME_EXPERIENCE_CURRENT_STATE_MAP.md)  
**Related:** [113 Product Constitution](../constitution/113_SPARK_ESTATE_PRODUCT_CONSTITUTION.md) · [114 Shari](../constitution/114_SHARI_COMPANION_CONSTITUTION.md) · navigation docs 119–121

---

## Purpose

The opening Welcome Experience introduces new users to Spark Estate and establishes their first emotional connection with the platform.

It is a welcome.

It is not a splash screen.

It is not branding.

It is not onboarding that repeats every session.

The Welcome Experience is intended to create one memorable first impression and should never become repetitive.

---

## Core Rule

The complete Welcome Experience (opening video, narration, music, and first-time introduction) shall play only once for each user.

Once the Welcome Experience has been completed or intentionally skipped, it must never automatically appear again.

---

## First Login Only

The Welcome Experience is shown only when:

- a brand-new user signs into Spark Estate for the very first time, and
- no previous completion record exists.

This state is permanent unless explicitly reset by the user.

---

## Never Automatically Repeat

The Welcome Experience must never automatically replay:

- on future logins
- after updates
- after version upgrades
- after browser refresh
- after device changes
- after cache clearing
- after subscription changes
- after restoring backups
- after long absences
- after profile edits
- after reinstalling the application
- after importing data

Users should always return directly to their normal Spark Estate experience.

---

## Completion Tracking

Spark Estate shall permanently record:

- Welcome Experience completed
- Welcome Experience skipped
- completion timestamp
- platform version shown

Once recorded, the system shall suppress future automatic playback.

**Authoritative store:** authenticated account metadata (Supabase `user_metadata`), not browser-only storage. Local cache may hydrate; it is never the sole source of truth.

**Skip ≡ completion for automatic display.** Skipping permanently suppresses future automatic playback.

---

## Skip Behavior

Users may skip the Welcome Experience at any time.

Skipping permanently counts as completion for automatic display purposes.

The platform should respect the user's decision.

---

## Manual Replay

Users may replay the Welcome Experience at any time from:

- Settings
- Help Center
- Welcome Experience
- or another clearly labeled location

Manual replay is always optional.

Manual replay must never reset onboarding status or clear the account completion record.

---

## Future Welcome Updates

Future platform updates must not replace the user's completed Welcome Experience.

If Spark Estate introduces a major new capability, it may present:

- a short feature announcement
- an optional guided tour
- a "What's New" experience

These are separate experiences.

They must never replace or replay the original Welcome Experience.

---

## Multiple Devices

Completion status should synchronize across all devices.

If a user completes the Welcome Experience on one device, it should not appear automatically on another.

---

## Accessibility

Users must always be able to:

- skip immediately
- pause
- replay later
- enable captions
- adjust volume
- mute audio
- disable animations where supported

Accessibility preferences should be respected during playback.

---

## User Experience Principles

The Welcome Experience should feel:

- warm
- personal
- calm
- encouraging
- unhurried
- inviting

It should never feel:

- mandatory
- repetitive
- interruptive
- promotional
- or like advertising.

---

## Shari's Role

Shari personally welcomes the user only during the first Welcome Experience.

After that, Shari greets returning users naturally based on their current context rather than replaying the original introduction.

Returning users should feel recognized, not reintroduced.

---

## Platform Principle

The first Welcome Experience is a milestone, not a recurring event.

It should become a positive memory of joining Spark Estate—not something users feel compelled to dismiss every time they sign in.

---

## Certification Requirements

Before release, verify that:

1. The Welcome Experience automatically appears exactly once for every new user.
2. Skipping permanently suppresses future automatic playback.
3. Completing playback permanently suppresses future automatic playback.
4. Returning users are taken directly into Spark Estate.
5. The Welcome Experience can only be replayed through an explicit user action.
6. Completion status synchronizes across supported devices.
7. Platform updates and new versions never trigger automatic replay.
8. No regression allows the Welcome Experience to reappear after the initial completion or skip.

Runtime checklist: `FIRST_TIME_WELCOME_CERTIFICATION_CHECKLIST` in `lib/firstLoginWelcome/welcomeExperienceConstitution.ts`.

---

## Constitutional Rule

The Welcome Experience is a one-time introduction that marks the beginning of the user's relationship with Spark Estate. It must never become a recurring interruption.

---

## Separation from other “welcome” systems

| System | Role |
|--------|------|
| **First-Time Welcome Experience (this rule)** | Account-once introduction |
| Welcome Home silent cinematic | Visual arrival; may replay from Settings without clearing account completion |
| Daily Companion Opening / Today’s Welcome Card | Day-scoped guidance — not the first introduction |
| Arrival Intelligence | Contextual greetings for returning members |
| Phase 1 conversational onboarding | Relationship onboarding — separate from the Welcome Experience gate |
