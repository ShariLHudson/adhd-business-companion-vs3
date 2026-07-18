# Universal Navigation Context & Return Standard (V1)

## Purpose

Whenever a user navigates from one Spark Estate experience to another, the platform remembers exact context and provides an easy way to return.

## Owners

| Concern | Owner |
|---------|--------|
| Stack API | `lib/navigationContext/stack.ts` |
| Labels / breadcrumbs | `lib/navigationContext/labels.ts` |
| Capture helpers | `lib/navigationContext/captureHelpers.ts` |
| Profile bridge | `lib/navigationContext/profileBridge.ts` |
| Return UI | `components/companion/NavigationReturnBar.tsx` |
| Profile consumer | `components/companion/ProfileReturnBar.tsx` |
| CPC wire | `captureLeaveToDestination` · `restoreNavigationFrame` · `navigateBackToEstateHome` |

## Destinations (bar + breadcrumbs)

Settings · Experience Controls · Chamber · Boardroom · Evidence Vault · Journal · Projects · Talk It Out · Profile · nested workflows

## Living Places

Quiet: Welcome Home + subtle leave. Leave restores stack origin when present. No breadcrumb trail or History clock on the photograph.

## Clear stack

Login · sign-up · onboarding · emergency recovery · intentional Welcome Home lobby reset.

Saving Settings does **not** clear the stack.

## V2 — History clock

Deferred. Last 5–10 places with stale/privacy/dedupe rules — after Previous Screen is stable.

## Retired

`GLOBAL_RETURN_TO_PROFILE_NAVIGATION.md` and Profile-only cursor rule — Profile is one consumer of this standard.
