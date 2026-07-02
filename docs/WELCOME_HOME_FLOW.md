# Welcome Home Flow — Spark V4 First Launch

| Field | Value |
|-------|-------|
| **Status** | V4 foundation + V4.0 partial implementation |
| **Asset** | `/backgrounds/welcome-home-background.png` |
| **Parent** | [SPARK_V4_ARCHITECTURE.md](./SPARK_V4_ARCHITECTURE.md) · [DISCOVERY_SYSTEM.md](./DISCOVERY_SYSTEM.md) |

---

## Purpose

The first 30 seconds answer one question:

> **"I have entered a place where I belong."**

Welcome Home is **not** onboarding software. It is **arrival at the Estate**.

---

## What members must NOT see (first launch)

| Hidden | Why |
|--------|-----|
| Left navigation | Breaks immersion |
| Top navigation | Dashboard feeling |
| Google integration panel | Utility, not belonging |
| "Good morning" heading | Software greeting |
| Chat input (initially) | Conversation comes after welcome |
| Transparent overlays | Full exposure of environment |
| Dashboard widgets | Spark is a place, not a panel |

---

## Cinematic journey (target experience)

### V4 vision (full sequence)

| Beat | Visual | Audio |
|------|--------|-------|
| 1. Distant exterior | Wideest crop — approach path, Welcome House in context | Ambient wind, birds — very low |
| 2. Approach | Slow dolly toward front entrance | Music fades in (~2s) |
| 3. Threshold | Cross front door — light warms | Founder voice begins (~4s) |
| 4. Foyer | Arrive inside — warm lighting | Welcome script |
| 5. Settle | Camera rests — room breathes | Music continues under voice |

### V4.0 implementation (current)

| Beat | Status |
|------|--------|
| Full-screen room image | ✅ `WELCOME_ROOM_ASSET` |
| Dolly zoom doorway → seating | ✅ `useWelcomeRoomArrival({ skipIntro: true })` |
| No dark curtain / no wash | ✅ Full exposure from frame one |
| Welcome-room audio profile | ✅ `useWelcomeAudioExperience` |
| Skip Intro | ✅ |
| Access menu (corner) | ✅ Profile overlay |
| Post-welcome conversation | ✅ Fade-in UI |
| Exterior → door multi-scene | 🔲 Phase 1 refinement |

**Code:** `components/companion/WelcomeHomeFirstLaunch.tsx` · `lib/welcomeHome/` · `welcome-home-first-launch.css`

---

## Founder welcome audio (script outline)

Audio explains — calmly, without overwhelm:

1. **Welcome to Spark Estate** — you are home
2. Spark is organized around **conversations and places** — not menus
3. You will **discover capabilities over time** — no need to learn everything today
4. Introduce gently:
   - **Discovery Key™** — opens one wonderful thing at a time
   - **Estate Guide™** — walk the Estate together when you're ready
   - **Spark Cards™** — wisdom that grows with you
   - **Daily Discoveries™** — one invitation, when it feels right
5. Close: **Just tell Shari what you want to accomplish** — that is enough

**Tone:** Founder welcome, not product tour. Warm lighting energy in voice.

**Implementation:** Extend `welcome-room` audio profile or dedicated `welcome-home` profile in `lib/welcomeAudio/profiles`.

---

## Phase diagram

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  CINEMATIC   │ ──► │  TRANSITION  │ ──► │  CONVERSATION       │
│  dolly+audio │     │  fade UI in  │     │  frosted + choices  │
└──────────────┘     └──────────────┘     └─────────────────────┘
       │                                              │
       │ Skip Intro                                   │
       └──────────────────────────────────────────────┘
```

### Phase 1 — Cinematic

| Element | Behavior |
|---------|----------|
| Environment | Full viewport, no chrome |
| Animation | Slow dolly inward (72s walk budget; skippable) |
| Music | Welcome-room ambience (~2s delay) |
| Voice | Founder welcome (~4s delay) |
| Skip Intro | Bottom-right — jumps to conversation |
| Access | Top-right — account/settings (subtle) |

**Complete when:** walk finished AND voice not playing/loading — or Skip Intro.

### Phase 2 — Transition

| Element | Behavior |
|---------|----------|
| Duration | ~1s fade |
| Chrome | Still hidden (sidebar, top bar) |
| Environment | Still full-screen behind frosted UI |

### Phase 3 — Conversation

Fade in sequentially:

1. **Frosted conversation window** (Shari question)
2. **Chat input** — `input-glass-conversation` standard
3. **Discovery Key** icon
4. **Estate Guide** icon

**Shari asks:** *"What would you like to do today?"*

**Three invitations:**

| # | Title | Subtitle | Action |
|---|-------|----------|--------|
| 1 | I know what I want to do | Just tell me. | Focus chat — normal home |
| 2 | Show me around the Estate | Take the guided tour. | Estate Guide / Welcome Room |
| 3 | Surprise me | Introduce me to something wonderful. | Spark surprise conversation |

---

## Frosted chat handoff (critical)

Post-welcome **must** use the validated frosted implementation — **do not redesign**.

| Piece | Reference |
|-------|-----------|
| Spec | [Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md) |
| Workspace class | `companion-workspace-frosted` |
| Input class | `input-glass-conversation` |
| Component | `ChatInputBar` with `conversationMode` |
| Home footer | `HomeChatInputFooter` after welcome completes |

Welcome Home overlay exits → home shows standard frosted everyday chat (`data-everyday-chat`).

---

## Returning members

| Rule | Implementation |
|------|----------------|
| No forced replay | `hasCompletedWelcomeHomeFirstLaunch()` |
| Persistence key | `companion-welcome-home-first-launch-v1` |
| Replay | Profile → Welcome Home → `requestWelcomeHomeReplay()` |
| Normal path | Direct to calm home conversation |

---

## Accessibility

| Need | Behavior |
|------|----------|
| `prefers-reduced-motion` | Skip cinematic — conversation phase immediately |
| Audio off | Visual journey still works; captions future |
| Skip Intro | Always available during cinematic |

---

## Persistence & events

| API | Purpose |
|-----|---------|
| `hasCompletedWelcomeHomeFirstLaunch()` | Skip for returning |
| `recordWelcomeHomeFirstLaunchComplete()` | On choice or send |
| `requestWelcomeHomeReplay()` | Profile replay |
| `WELCOME_HOME_REPLAY_EVENT` | Session replay trigger |

**Location:** `lib/welcomeHome/`

---

## Integration points

| System | Connection |
|--------|------------|
| `CompanionPageClient` | Overlay + `companion-welcome-home-first-launch-active` chrome hide |
| Welcome audio | Same session as Welcome Room (`welcomeRoomAudioSession`) |
| Arrival Intelligence | Runs after welcome — not during |
| Discovery System | Icons wire to Key + Guide |
| Observation Mode | Log first-launch conversations separately |

---

## QA checklist (before ship)

- [ ] No sidebar/top bar visible during cinematic
- [ ] No transparent wash on image
- [ ] Audio respects login gesture unlock
- [ ] Skip Intro works
- [ ] Reduced motion respected
- [ ] Returning user skips intro
- [ ] Replay from Profile works
- [ ] Post-welcome uses frosted standard
- [ ] Three invitations — max three choices
- [ ] Shari test on all copy
- [ ] CT-11 hospitality pass on first conversation turn

---

## Phase 1 engineering tasks

1. Multi-scene assets: exterior → door → foyer (or Ken Burns on single asset zones)
2. Dedicated founder audio script + recordings
3. Frosted panel wrapper on post-welcome (not just input bar)
4. Estate Guide state machine stub
5. Discovery Key first-unlock content

---

## Related

- [DISCOVERY_SYSTEM.md](./DISCOVERY_SYSTEM.md)
- [SPARK_V4_ARCHITECTURE.md](./SPARK_V4_ARCHITECTURE.md)
- [SPARK_HOSPITALITY_FRAMEWORK.md](./SPARK_HOSPITALITY_FRAMEWORK.md)
- [lib/welcomeRoom/arrival.ts](../lib/welcomeRoom/arrival.ts)
