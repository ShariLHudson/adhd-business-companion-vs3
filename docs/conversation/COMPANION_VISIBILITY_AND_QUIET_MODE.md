# Companion Visibility and Quiet Mode

**Runtime:** `lib/conversationVisibility/`  
**UI:** Conversation-area controls in `WelcomeHomeFrostedChatPanel` · secondary Settings → Experience Controls → Companion Conversation

## User-facing behavior

| Control | Label |
|---------|--------|
| On | Companion: On |
| Off | Companion: Off |

Primary location: Conversation header row beside **New Chat** and **New Day**.  
Not icon-only. Not buried as the only control in Settings.

## On semantics

- Show messages and input
- Allow voice where entitled
- Allow Shari responses via the authoritative conversation router
- Preserve the current conversation

## Off semantics

- Hide messages and input (quiet state)
- Destination remains fully usable
- Do not auto-prompt, autoplay restored chat, delete conversation, cancel saved work, erase awaiting records, or alter long-term memory
- Calm copy: “Companion conversation is off in this place.” + **Turn Companion On**

## New Chat

Distinct from Companion On/Off.  
If Companion is Off and the member chooses New Chat: confirm  
“Starting a new chat will turn Companion on.” → Start New Chat / Cancel.

## New Day

Distinct from Companion On/Off.  
Respects current Off preference — New Day does not reopen chat.

## Persistence model (this phase)

```ts
ConversationDisplayPreference {
  globalDefault: "on" | "off"
  destinationOverrides: Record<DestinationId, "on" | "off">
  updatedAt: string
  version: 1
}
```

Storage: `spark:conversation-display-prefs:v1`  
Migrates legacy `experienceControlPrefs.conversationVisibility` into `globalDefault`.  
Per-destination overrides are implemented.

## Destination classes

| Class | Examples | Companion On/Off control |
|-------|----------|---------------------------|
| user_controllable | Welcome Home, Strategy Chamber, Create, Clear My Mind | Yes |
| initially_hidden | Evidence Vault, Estate Library | Yes (defaults Off) |
| no_chat_by_design | Journal Gazebo, Projects | No (no general companion panel) |
| specialized_conversation | Talk It Out, Boardroom, Chamber members | No competing control — specialized session owns chat |

Companion Off quiets the **general** companion surface. It does not silently discard a deliberately opened specialized session.

## Routing / state ownership

Action: `SET_COMPANION_VISIBILITY` via `setCompanionVisibility()`.

Effects:

- Update canonical preference
- Hide/show conversation body
- Abort in-flight response when turning Off (`supersedeInFlightChatRequest` + generation bump)
- Preserve conversation and scope
- Bridge legacy Experience Controls `conversationVisibility` field

Not: destination navigation, New Day, conversation deletion, logout, workflow cancellation.

## Stale-response handling

Turning Off bumps chat request generation and aborts the active AbortController so late responses cannot render.

## Accessibility

- Visible text labels
- `aria-pressed` on the Companion toggle
- `aria-label`: “Companion conversation on/off”
- Min 44px targets
- Keyboard operable

## Adaptive Companion Intelligence

Explicit user control only. No silent Off from overwhelm inference. Future suggestions must ask permission.

## Certification

See `lib/conversationVisibility/companionVisibility.test.ts`.
