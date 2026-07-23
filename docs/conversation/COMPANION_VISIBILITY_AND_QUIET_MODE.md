# Companion Visibility and Quiet Mode

**Runtime:** `lib/conversationVisibility/`  
**Primary UI:** SH profile menu → Conversations  
**Secondary:** Settings → Experience Controls → Companion Conversation

## User-facing behavior

| Control | Label |
|---------|--------|
| On | Companion: On |
| Off | Companion: Off |

Primary location: **SH → Conversations** alongside New Chat and New Day.  
Not in the Welcome Home daily opening card. Not icon-only.

## Welcome Home daily opening

Companion Off must **not** suppress:

- Shari’s daily opening message
- Review Where You Left Off / Plan or Adapt My Day / Help Me Choose
- navigation cards or destination content

New Chat, New Day, and Companion On/Off never appear as a button row on the daily opening card.

## On semantics

- Show conversation messages and input
- Allow voice where entitled
- Allow Shari responses via the authoritative conversation router
- Preserve the current conversation
- Do not replace the daily opening experience

## Off semantics

- Hide conversation messages and input (quiet chat surface only)
- Destination and daily opening remain fully usable
- Do not auto-prompt, autoplay restored chat, delete conversation, cancel saved work, erase awaiting records, or alter long-term memory
- Quiet copy (chat surface only): “Companion conversation is off.” + **Turn Companion On**
- Never use “off in this place” inside the Welcome Home daily card

## New Chat

Distinct from Companion On/Off. Lives in SH → Conversations.  
If Companion is Off and the member chooses New Chat: confirm  
“Starting a new chat will turn Companion on.” → Start New Chat / Cancel.

## New Day

Distinct from Companion On/Off. Lives in SH → Conversations.  
Respects current Off preference — New Day does not reopen chat.

## Persistence model

```ts
ConversationDisplayPreference {
  globalDefault: "on" | "off"
  destinationOverrides: Record<DestinationId, "on" | "off">
  updatedAt: string
  version: 1
}
```

Storage: `spark:conversation-display-prefs:v1`  
Action source includes `conversations_menu`.

## Routing / state ownership

`SET_COMPANION_VISIBILITY` via `setCompanionVisibility()` — shared by SH menu and Settings.

## Accessibility

- Visible text labels in Conversations menu
- `aria-pressed` / `aria-label` on Companion toggle
- Keyboard operable menu rows
