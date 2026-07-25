# Phase 3 — Create Lifecycle Browser Certification

**Date:** 2026-07-25  
**Surface:** Welcome Home (`/companion`)  
**Scope:** park / side-question / resume / revise / hard exit  
**Phase 4:** not started

## Result: PASS

| Step | Result | Notes |
|------|--------|-------|
| Draft email (price change) | Pass | UC `awaiting_action` |
| Side question (Texas license) | Pass | UC `parked`; Companion answer (not howto failsafe) |
| Resume (`Let's go back to the email.`) | Pass | UC `resumed`; email menu restored |
| Revise (`Make the tone warmer.`) | Pass | Local Create revision (`Updated — here's the same email…`) |
| Exit (`I'm done with the email for now.`) | Pass | Local ack; UC cleared; no redraft / no howto |

**Exit ack (canonical):**  
`Okay — we can leave the email here. Whenever you want to pick it back up, just say so.`

## Exit fix (release closure)

1. Continuity / intent-workflow cleared UC **before** the late Create exit-ack block, so `classifyCreateTurnRelationship` saw `none` and Companion API answered.
2. Fix: handle `createRelForAuthority.relationship === "exit-create"` immediately after chat-turn start — **before** Continuity clears UC.
3. Exit ack uses owner `create_exit_ack` with `bypassVoiceLayer` + `deliveryKind: "system"` so `certifyCompanionDelivery` cannot regenerate the ack into another email draft.

## Automated

- `lib/universalCreation/createLifecycle.integration.test.ts` — A6 exit (and full A1–A8 suite) green

## Out of scope

- Phase 4 ownership migrations  
- Unrelated dirty-tree WIP (estate CSS, Visual Thinking, chamber docs, etc.)
