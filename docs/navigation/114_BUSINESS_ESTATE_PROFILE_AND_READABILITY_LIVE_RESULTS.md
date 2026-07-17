# Live Results — My Business Estate, My Profile, Profile Readability (113–115)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

## Root causes

### My Business Estate / My Profile would not open

Overlay IDs were renamed to `my-business-estate` and `profile-personal`, and `openProfileDestinationCore` correctly sets those overlays, but:

1. The `overlay` React state union still omitted those IDs.
2. `profileDestinationActive` only checked legacy `"profile"` / `"people-i-help"` / `"growth-profile"`.

So Welcome Home stayed semantically primary (`welcomeHomePrimary`) while ProfileDestinationHost tried to open — shell/chrome conflict and a broken open path.

**Failing owners:** `app/companion/CompanionPageClient.tsx` — overlay union (~2544) and `profileDestinationActive` (~2562).

### Profile text unreadable

`my-profile-panel.css` forced near-white inherited text (`rgba(255, 250, 242, …)`) over ivory `EstateWorkspace` surfaces.

**Failing owner:** `app/companion/my-profile-panel.css`.

## Owners after fix

| Concern | Owner |
|---------|--------|
| Profile menu items | `lib/estateMenu/menuConfig.ts` / `GlobalEstateMenu` |
| Menu → destination map | `profileDestinationForMenuAction` |
| Open actions | `openProfileDestinationCore` |
| Shell / overlay host | `ProfileDestinationHost` (body portal z-index 100002) |
| Welcome Home inactive gate | `profileDestinationActive = isProfileDestinationOverlay(overlay)` |
| Business Estate plate containment | `MyBusinessEstateRoomShell` + `my-business-estate.css` (absolute) |
| Profile text tokens | `my-profile-panel.css` (`--profile-text-*`) |
| Outside-click / Escape | existing `useDismissibleWindow` + menu `closeAndRun` (action before close) |

## Automated tests

- `lib/profile/profileDestinationHardening.test.ts`
- `lib/profile/profileDestinationOpenAndReadability.test.ts`
- `lib/profile/profileDestination.test.ts`

## Preview

- Pending deploy after commit

## Deploy recommendation

**Do not deploy production** until authenticated `114` checklist passes.
