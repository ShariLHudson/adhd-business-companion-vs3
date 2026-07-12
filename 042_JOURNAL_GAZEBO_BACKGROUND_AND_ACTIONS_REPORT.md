# 042 — Journal Gazebo Background and Actions Report

**Date:** 2026-07-11  
**Branch:** `deploy/companion-app-v3`  
**Commit:** `55802df` — `fix: restore Journal Gazebo background and actions`  
**Preview URL:** https://adhd-business-companion-vs3-9i2j23ol5-shari-hudsons-projects.vercel.app  
**Harness:** `/companion/login?previewTest=1` → Profile Estate → Journal Gazebo™

---

## Summary

Journal Gazebo™ only — pinned the companion experience to `/backgrounds/journal-desk-background.png`, restored click-through for sanctuary actions, and wired the desk journal to open directly.

---

## Files changed

| File | Change |
|------|--------|
| `components/journal-gazebo/JournalGazeboExperience.tsx` | Canonical desk plate only in companion; direct journal open; return-visit design-studio exit |
| `lib/journalGazebo/journalSceneRotation.ts` | Welcome/rest/workshop scenes use desk plate |
| `components/journal-gazebo/journal-gazebo.css` | Companion z-index 120; `contain` for full-bleed stack |
| `app/companion/companion.css` | `data-journal-gazebo-active` pointer-events; frame `:has(.journal-gazebo)` |
| `app/companion/CompanionPageClient.tsx` | Prevent duplicate `GrowthJournalRoomPanel` in guide-beside path |
| `lib/journalGazebo/journalSceneRotation.test.ts` | **New** |
| `lib/journalGazebo/journalGazeboCompanion.test.ts` | **New** |
| `lib/journalGazebo/journalGazeboMedia.test.ts` | Updated welcome-plate wording |

---

## Background — before / after

| | Before | After |
|---|--------|-------|
| Companion fallback | Seasonal gazebo plates (e.g. summer) via `gazeboSeasonBackgroundCandidates` | `[JOURNAL_GAZEBO_BACKGROUND_URL]` only → `/backgrounds/journal-desk-background.png` |
| Welcome scene plate | `/images/welcome-to-the-journal-gazebo.png` | `/backgrounds/journal-desk-background.png` |
| Stacking | `z-index: 18` — companion shell could intercept clicks | `z-index: 120` + shell `pointer-events: none` while gazebo active |

Welcome letter asset remains for preload; envelope/note UI unchanged on first visit.

---

## Button audit and wiring

| Visible label | Handler | Intended destination | Exists? | Why it failed before | Fix |
|---------------|---------|----------------------|---------|----------------------|-----|
| **Create New Journal** | `handleWelcomeCreateJournal` | `JournalGazeboDesignStudio` (`phase: "creating"`) | Yes | Clicks blocked by companion shell stacking | z-index + pointer-events |
| **Open My Journal** | `handleOpenMyJournal` → `openSelectedJournal` | Open book at saved place / picker | Yes | Same stacking issue | z-index + pointer-events |
| **Featured journal on desk** | was `handleJournalOpen` (multi-step camera) | Open selected journal | Yes | Required extra clicks; felt dead | Now `openSelectedJournal(featuredJournal)` |
| **Library shelf journal** | `openSelectedJournal` | Open book | Yes | Stacking | z-index + pointer-events |
| **Design studio ← back** | `goBack` → `onExit` | Return to gazebo desk | Yes | Return visits sent to `phase: "estate"` | Exit returns to `gazebo-rest` on return visits |
| **Home link** | `onBack` / `navigateToChatCore` | Companion home | Yes | — | Unchanged |
| **Estate guide anchor** | `setEstateGuideOpen(true)` | Guide flipbook | Yes | — | Unchanged |
| **Sound toggle** | `toggleSound` | Mute/unmute ambience | Yes | — | Unchanged |
| **Done** (writing) | `handleStepBackIntoGazebo` | Gazebo rest shelf | Yes | — | Unchanged |

No duplicate journal system created. `growthJournalStore` and existing entries preserved.

---

## Single panel confirmation

- Dedicated section: `activeSection === "growth-journal"` → one `GrowthJournalRoomPanel`
- Guide-beside path now returns `null` when section is already `growth-journal` (prevents dual mount)

---

## Tests

```
npx vitest run lib/journalGazebo/journalSceneRotation.test.ts lib/journalGazebo/journalGazeboMedia.test.ts lib/journalGazebo/journalGazeboCompanion.test.ts lib/estateMenu/experienceTestLauncherRouting.test.ts
```

- 4 files, 11 tests — **all passed**
- Pre-commit `companionBehaviorAudit` — passed

---

## Build

```
npm run build
```

- **Passed** — Next.js 16.2.7

---

## Asset note

Code references `/backgrounds/journal-desk-background.png` (via `JOURNAL_GAZEBO_BACKGROUND_URL`). Confirm the file is present in the deployment environment; it is the approved plate per estate registry.

---

## Out of scope (unchanged)

Growth Profile, My Estate, Discovery Key, Welcome Home, auth, other estate rooms, intelligence documents.

---

**Stop for review.**
