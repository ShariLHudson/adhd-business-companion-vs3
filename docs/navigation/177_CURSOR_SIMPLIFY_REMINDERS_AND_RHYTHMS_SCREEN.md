# 177 — Simplify Reminders & Rhythms Screen

**Goal:** Reduce cognitive load on the shared Reminders & Rhythms window — tabs instead of dual choice cards, collapsed education, template dropdowns, embedded panels without duplicate settings.

## Already done (before this pass)

- `lib/myDaySharedWindows/copy.ts` — title "Reminders & Rhythms", short explanation, tabs types, `REMINDERS_RHYTHMS_TAB_STORAGE_KEY`, etc.
- `lib/reminders/reminderForm.ts` — `partitionReminders` returns `today`
- `ReminderRhythmRoomChrome` — `RhythmStartExamples` dropdown; `RhythmsAreFlexibleSection` collapsed "How rhythms work"
- `RhythmsRoomPanel` imports `snoozeRhythm` but RhythmRow UI not yet updated; `ReminderStartExamples` still card stack

## Required changes

### 1. ReminderRhythmRoomChrome.tsx

Convert `ReminderStartExamples` to same dropdown pattern as `RhythmStartExamples` (`testid` `reminders-template-dropdown`, "Use This Template").

### 2. RhythmsRoomPanel.tsx RhythmRow

- **Primary when active:** Complete, Snooze (`snoozeRhythm(id, 15)`), Skip
- **More menu:** Pause, Reschedule (edit), Stop
- **When paused:** Resume + More (Reschedule, Stop)
- Keep existing data-testids: `rhythms-complete`, `rhythms-skip`, `rhythms-pause`, `rhythms-more`, `rhythms-edit`, `rhythms-delete`; add `rhythms-snooze`

### 3. RhythmsRoomPanel RhythmListSection

Add optional `collapsedByDefault?: boolean` and `hideEmptyCta?: boolean`. When `collapsedByDefault`, wrap in `<details>` closed by default with summary = title. When `hideEmptyCta`, don't show Create a Rhythm in empty state.

### 4. RhythmsRoomPanel body when `embedded`

- Hide `NotificationSoundPreferences` entirely
- Hide Today list section (Today lives in entrance tabs)
- Active list visible; Paused uses `collapsedByDefault` + `hideEmptyCta`
- Keep one Create a Rhythm (`show-add-form`) — remove duplicate empty CTAs via `hideEmptyCta` on lists
- Keep `RhythmsAreFlexibleSection` + `RhythmStartExamples`
- Don't show standalone title "Rhythms" h2 if parent tabs provide context — subtle h2 ok
- For non-embedded keep sounds at bottom

### 5. RemindersRoomPanel when embedded

- Hide `NotificationSoundPreferences` and `RemindersNotificationSettings` (bottom settings)
- Hide `ReminderActionsExplained`
- Primary CTA label "Create a Reminder" (`testid` `reminders-show-add-form`)
- Completed section wrap in `<details>` collapsed by default
- Keep `ReminderStartExamples` (dropdown after chrome update)
- No rhythm education text

### 6. Rewrite RemindersRhythmsEntrancePanel.tsx

- Previous Screen button (keep)
- Title `REMINDERS_RHYTHMS_WINDOW_TITLE`
- Short `REMINDER_VS_RHYTHM_DIFFERENCE`
- Collapsed details "What's the difference?" with `REMINDER_VS_RHYTHM_BULLETS` (`testid` `reminders-rhythms-whats-difference`)
- Compact link "Notification Sounds" opens sounds view (`testid` `reminders-rhythms-open-sounds`)
- Tabs Today | Reminders | Rhythms (`role=tablist`, keyboard arrow keys optional, `aria-selected`)
- Persist tab in sessionStorage `REMINDERS_RHYTHMS_TAB_STORAGE_KEY`
- Map `initialChild`: reminders→reminders tab, rhythms→rhythms tab, null→today (or stored)
- **Today tab:** list today's reminders (`partitionReminders`) + today's rhythms (`partitionRhythmsForLists`); empty = `REMINDERS_RHYTHMS_TODAY_EMPTY` + button to switch to reminders tab "Create a Reminder or Rhythm"
- **Reminders tab:** `<RemindersRoomPanel embedded />`
- **Rhythms tab:** `<RhythmsRoomPanel embedded />`
- **Sounds view:** `NotificationSoundPreferences` with `compactAbout` + back to tabs
- Remove old dual choice cards and always-open bullets; optional keep How Do I collapsed as secondary
- `data-testid` `reminders-rhythms-entrance`, `data-shared-window=true`, `data-active-tab={tab}`
- `data-testid` `reminders-rhythms-tabs`

### 7. NotificationSoundPreferences.tsx

Add optional prop `compactAbout?: boolean` — when true, remove per-family Learn more; one shared SettingsHelpAccordion "About notification sounds" at bottom. Entrance sounds view passes `compactAbout`.

### 8. Tests

- `lib/remindersVsRhythms/remindersVsRhythms.test.ts` — tabs not entrance-reminder-card
- `lib/myDaySharedWindows/sharedMyDayWindows.test.ts` — update `REMINDER_VS_RHYTHM_DIFFERENCE` regex and entrance expectations
- Add `lib/remindersVsRhythms/simplifyScreen177.test.ts` covering: tabs, collapsed how rhythms work, template dropdown, no NotificationSoundPreferences in embedded rhythms source, paused collapsed, Create a Rhythm count ≤1 in embedded body structure

### 9. Verification

```bash
npx vitest run lib/remindersVsRhythms lib/myDaySharedWindows lib/reminders/reminderForm.test.ts --reporter=dot
```

**Do not deploy. Do not git commit.**
