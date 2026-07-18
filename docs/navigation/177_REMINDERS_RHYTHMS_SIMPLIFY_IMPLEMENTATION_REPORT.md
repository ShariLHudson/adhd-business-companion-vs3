# Reminders & Rhythms Simplification (177)

**Status:** Implementation complete · **Do not deploy** until authenticated preview walkthrough.

## Summary

Replaced dual Reminder/Rhythm choice cards with a **Today | Reminders | Rhythms** tabbed entrance. Education is collapsed by default; notification sounds moved to a dedicated compact view. Embedded room panels drop duplicate settings and empty-state CTAs.

## Files changed

| File | Change |
|------|--------|
| `components/companion/ReminderRhythmRoomChrome.tsx` | `ReminderStartExamples` → template dropdown |
| `components/companion/RhythmsRoomPanel.tsx` | RhythmRow actions (Snooze in primary, Pause in More); `RhythmListSection` collapse/hide CTA; embedded layout |
| `components/companion/RemindersRoomPanel.tsx` | Embedded: hide settings/actions; "Create a Reminder"; completed collapsed |
| `components/companion/RemindersRhythmsEntrancePanel.tsx` | Full rewrite — tabs, Today view, sounds view |
| `components/companion/NotificationSoundPreferences.tsx` | `compactAbout` prop |
| `lib/remindersVsRhythms/remindersVsRhythms.test.ts` | Tab expectations |
| `lib/myDaySharedWindows/sharedMyDayWindows.test.ts` | Copy regex + entrance tab expectations |
| `lib/remindersVsRhythms/simplifyScreen177.test.ts` | New source-contract tests |
| `docs/navigation/177_CURSOR_SIMPLIFY_REMINDERS_AND_RHYTHMS_SCREEN.md` | Prompt archive |
| `docs/navigation/177_REMINDERS_RHYTHMS_SIMPLIFY_IMPLEMENTATION_REPORT.md` | This report |

## UX — before / after

| | Before | After |
|--|--------|--------|
| Entry | Two large choice cards (Reminder / Rhythm) | Tabs: Today · Reminders · Rhythms |
| Difference copy | Always-visible bullet list | One-line cue + collapsed "What's the difference?" |
| Templates | Reminder card stack | Dropdown + "Use This Template" (both) |
| Sounds | Bottom of each room panel | Link → compact sounds view with shared About |
| Today | Duplicated in rhythms panel | Single Today tab (reminders + rhythms due today) |
| Rhythm row | Complete, Skip, Pause on one row | Active: Complete · Snooze · Skip · More; Paused: Resume · More |
| Embedded CTAs | Multiple "Create a Rhythm" in empty lists | One primary create button per tab |

## Test command

```bash
npx vitest run lib/remindersVsRhythms lib/myDaySharedWindows lib/reminders/reminderForm.test.ts --reporter=dot
```

**Result:** 4 files · **27 passed** · 0 failed

## Manual preview checklist

1. Open Reminders & Rhythms from Welcome Home → My Day
2. Today tab empty state → "Create a Reminder or Rhythm" switches to Reminders tab
3. Reminders tab → dropdown template, no bottom notification settings
4. Rhythms tab → "How rhythms work" collapsed; Paused section collapsed; one Create CTA
5. Notification Sounds link → compact about accordion → back to tabs
6. Tab persists on refresh within session (`sessionStorage`)
7. Menu shortcuts: Open Reminders / Open Rhythms land on correct tab

## Deploy recommendation

**Do not deploy production** until founder reviews authenticated preview for tabs, Today aggregation, and rhythm snooze/reschedule actions.
