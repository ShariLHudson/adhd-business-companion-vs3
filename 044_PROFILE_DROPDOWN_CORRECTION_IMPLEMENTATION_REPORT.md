# 044 — Profile Dropdown Correction Implementation Report

**Repository:** `spark-ecosystem-v4/companion-app`  
**Branch:** `deploy/companion-app-v3`  
**Implementation date:** 2026-07-11  
**Prior audit:** `043_PROFILE_REPOSITORY_AUDIT_REPORT.md`  
**Scope:** SH menu → Profile dropdown only

---

## 1. Executive Summary

The SH initials menu **Profile** dropdown now exposes only the two approved destinations:

1. **My Business Estate™**
2. **People I Help™**

Selecting **My Business Estate™** opens a dedicated `MyBusinessEstatePanel` (read-only business snapshot) instead of the generic **My Estate** chat shell (`SparkEstateShell`). Selecting **People I Help™** opens `PeopleIHelpPanel`, an adapter over the existing `IdealClientBuilder` / `companion-ideal-clients-v1` data — no duplicate audience storage.

A minimal `ProfileDestination` resolver (`my-business-estate` | `people-i-help`) centralizes Profile overlay routing. Growth Profile, Welcome Home destinations, and Settings were not moved or redesigned.

---

## 2. Scope Followed

| Area | Touched? |
|------|----------|
| SH → Profile dropdown | **Yes** |
| My Business Estate™ destination | **Yes** (minimal panel) |
| People I Help™ destination | **Yes** (adapter) |
| Welcome Home | **No** |
| Experiences / room menu | **No** |
| Settings screen / categories | **No** |
| Journal Gazebo™ | **No** |
| Evidence Vault™ | **No** |
| Hall of Accomplishments™ | **No** |
| Estate Cartographer™ | **No** |
| Chamber | **No** |
| Portfolio (retired user-facing) | **No** |
| Growth Profile deletion | **No** (isolated legacy) |
| Supabase / data migration | **No** |

---

## 3. Product Corrections Applied

- Profile dropdown is a **nested group** (like Conversations) with two child items only.
- **My Estate** chat-only shell no longer mounts when `overlay === "profile"`.
- User-facing label **People I Help™** in Profile dropdown and `PeopleIHelpPanel` header (internal `client-avatars` / Audience Profile paths unchanged).
- Default Profile selection: **My Business Estate™** when `my-profile` is chosen.
- **Growth Profile** does not appear in the Profile dropdown and is not the Profile default.

---

## 4. Original Profile Dropdown Findings

From audit `043` and pre-change code:

| Finding | Detail |
|---------|--------|
| SH menu component | `GlobalEstateMenu.tsx` via `EstateTopRightChrome` in `CompanionPageClient.tsx` |
| Menu data | `lib/estateMenu/menuConfig.ts` |
| Pre-change Profile action | Single flat **Profile** item → `my-profile` → `openProfileEstateRoomFromMenu("my-estate")` → `SparkEstateShell` |
| Pre-change destinations in dropdown | Profile (flat), Settings, Conversations group, Logout |
| Hidden routable IDs | `growth-profile`, `evidence-vault`, `portfolio`, `journal`, etc. |

---

## 5. My Business Estate™ Findings

| Item | Status |
|------|--------|
| Dedicated UI before this cycle | **Missing** — only chat shell + `BusinessProfilePanel` wizard elsewhere |
| Reuse | New `MyBusinessEstatePanel` + `MyBusinessEstateRoomShell` |
| Data read | `getBusinessProfile()`, `getPrefs()` from `companionStore` |
| Editing / scores / intake | **Not built** this cycle |
| Registry label | `my-estate` room trademark updated to **My Business Estate™** (display only) |

---

## 6. People I Help™ / Client Avatar Findings

| Item | Detail |
|------|--------|
| Existing implementation | `IdealClientBuilder` + `client-avatars` workspace section |
| Storage key | `companion-ideal-clients-v1` (unchanged) |
| Adapter | `PeopleIHelpPanel` wraps `IdealClientBuilder` with Profile chrome + back action |
| Duplicate storage | **None created** |
| Workspace title | `client-avatars` section title unchanged (**Audience Profile**) — People I Help™ shown only in Profile dropdown and `PeopleIHelpPanel` header |

---

## 7. Growth Profile Handling

- `GrowthProfileRoomPanel` remains for legacy / test launcher (`overlay === "growth-profile"`).
- Not listed in Profile dropdown flat items or nested children.
- Verification in `verifySparkEstateTopNavigationAndProfileMenu()` excludes `growth-profile` from visible menu items.

---

## 8. My Estate Shell Handling

- `lib/estate/estateShellRouting.ts`: `profileEstateRoomUsesDedicatedPanel("my-estate")` → **true**
- `CompanionPageClient.tsx`: `estateProfilePrimary` (`overlay === "profile"`) mounts `MyBusinessEstatePanel`, not `SparkEstateShell`
- Test launcher `openProfileEstateRoomFromMenu("my-estate")` still sets `overlay("profile")` but now lands on the dedicated panel

---

## 9. Files Changed

| File | Change |
|------|--------|
| `app/companion/CompanionPageClient.tsx` | Profile resolver wiring, overlays, mount panels, `goBack` for people-i-help |
| `lib/estateMenu/menuConfig.ts` | Profile nested group with two children |
| `lib/estate/sparkEstateTopNavigationAndProfileMenu.ts` | Profile menu constants + verification |
| `lib/estate/estateShellRouting.ts` | my-estate uses dedicated panel |
| `lib/estate/estateShellRouting.test.ts` | Updated shell guard expectations |
| `lib/estate/estateRoomRegistry.ts` | my-estate display name → My Business Estate™ |
| `lib/workspaceMode.ts` | *(reverted — out of scope)* |
| `lib/estateMenu/welcomeHomeMenuVerification.test.ts` | Profile routing contracts |
| `lib/estateMenu/experienceTestLauncherRouting.test.ts` | MyBusinessEstatePanel mount contract |

---

## 10. Files Created

| File | Purpose |
|------|---------|
| `lib/profile/profileDestination.ts` | `ProfileDestination` type + navigation resolver |
| `lib/profile/profileDestination.test.ts` | Unit tests |
| `lib/profile/profileDropdownCorrection.test.ts` | Dropdown structure + mount contracts |
| `components/companion/MyBusinessEstatePanel.tsx` | Minimal My Business Estate™ landing |
| `components/companion/MyBusinessEstateRoomShell.tsx` | Estate plate background shell |
| `components/companion/PeopleIHelpPanel.tsx` | People I Help™ adapter panel |
| `app/companion/my-business-estate.css` | Panel styles |

---

## 11. Profile Routing Changes

```typescript
type ProfileDestination = "my-business-estate" | "people-i-help";

// openProfileDestinationCore(destination)
//   → "my-business-estate" → setOverlay("profile") → MyBusinessEstatePanel
//   → "people-i-help"     → setOverlay("people-i-help") → PeopleIHelpPanel

// handleEstateMenuAction
//   my-profile      → openProfileDestinationCore("my-business-estate")
//   people-i-help   → openProfileDestinationCore("people-i-help")
```

Only one Profile overlay is active at a time (`profile` XOR `people-i-help` for Profile cycle destinations).

---

## 12. Data Reused

| Source | Used for |
|--------|----------|
| `companion-business-profile-v1` via `getBusinessProfile()` | Business Snapshot text |
| `companion-prefs-v1` via `getPrefs()` | Member name in snapshot |
| `companion-ideal-clients-v1` via `IdealClientBuilder` | People I Help™ content |

No new localStorage keys. No Supabase tables. No migrations.

---

## 13. Back and Close Behavior

| From | Action | Result |
|------|--------|--------|
| People I Help™ | **← Back to Profile** button | `setOverlay("profile")` |
| People I Help™ | Top chrome **Back** (`goBack`) | Returns to Profile overlay (`my-business-estate`) |
| My Business Estate™ | Top chrome **Back** (`goBack`) | Clears overlay; conversation preserved |
| In-panel link | My Business Estate → People I Help | `openProfileDestinationCore("people-i-help")` |

Does not route to Welcome Home, Growth Profile, or My Estate chat shell on back.

---

## 14. Tests Performed

**Profile-targeted (all pass):**

```bash
npx vitest run lib/profile lib/estateMenu/welcomeHomeMenuVerification.test.ts \
  lib/estateMenu/experienceTestLauncherRouting.test.ts lib/estate/estateShellRouting.test.ts \
  lib/estateMenu/estateMenu.test.ts lib/estate/sparkEstateTopNavigationAndProfileMenu.test.ts
```

**Full suite:** `npm test` — many pre-existing failures unrelated to Profile (companion behavior audit, visual routing, etc.). No new Profile test failures.

**Lint:** `npm run lint` — pre-existing repo-wide ESLint issues; no new errors in Profile-added files.

**Production build:** `npm run build` — **pass**.

---

## 15. Regression Checks

Verified by tests and code inspection (not manually re-tested in browser this session):

| SH area | Expected unchanged |
|---------|-------------------|
| Conversations group | New Chat, New Day Chat |
| Settings | Opens settings overlay |
| Experiences / room menu | No menuConfig changes |
| Welcome Home destinations | Not in Profile dropdown |
| Logout | Still signs out |

---

## 16. Build Results

| Command | Result |
|---------|--------|
| `npm run build` | **Success** (Next.js 16 production build) |
| Profile vitest subset | **35/35 pass** |
| `npx tsc --noEmit` | Pre-existing errors elsewhere; Profile TS issues fixed (`MyBusinessEstateRoomShell` preset, menu group type guards) |

---

## 17. Screenshots Created

Automated browser screenshots were **not captured** in this implementation session (no Playwright harness). Founder should capture on preview:

| View | Suggested path |
|------|----------------|
| SH menu (after) | `docs/screenshots/profile-correction/after-01-sh-menu.png` |
| Profile dropdown (after) | `docs/screenshots/profile-correction/after-02-profile-dropdown.png` |
| My Business Estate™ (after) | `docs/screenshots/profile-correction/after-03-my-business-estate.png` |
| People I Help™ (after) | `docs/screenshots/profile-correction/after-04-people-i-help.png` |

Before screenshots were not taken pre-implementation; compare against audit `043` descriptions or prior preview if needed.

---

## 18. Known Limitations

- My Business Estate™ is **read-only** — no full business identity editor this cycle.
- `BusinessProfilePanel` 7-step wizard still exists under `business-profile` section (not removed).
- `ProfilePanel.tsx` remains orphaned (zero imports).
- Experience Test Launcher still lists legacy profile estate rooms including Growth Profile (unchanged per scope).
- `workspaceMode` title for `client-avatars` was **not** changed (avoids chat audit regression); People I Help™ appears in Profile UI only.
- Full `npm test` suite has extensive pre-existing failures unrelated to this change.

---

## 19. Recommended Next Profile Cycle

1. Unified **editable** My Business Estate™ read/write view (business identity, direction, brand).
2. Retire or redirect `BusinessProfilePanel` wizard into My Business Estate™ when ready.
3. Optional: wire `ProfilePanel` hub or delete if permanently superseded.
4. Data unification plan (localStorage → single profile document, then Supabase when approved).
5. Founder-approved screenshots + UX polish for Profile plate backgrounds.

---

## 20. Founder Review Steps

1. Open preview URL for commit on `deploy/companion-app-v3` (see commit message below).
2. Sign in to `/companion`.
3. Click **SH initials** (upper right) → confirm menu: Conversations, Settings, **Profile** (group), Logout.
4. Expand **Profile** → confirm **only** My Business Estate™ and People I Help™.
5. Select **My Business Estate™** → dedicated panel with title, description, Business Snapshot (or calm empty state). Confirm **no** chat-only My Estate shell behind it.
6. Use top **Back** → returns to conversation; reopen Profile → select **People I Help™**.
7. Confirm **Ideal Client / avatar** UI loads; **← Back to Profile** returns to My Business Estate™.
8. Confirm **Growth Profile**, Evidence Vault, Journal, Portfolio do **not** appear in Profile dropdown.
9. Regression: open **Settings**, **Conversations → New Chat**, room **Experiences** menu — unchanged behavior.
10. Capture screenshots listed in §17 for approval record.

---

## Explicit Non-Changes

The following were **not** changed in this implementation cycle:

- Welcome Home (dropdown, destinations, routing, components)
- Experiences (dropdown, room routing, audio, breathing, soundscapes)
- Settings (dropdown, screen, categories, labels)
- Journal Gazebo™ (buttons, background, data, route)
- Evidence Vault™
- Hall of Accomplishments™
- Estate Cartographer™
- Chamber
