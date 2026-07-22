# Spark Estate — Reflection Navigation Routing Fix (Implementation Report)

**Prompt (archived verbatim):** `docs/navigation/SPARK_ESTATE_REFLECTION_NAVIGATION_ROUTING_FIX_PROMPT.md`
**Branch:** `deploy/companion-app-v3`
**Scope:** Narrow, targeted edits only — no `git add .`, no commits made by the agent.

## Mission recap

Journal, Evidence Vault, and Hall of Accomplishments were falling back to Clear
My Mind instead of opening their own experience. Clear My Mind must stay out
of the Reflection menu and keep its existing approved location under Focus
(Today / quick-support).

## Root cause (two independent bugs, same symptom)

The Welcome Home **menu definition** was already correct — `Reflection` has
always listed only Journal, Evidence Vault, and Hall of Accomplishments, and
Clear My Mind has always lived under the `take-a-moment` (Focus) category in
`lib/estate/welcomeHomeNavigationStructure.ts`. The bug was in **runtime
navigation state**, not the menu registry:

1. **Menu-click / universal-access path.** `openGrowthDestinationCore()` and
   `enterEvidenceVaultRoomCore()` in `CompanionPageClient.tsx` never called
   `leaveClearMyMindIfNavigatingAway()` before changing `activeSection`
   (12+ other openers — Plan My Day, Reminders/Rhythms, Talk It Out, etc. —
   already did this). Clear My Mind Mode (`lib/clearMyMind/clearMyMindMode.ts`)
   is a **sticky, module-level flag** that only turns off on an explicit exit.
   A `useEffect` keyed on `activeSection` (~line 3885) treats "mode still
   active but section changed" as a *stale unmount* and silently reopens
   Clear My Mind:

   ```205:3896:app/companion/CompanionPageClient.tsx
   useEffect(() => {
     if (activeSection === "brain-dump") return;
     if (isClearMyMindModeActive()) {
       openClearMyMindCore({ silent: true });
       return;
     }
     setEstateConservatoryEngaged(false);
   }, [activeSection]);
   ```

   Result: once a member had ever opened Clear My Mind, clicking Journal /
   Evidence Vault / Hall of Accomplishments from the menu would briefly set
   the new section, then get silently snapped back to Clear My Mind.

2. **Voice / chat command path.** `runDirectEstateRoomNavigation()` (the
   function behind "Take me to my Journal", "Open the Evidence Vault", "Show
   me the Hall of Achievements", Welcome Home recommendations, and
   saved-item/recent-activity links) *did* call `leaveClearMyMindIfNavigatingAway()`
   for non-Clear-My-Mind destinations — but a second, older guard immediately
   below it re-checked the **stale** `activeSectionRef.current` value (which
   hadn't been updated yet for the new destination) and re-opened Clear My
   Mind for **any** room that wasn't already special-cased earlier in the
   function (Clear My Mind, Cartographer's Studio, Boardroom). Journal,
   Evidence Vault, and Hall of Accomplishments have no such special case, so
   they always hit this catch-all and got redirected to Clear My Mind whenever
   the member was currently viewing it. This is the literal "shared fallback
   logic" the audit asked to find and remove.

A secondary latent bug: `growth-portfolio` (Hall of Accomplishments) was
missing from `DEDICATED_ESTATE_ROOM_PANEL_SECTIONS`, so a stale direct-visit
overlay could show frosted chat over the Hall panel instead of
`GrowthPortfolioPanel` in some overlay states.

## Fixes applied

| # | File | Change |
|---|------|--------|
| 1 | `app/companion/CompanionPageClient.tsx` — `openGrowthDestinationCore()` | Added `leaveClearMyMindIfNavigatingAway();` immediately after the Clear My Mind early-return, before the Evidence Vault delegation and Journal/Hall setup. |
| 2 | `app/companion/CompanionPageClient.tsx` — `enterEvidenceVaultRoomCore()` | Added `leaveClearMyMindIfNavigatingAway();` as the first line, so every direct caller (menu, universal access, Chamber offer, saved-item link) is covered, not only calls routed through `openGrowthDestinationCore`. |
| 3 | `app/companion/CompanionPageClient.tsx` — `runDirectEstateRoomNavigation()` | Narrowed the stale "refuse room hop while Clear My Mind Mode active" guard to `&& !isDedicatedEstateRoomPanelSection(command.section)`. Explicit, named requests for dedicated-panel rooms (Journal, Evidence Vault, Hall of Accomplishments, and every other dedicated panel) now proceed normally; only ambiguous/ambient "Wander"-style requests into a frosted-chat-overlay room are still refused while Clear My Mind is active, matching the guard's original stated intent. |
| 4 | `lib/estate/directEstateVisit.ts` | Added `"growth-portfolio"` to `DEDICATED_ESTATE_ROOM_PANEL_SECTIONS` so Hall of Accomplishments is never covered by the direct-visit chat/CMM overlay. |
| 5 | `lib/estate/reflectionDestinations.ts` (new) | Canonical Reflection registry — `journal`, `evidence-vault`, `hall-of-accomplishments` only, each with its own `section`/`componentKey`/description. Clear My Mind is structurally excluded (`CLEAR_MY_MIND_EXCLUDED_FROM_REFLECTION`). |
| 6 | `lib/estate/reflectionDestinations.test.ts` (new) | Registry contract tests — matches Welcome Home Reflection ids, no duplicates, every destination maps to a dedicated panel section, Clear My Mind never present. |
| 7 | `lib/estate/reflectionClearMyMindFallback.test.ts` (new) | Source-contract regression tests (same style as `ecosystemRouting096.test.ts`) proving the menu-click openers and the voice/chat navigation function both exit Clear My Mind for Reflection destinations, and that the Welcome Home Reflection category never lists `clear-my-mind`. |

No changes were made to `welcomeHomeNavigationStructure.ts` (menu order,
labels, and Reflection/Focus split were already correct) and no changes were
made anywhere near Clear My Mind's own menu entry — it stays exactly where it
was, under Focus (`take-a-moment`) in Welcome Home.

## Canonical Reflection registry

`lib/estate/reflectionDestinations.ts`

```ts
export const REFLECTION_DESTINATIONS: readonly ReflectionDestination[] = [
  { id: "journal", name: "Journal", route: "/reflection/journal", section: "growth-journal", componentKey: "journal", description: "...", isActive: true },
  { id: "evidence-vault", name: "Evidence Vault", route: "/reflection/evidence-vault", section: "evidence-bank", componentKey: "evidence-vault", description: "...", isActive: true },
  { id: "hall-of-accomplishments", name: "Hall of Accomplishments", route: "/reflection/hall-of-achievements", section: "growth-portfolio", componentKey: "hall-of-accomplishments", description: "...", isActive: true },
];
```

`route` is a stable deep-link identifier reserved for future URL-based
navigation — Spark Estate today navigates by `AppSection` (`section` field),
not literal Next.js routes, so this registry stays aligned with the existing
non-URL architecture rather than inventing new routing.

## Clear My Mind — confirmed unchanged location

- Welcome Home menu: `take-a-moment` ("Focus") category, alongside Talk It
  Out, Parking Lot, Breathe, Focus Library (`lib/estate/welcomeHomeNavigationStructure.ts`).
- Opener: `openClearMyMindCore()` → `openStandaloneFocusSectionCore("brain-dump")` → `BrainDumpPanel` (unchanged).
- Hard nav: `lib/hardNavigationCommands.ts` still routes `"Clear My Mind"` only.

## Components wired (no rebuilds)

- Journal → `GrowthJournalRoomPanel` → `JournalGazeboExperience` (existing).
- Evidence Vault → `EvidenceVaultRoomPanel` (existing door/key entrance ritual preserved).
- Hall of Accomplishments → `GrowthPortfolioPanel` (existing).
- Clear My Mind → `BrainDumpPanel` → `ClearMyMindSession` (existing, untouched).

Existing saved data is untouched — none of these fixes change storage,
persistence, or empty-state copy; they only fix which section/component ends
up mounted after navigation.

## Tests

New:
- `lib/estate/reflectionDestinations.test.ts` — 8 tests, all passing.
- `lib/estate/reflectionClearMyMindFallback.test.ts` — 6 tests, all passing.

Regression suite re-run (no new failures introduced by this change):
`ecosystemRouting096.test.ts`, `welcomeHomeNavigationStructure.test.ts`,
`sparkEstateTopNavigationAndProfileMenu.test.ts`,
`evidenceVaultHallAccess.test.ts`, `estateNavigationCanon.test.ts`,
`clearMyMindMode.test.ts`, `welcomeHomeActiveDestination.test.ts`,
`welcomeHomeFocusedSubmenu.test.tsx`, `experienceTestLauncherRouting.test.ts`,
`hardNavigationCommands.test.ts` — **97 passed, 2 pre-existing failures**
unrelated to this fix (confirmed by inspection, not caused by these edits):
  - `clearMyMindMode.test.ts` — expects a specific Clear My Mind welcome-line
    string (`lib/clearMyMindCopy.ts`) that was already out of sync with other
    in-progress WIP copy changes in the dirty tree.
  - `experienceTestLauncherRouting.test.ts` — expects a `GrowthProfileRoomPanel`
    import that no longer exists in `CompanionPageClient.tsx` (already removed
    by other in-progress WIP work before this task started).

`tsc --noEmit` was run against the full project; it reports many pre-existing
errors across the (very large, currently dirty) tree, none of which are in
the files touched by this fix or near the edited line ranges.

## UI verification steps (manual)

1. Open Clear My Mind from Focus (Today), capture a thought, then click
   **Journal** from the Reflection menu (or Welcome Home) — Journal / Journal
   Gazebo should open, not Clear My Mind.
2. Repeat for **Evidence Vault** and **Hall of Accomplishments**.
3. While still inside Clear My Mind, type: `Take me to my Journal`,
   `Open the Evidence Vault`, `Show me the Hall of Achievements` — each should
   open its own experience immediately, not reopen Clear My Mind.
4. Type `I need to Clear My Mind` from any Reflection destination — Clear My
   Mind should open normally.
5. Confirm the Reflection menu (Welcome Home → Reflection) lists only
   Journal, Evidence Vault, Hall of Accomplishments — no Clear My Mind entry,
   no duplicates.
6. Confirm Clear My Mind still appears once, under Focus/Today — not under
   Reflection.
7. Refresh the browser and use browser Back from each Reflection destination
   — section should not fall back to Clear My Mind.
8. Confirm existing Journal entries / Evidence Vault items / Hall of
   Accomplishments items are all still present (no data loss).

## Suggested commit message

```
fix: stop Journal/Evidence Vault/Hall of Accomplishments falling back to Clear My Mind

- Exit Clear My Mind Mode before opening Journal or Evidence Vault from the
  menu / universal access (openGrowthDestinationCore, enterEvidenceVaultRoomCore)
- Narrow the Clear-My-Mind-active room-hop guard in runDirectEstateRoomNavigation
  to skip dedicated-panel rooms, so explicit voice/chat navigation to Journal,
  Evidence Vault, and Hall of Accomplishments is never redirected
- Add growth-portfolio to DEDICATED_ESTATE_ROOM_PANEL_SECTIONS
- Add canonical lib/estate/reflectionDestinations.ts registry (Clear My Mind excluded)
- Add regression tests for both the menu-click and voice-command paths
```

## Gaps / follow-ups (not in scope for this fix)

- `runDirectEstateRoomNavigation`'s guard still refuses ambient/"Wander"-style
  requests into non-dedicated (frosted chat overlay) rooms while Clear My
  Mind is active — this is intentional and preserved from the original
  design; only the Reflection (and other dedicated-panel) destinations were
  exempted.
- Two pre-existing, unrelated test failures noted above are not fixed here —
  they belong to other in-progress WIP changes already in the dirty tree
  (Clear My Mind welcome copy, `GrowthProfileRoomPanel` removal) and are
  outside this task's scope per the "narrow edits only" constraint.
- `hardNavigationCommands.ts` still does not have dedicated fast-path entries
  for Journal / Evidence Vault / Hall of Accomplishments (only Clear My Mind
  has a hard-nav shortcut there). Voice commands for these three already
  work correctly via `resolveEstatePlace` → `runDirectEstateRoomNavigation`
  (verified via `canonicalEstatePlaces.ts` aliases), so this is a possible
  future latency optimization, not a correctness gap.
