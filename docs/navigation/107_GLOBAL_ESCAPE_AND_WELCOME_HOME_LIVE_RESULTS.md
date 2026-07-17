# Live Results — Global Escape and Welcome Home (106–108)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

## Owners

| Concern | Owner |
|---------|--------|
| Global dismissal | `lib/windowDismiss` (`useDismissibleWindow` / `dismissPolicy`) |
| Topmost layer | `pushDismissibleWindow` stack |
| Welcome Home navigation | `returnToWelcomeHome` → `returnToWelcomeHomeLobby` in CPC |
| Guide close | `EstateGuideFlipbook` + dismiss stack |
| Persistent control | `EstateImmersiveHomeLink` (top-left) |
| Outside click (morning rooms) | `handleMorningRoomOutsideClick` + scrollbar guard |
| Focus / unsaved | dismiss policy + existing `confirmLeaveUnsavedWork` |

## Preview

- Preview commit: _(filled after commit)_
- Authenticated preview URL: _(filled after deploy)_
- Overall: **unit_verified** · live authenticated **Pending** (`107` checklist)
- Deploy recommendation: **Do not deploy production**
