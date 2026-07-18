# 210 — Conversation Architecture Manifest

**Runtime source of truth:** `lib/conversationArchitecture/`  
**Production deployed:** No

## Purpose

Master index for the Spark Estate Conversation Intelligence Platform.

## Architecture layers

### 1. Foundation (182–194)

Conversation intelligence · Repair · Topic Anchor · Gold Standard architecture

### 2. Runtime Engine (195–199)

CIE · Runtime state · Decision pipeline · Validation · Gold runtime integration

### 3. Talk It Out Standards (200–209)

Product · Strategy · Routing · Questions · Completion · Personalization · Shared patterns · Shari natural conversation · Human Conversation Validator

## Ownership

Machine-readable: `CONVERSATION_OWNERSHIP` in `lib/conversationArchitecture/ownership.ts`.

Only one module owns each responsibility. Do not introduce duplicate conversation logic.

## Runtime order

```
Intent → State → Topic Anchor → Planning → Gold Standard Retrieval → Draft → Human Conversation Validator → Regeneration → Final Validation → Response
```

Constant: `CONVERSATION_RUNTIME_ORDER_LABEL`

## Future rule

All new conversational experiences must integrate with this architecture rather than creating their own conversation pipeline.

See experience wiring: `EXPERIENCE_WIRING` in `experienceWiring.ts`.
