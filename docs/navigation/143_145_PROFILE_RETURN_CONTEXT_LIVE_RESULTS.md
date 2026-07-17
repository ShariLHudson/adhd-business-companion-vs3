# 143–145 — Profile Return Context (Live Results)

**Status:** `unit_verified` · authenticated preview **Pending**  
**Do not deploy production** until `144_PROFILE_RETURN_CONTEXT_LIVE_CHECKLIST.md` passes.

## Root cause

One `overlay` enum serves both Profile destinations and Settings. Opening Settings did `setOverlay("settings")`, which unmounted `ProfileDestinationHost` and discarded local My Profile draft state. Closing Settings set `overlay` to `null` instead of restoring `profile-personal`. People I Help from My Business Estate replaced the overlay the same way, with no reusable origin context.

## What shipped

- One reusable `NavigationOriginContext` (`lib/navigationOrigin.ts`)
- Visible `ProfileReturnBar` on Profile destinations and Settings
- Capture before leave (Settings, People I Help); restore tab/section/scroll/focus on return
- My Profile draft persistence via `sessionStorage` (`profilePersonalDraft.ts`)
- Welcome Home clears origin; Escape/close Settings restores Profile when origin is active
- Nested leave uses one origin with safe replace (no infinite stack)

## Owners

| Concern | Owner |
|---------|--------|
| Profile tab / section / step fields | Origin context + destination panels (`data-profile-section` when present) |
| Profile draft state | `lib/profile/profilePersonalDraft.ts` + `MyProfilePanel` |
| Origin-context state | `lib/navigationOrigin.ts` |
| Return-control UI | `components/companion/ProfileReturnBar.tsx` |
| Return routing | `returnToProfileOrigin` / `closeSettingsOverlay` in `CompanionPageClient.tsx` |
| Scroll / focus restoration | `restoreProfileScrollAndFocus` in `CompanionPageClient.tsx` |

## Automated tests

`npx vitest run lib/navigationOrigin.test.ts lib/profile/profilePersonalDraft.test.ts lib/profile/profileReturnContextWiring.test.ts lib/profile/profileReturnBarContract.test.ts` — **14 passed**

## Limitations

- Expanded accordion / multi-tab Profile chrome is restored when destinations expose `data-profile-section`; My Profile V1 is a single scroll surface
- Authenticated live checklist not yet run
