# ADR-013: Create vs Creation Workspace Routing Boundary

**Status:** Approved — implementation follows this ADR
**Date:** 2026-08-05
**Decision owner:** Founder
**Approved by:** Shari Hudson
**Approval date:** August 5, 2026
**Related:** `docs/creation-workspace/CREATION_WORKSPACE_STANDARD.md` · `lib/createEstate/createOwnershipContract.ts` · `docs/estate/ESTATE_REGISTRY.md`

---

## Context

A read-only architectural audit of the Create area (2026-08-05) traced why a confirmed Begin request — e.g. "a checklist for onboarding new clients," confirmed at the intent gate as **Create Checklist** — did not open `CreateEstateWorkingPanel` (Current Focus), the documented Create destination. Instead it opened a parallel surface, **Creation Workspace**, whose own standard (`docs/creation-workspace/CREATION_WORKSPACE_STANDARD.md`) describes it as a route for *coordinated* work, not single artifacts.

The root cause: `lib/creationWorkspace/openDecision.ts` correctly encodes a "coordinated work" qualifier (content_plan / handbook / program / curriculum / campaign families, step-by-step language, requested duration ≥ 2, requested quantity ≥ 2, or `requiresExecutionPlanning`) — but that qualifier is followed by an **unqualified catch-all** (`primaryIntent === "create" || creationFamily !== "unknown"`) that also returns `open: true`. Both branches open Creation Workspace; the qualifier currently has zero behavioral effect beyond changing an internal telemetry string. As a result, nearly every free-text Begin — including single-artifact requests the standard's own bypass clause describes as belonging in Create — is captured by the catch-all.

This is not a bug in classification (the confirm gate correctly said "Checklist") — it is a bug in the *routing boundary* between two legitimate, differently-purposed systems. Narrowing the catch-all requires a product decision about where that boundary sits, which only the founder can make.

## Decision

**Default to Create.** Creation Workspace opens **only** on an explicit coordinated-work signal:

- creation family is `content_plan`, `handbook`, `program`, `curriculum`, or `campaign`
- explicit step-by-step / multi-stage language
- requested duration ≥ 2 (multi-day work)
- requested quantity ≥ 2 (multiple coordinated outputs)
- `requiresExecutionPlanning`

Everything else — including Checklist, SOP, Report, Proposal, Guide, Email, Blog, Social Post, and any other single-artifact request — routes to **Create → Current Focus** by default.

**Explicitly rejected:** maintaining an expanding artifact-type allowlist as the primary routing rule (the "Expand the bypass allowlist" option). An allowlist keyed on artifact-type strings has the same drift shape already found in Issue 1 of this audit (`HOME_RESUME_CONTINUITY_TYPES` silently outgrowing `resumeWorkSignals.ts`) — a new artifact type added anywhere else in the codebase would need a matching addition here, with no compiler or test forcing that to happen. The qualifier-based rule instead routes on the *shape of the request* (coordinated vs single), which composes with new artifact types automatically.

**Preserved:** Spark's ability to recognize complexity mid-conversation and move into broader planning when appropriate. This ADR governs the **Begin-time routing default only** — it does not remove or weaken any in-conversation path that already lets Spark (or the member) escalate an in-progress Current Focus session into coordinated planning. No such escalation path is touched by this decision.

## Consequences

- `lib/creationWorkspace/openDecision.ts`'s catch-all (previously `primaryIntent === "create" || creationFamily !== "unknown"` → `open: true`) is narrowed to only the qualifier conditions already written at that file's "coordinated work" block. The qualifier block itself is not changed — it already encodes this decision correctly; only the catch-all beneath it is removed/narrowed.
- Single-artifact Begin requests will route to `CreateEstateWorkingPanel` (Current Focus), matching `lib/createEstate/createOwnershipContract.ts`'s declared Create destination and `lib/createEstate/legacyCreateShellQuarantine.ts`'s stated post-fix shell.
- Creation Workspace remains fully live and correctly scoped for genuinely coordinated, multi-part work — this ADR does not deprecate or quarantine it.
- No new Create owner, coordinator, or storage path is introduced. This is a boundary correction within existing systems, per `createOwnershipContract.ts:23` ("Never open a second Create owner").

## Implementation order

This ADR gates Fix B only. The approved sequence (dependency-driven, not severity-driven) is:

1. **D** — Map Creation Workspace into `docs/estate/ESTATE_REGISTRY.md` (docs-only; the migration freeze requires every live destination to be mapped).
2. **A** — Restore `active-creation` (and `visual-focus-map`) eligibility in `lib/resumeWorkSignals.ts` so Continue Where I Left Off can see Create work once it's registered correctly. Must precede B, or B's benefit is invisible.
3. **C** — Bind the canonical UWE `work-…` id through the guided Begin path so it is never orphaned by whichever surface opens.
4. **B** — Narrow the Creation Workspace catch-all per this ADR's decision.
