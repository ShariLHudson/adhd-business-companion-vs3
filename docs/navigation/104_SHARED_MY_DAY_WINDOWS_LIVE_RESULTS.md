# Live Results — Shared My Day Windows (103–105)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

## Owners

| Concern | Owner |
|---------|--------|
| Shared-window owner (Plan/Adapt) | `components/companion/PlanAdaptSharedWindow.tsx` · section `adapt-plan-my-day` |
| Shared-window owner (Reminders/Rhythms) | `components/companion/RemindersRhythmsEntrancePanel.tsx` · section `reminders-rhythms` |
| Active-child selection | CPC `planAdaptSharedChild` / `remindersRhythmsSharedChild` + in-window `activeChild` state |
| Plan content | `PlanDaySimpleAdd` / `PlanDaySimpleList` inside PlanAdaptSharedWindow |
| Adapt content | `AdaptMyDayCheckIn` (energy + motivation separate) |
| Reminders content | `RemindersRoomPanel` `embedded` |
| Rhythms content | `RhythmsRoomPanel` `embedded` |
| How Do I… (Plan/Adapt) | `plan-adapt-shared-how-do-i` in PlanAdaptSharedWindow |
| How Do I… (Reminders/Rhythms) | `reminders-rhythms-shared-how-do-i` in RemindersRhythmsEntrancePanel |
| Scroll container | `plan-my-day-morning-room__scroll` (both shells) |
| Explanation copy | `lib/myDaySharedWindows/copy.ts` |
| Menu wiring | `EstateRoomExperienceMenu` + `welcomeHomeNavigationStructure` |

## Automated

| Suite | Result |
|-------|--------|
| `sharedMyDayWindows.test.ts` | PASS |
| Welcome Home dropdown / focused submenu | PASS |
| Reminders / Rhythms destination contracts | PASS |

## Preview

- Preview commit: _(filled after commit)_
- Authenticated preview URL: _(filled after deploy)_
- Overall: **unit_verified** · live authenticated **Pending** (`104` checklist)
- Deploy recommendation: **Do not deploy production**
