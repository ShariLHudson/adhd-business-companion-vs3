# Addendum — Shari Voice and Style Enforcement

**Spine:** Conversation Decision (what) → Shari Voice Layer (how) → one member-facing reply  
**Not:** a second chatbot, a second router, or new Conversation Style enums

## Platform settings (authoritative names)

| Settings UI | Prefs field | Values |
|-------------|-------------|--------|
| Conversation Style | `aiTone` | gentle, balanced, direct, playful, strategic, motivational |
| Help Mode | `helpMode` | step-by-step, ask-first, direct, concise, navigate |
| Support Style | `getActiveSupportStyleId()` | gentle-first, practical-first, talk-it-through, step-by-step, give-me-choices, adaptive, custom |

There is no separate “Warm” enum — **Gentle** is the warm Conversation Style.

## Audit summary (wording owners)

| Source | Composes final wording? | Loads voice/style? | Can bypass composer? | Notes |
|--------|-------------------------|--------------------|----------------------|-------|
| `/api/companion-chat` | Yes (LLM) | Yes (body → prompt + voice layer) | No (post-LLM voice layer) | Always injects tone blocks now |
| `finalizeMemberFacingAssistantText` (CPC) | Pass-through | Yes (prefs) | Only with bypass flag | Frictionless, pending, universal, estate guide, local turns, chat_api client |
| Continuity correction (pre-decision) | Yes | **No** | Yes | Remaining exception |
| Kernel / Chamber / Round Table early acks | Often yes | Partial | Yes | Remaining — migrate to finalize helper |
| Clear My Mind companion voice | Yes (canned) | No | Yes | Remaining |
| `shariVoiceBible` openings | Yes | No | Yes | Remaining |
| Failure / legal / safety copy | Yes | Bypass allowed | Intentional | `bypassVoiceLayer` |
| Technology & Future hint | Prompt only | N/A | N/A | Does not finish the turn |

## Settings path

```
SettingsPanel / SupportStylePanel
  → savePrefs (companion-prefs-v1) + support style store
  → getPrefs / getActiveSupportStyleId on each send
  → POST /api/companion-chat { aiTone, helpMode, supportStyle }
  → buildCompanionSystemPrompt → buildShariVoicePromptBlocks
  → LLM
  → applyShariVoiceLayer (server)
  → client finalizeMemberFacingAssistantText (live prefs again)
```

**Persistence:** Conversation Style / Help Mode / Support Style are **localStorage**, not Supabase. They persist across refresh and new chat in the same browser. They do **not** sync across devices until a future profile sync exists.

**Verified in unit tests:** save → loadShariVoiceProfile reads saved values (no silent overwrite by defaults when prefs exist).

## Runtime metadata

`window.__sparkShariVoiceLog` (dev) records:

- activeVoiceProfile, selectedStyle/tone (`aiTone`), responseLengthPreference (`helpMode`)
- supportStyleId, conversationCondition, content/final owners
- cannedBypassAttempted, settingsSource, voiceLayerApplied

## Remaining exceptions (do not mark complete)

1. Continuity gate replies before turn decision  
2. Many CPC early acks not yet routed through `finalizeMemberFacingAssistantText`  
3. Clear My Mind / Voice Bible canned lines  
4. Chamber / Director-specific copy paths  
5. No cloud sync for tone prefs  
6. **Live preview/production chat not verified in this session**

## Rollback

- Revert `shariVoiceLayer.ts` wiring in CPC + companion-chat + companionPrompt  
- Or stop calling `finalizeMemberFacingAssistantText` / `applyShariVoiceLayer`  
- Path-scoped only — do not broad-reset the dirty tree
