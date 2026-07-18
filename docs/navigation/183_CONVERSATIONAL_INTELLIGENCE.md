# 183 — Conversational Intelligence (CI)

**Source:** `183_CURSOR_CONVERSATIONAL_INTELLIGENCE_ARCHITECTURE.md`  
**Status:** Implemented in code · **Do not deploy** until authenticated conversations meet Spark Estate’s 12/10 conversational quality.

## Purpose

| Layer | Owns |
|-------|------|
| **RCI (182)** | *What* should happen next (Thinking Map, move kind) |
| **CI (183)** | *How* Shari expresses it (wording, pacing, tone, variation) |

One thoughtful person across Talk It Out, Journal, Decision Compass, Chamber, Board, general chat, Founder Studio.

## Core principle

Warm · attentive · conversational · thoughtful · naturally curious · encouraging · never scripted.  
Not “AI.” Not therapeutic theater.

## Architecture

| Piece | Path |
|-------|------|
| Types / goals / tone bands | `lib/conversationalIntelligence/types.ts` |
| Goal detection | `goalDetection.ts` |
| Tone selection | `toneSelection.ts` |
| Variation / anti-formula | `variation.ts` |
| Expression engine | `expressionEngine.ts` |
| Quality certification | `qualityCert.ts` |
| Shared API | `api.ts` → `deliverConversationalResponse()` |
| Barrel | `index.ts` |

**First consumer:** Talk It Out (`lib/talkItOut/reflectiveEngine.ts`) — after RCI + situation lead, CI delivers final wording using Conversation Style (`aiTone`) when available.

## Flow (every turn)

1. Understand what was said (RCI / caller)  
2. Decide acknowledgement need  
3. Decide whether a question is necessary  
4. Express **one** natural response  
5. Stop  

## Quality gates

Sounds human · not scripted · avoids repetition · builds on user · moves understanding · leaves room to think.  
Any fail → regenerate wording (CI); then safe fallback.

## Boundary vs other layers

- **RCI** — reflective move + draft semantic content  
- **CI** — expression / variation / tone band  
- **`shariVoiceLayer`** — main companion-chat prefs shaping (Help Mode length, etc.) — not required for Talk It Out reflective prose  
- **`humanConversation`** — forbidden-opener scrub reused inside CI cert  

## Tests

`lib/conversationalIntelligence/conversationalIntelligence.test.ts`  
Plus existing Talk It Out / RCI suites.

## Authenticated validation (required)

Business · planning · overwhelm · celebration · creative · founder · journaling · everyday chat.  
Independent reviewers must not find repetitive/scripted wording.

## Deploy

**Do not deploy** until conversational quality consistently meets Spark Estate’s 12/10 standard.
