# 342 — Agent Runtime Audit

**Date:** 2026-07-21  
**Governing spec:** [337](./337_AUTOMATION_AND_AGENT_ARCHITECTURE.md)  
**Related:** [327](./327_CAPABILITY_EXECUTION_AND_CONTRIBUTION_RUNTIME.md) · [331](./331_RUNTIME_RESILIENCE_RECOVERY_AND_SAFE_DEGRADATION.md) · [319](./319_SHARI_CONVERSATION_ORCHESTRATION_AND_RESPONSE_ARCHITECTURE.md) · Hidden Work (Spec 118) · [340](./340_EVOLUTION_AUDIT.md)  
**Mode:** Audit — **do not build an agent runtime before capability contracts and approval boundaries exist**  
**Verdict:** No production agent runner; automation appears as Blueprint sections / product language; conversation + Hidden Work already encode “work without theater”

---

## 1. What 337 requires

Agents / long-running automations must:

- operate through **capability contracts**  
- respect **approval boundaries**  
- log **provenance**  
- **avoid duplicate Work**  
- support checkpoints, human review, and recovery  

---

## 2. What exists today (not an agent OS)

| System | Path / notes | Agent-like? |
|--------|--------------|-------------|
| Shari conversation orchestration | Continuity locks · mention≠launch · Spec 105–114 | Companion — not autonomous agent |
| Hidden Work Engine (118) | Background prep; permission before surface | Closest “invisible worker” — must stay iceberg |
| Research approve-before-apply | UWE | Human checkpoint pattern to reuse |
| Blueprint adaptive questions | Guided, not autonomous loops | No long-running agent |
| Create “automation” sections | e.g. handmade online store Blueprint section id `automation` | Planning content — not runtime |
| Chamber Members | Perspective streams | Isolated; cleared on leave |
| Cron / background jobs | Limited product jobs if any | Not Estate agent architecture |

**Missing:** agent identity · long-running orchestration · tool-use sandbox · multi-step autonomy with checkpoints · agent-specific recovery ledger.

---

## 3. Hard prerequisites (blocking)

| Prerequisite | Spec / plan | Status |
|--------------|-------------|--------|
| Capability execution contract | 327 · 332 R1 | Not shipped |
| Approval modes (advisory/draft/transform) | 327 | Partial (Research only) |
| Canonical Output + provenance | 329 · 318 | Partial |
| Safe degradation / failed_safe | 331 · 334 | Chat isolation only |
| Createability honesty | 233–236 | All Blueprints blocked |
| No duplicate Work | UWE tests | Strong — agents must call same guards |

**Rule:** An agent that invents Work, skips approval, or bypasses UWE is an architecture violation — not a feature.

---

## 4. Relationship to Shari and Hidden Work

| Pattern | Keep | Do not |
|---------|------|--------|
| Shari | Permission · one question · repair | Autonomous multi-tool “agent mode” in chat |
| Hidden Work | Prep behind iceberg · cancel on direction change | Surface progress bars / “I’m automating…” |
| Future agents | Call 327 capabilities · draft only until approve | Separate memory/Work store |

Agents are **not** a replacement for Shari. They are optional long-running capability orchestrations under the same constitutions (315 · 113–117).

---

## 5. Automation categories (when ready)

| Kind | Example | Approval |
|------|---------|----------|
| Scheduled reminder / rhythm | Existing Reminders patterns | Low — no Work mutation |
| Draft prep | Hidden Work draft_prep | Permission to show |
| Multi-step Collection run | 328 Guided | Checkpoint per mutation |
| Connected-source sync | Integration pull | Scope + freshness rules |
| Fully autonomous loop | Not in V1 | Forbidden until cert + recovery proven |

---

## 6. Safe next slice (later — not now)

**A0 (docs only):** this audit.  

**A1 (after R1):** `AgentRun` types — `runId`, capability steps, checkpoint, approval state, correlationId — **no executor**.  

**A2:** Single-step agent that calls one certified capability in advisory/draft mode.  

**A3:** Multi-step with human checkpoint; failure → 331 recovery.  

Do not start A1 while R1 / createability pilot are open unless a founder override names agent work as the sole priority.

---

## 7. Forbidden until audits clear

- Autonomous Estate browsing agents  
- Agents that create Projects without handoff accept (333)  
- Agents with private databases  
- “Agent marketplace” before 341 E1–E5  
- Prompt-only agents that ignore UWE identity  

---

## 8. Exit criteria for a future agent MVP

- Operates only through 327 contracts  
- Every Work mutation approved or pre-authorized with visible scope  
- Provenance on every contribution  
- Duplicate Work impossible (same UWE guards)  
- failed_safe recovery tested  
- Architecture health / certification green for the agent package  
