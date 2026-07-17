# Live Results — Two Dropdown Menu Restore (098 / 099)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

## Automated

| Suite | Result |
|-------|--------|
| `welcomeHomeTwoDropdownMenus.test.ts` | PASS |
| `welcomeHomeNavigationStructure.test.ts` | PASS |
| `welcomeHomeFocusedSubmenu.test.tsx` | PASS |

## Dropdown owners

| Dropdown | Structure owner | UI owner |
|----------|-----------------|----------|
| Plan My Day / Adapt My Day | `welcomeHomeNavigationStructure.ts` (`adapt-plan-my-day`) | `EstateRoomExperienceMenu` expanded dropdown |
| Reminders / Rhythms | `welcomeHomeNavigationStructure.ts` (`reminders-rhythms`) | `EstateRoomExperienceMenu` expanded dropdown |

## Child route owners

| Child | Opener |
|-------|--------|
| Plan My Day | `openPlanMyDayCore` → `plan-my-day` / `PlanMyDayPanel` |
| Adapt My Day | `openAdaptMyDayCore` → `energy` / `AdjustMyDayPanel` |
| Reminders | `openRemindersCore` → `reminders` / `RemindersRoomPanel` |
| Rhythms | `openRhythmsCore` → `rhythms` / `RhythmsRoomPanel` |

## Scroll-container owner

- Menu panel: `.estate-room-experience-menu__panel-scroll` (`estate-room-experience-menu.css`)
- Nested dropdown children: `.estate-room-experience-menu__dropdown-children` (same file)

## Preview

- Preview commit: `c4f72539`
- Authenticated preview URL: https://adhd-business-companion-vs3-eumw0c6kz-shari-hudsons-projects.vercel.app
- Operator: founder sign-in required (Vercel SSO)
- Overall: **unit_verified** · live authenticated **Pending** (`099` checklist)
- Deploy recommendation: **Do not deploy production**
