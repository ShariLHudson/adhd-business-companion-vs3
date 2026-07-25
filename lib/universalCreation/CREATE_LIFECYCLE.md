# Create Lifecycle Model (Phase 3 Certification)

## States

| State | Meaning | Consumes unrelated turns? |
|-------|---------|---------------------------|
| **none** | No Create session | n/a |
| **active** | Create owns discovery / drafting | Yes (Create-related) |
| **awaiting_input** | Waiting for discovery answer, revision, or menu choice | Yes (Create-related) |
| **parked** | Soft leave — session + draft preserved | **No** |
| **resumed** | Explicit return from park | Yes |
| **completed** | Member finished; session cleared | No |
| **exited** | Member abandoned; session cleared | No |
| **abandoned** / expired | Cleared by reset / foreign spine | No |

## Parked Create preserves

- document type · draft · answers (audience, purpose, etc.) · phase · originalUserText · bound conversation id · park metadata

## Rules

1. Temporary detour → `parkCreateWorkflow` → Companion answers.
2. Explicit return → `resumeCreateWorkflow` → Create handler eligible.
3. Soft confirmation / `frictionless_pending` must not claim ownership while Create is active or parked.
4. Hard exit / replace / completion → `exitCreateWorkflow` / `clearUniversalCreationSession`.

## Classifier

`classifyCreateTurnRelationship` is the single authority before Create handlers.

Rival paths that must honor the same gate:

- `tryUniversalCreationFlow` (frictionless) — park/detour → `null` (no local reply)
- `resolveUniversalCreationTurn` (orchestrator) — park/detour → `null`
- `resolveRecoveryContinuation` (coaching fallback) — parked / ineligible → no email-ready steal
- `decideConversationTurnAuthority` — `activeCreateSession` only when `createEligible`
