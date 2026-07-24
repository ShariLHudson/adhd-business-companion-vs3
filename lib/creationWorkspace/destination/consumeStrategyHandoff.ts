/**
 * Strategic Planning consumer — opens candidates; never auto-approves strategy.
 */

import {
  CREATION_WORKSPACE_STRATEGY_HANDOFF_VERSION,
  MAX_HANDOFF_AGE_MS,
  type CreationWorkspaceStrategyCandidate,
  type CreationWorkspaceStrategyHandoff,
} from "./contracts";
import {
  isHandoffReusable,
  markHandoffApproved,
  markHandoffFailed,
  markHandoffOpening,
  updateHandoffRegistryEntry,
} from "./registry";
import {
  clearStrategyHandoff,
  peekStrategyHandoff,
  storeStrategyHandoff,
} from "./storage";

export type ConsumeStrategyHandoffResult =
  | {
      ok: true;
      mode: "review_candidates";
      handoff: CreationWorkspaceStrategyHandoff;
      autoApprovedCount: 0;
    }
  | {
      ok: false;
      reason: string;
      stage: string;
      handoff?: CreationWorkspaceStrategyHandoff | null;
    };

function isStale(createdAt: string): boolean {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t > MAX_HANDOFF_AGE_MS;
}

export function validateStrategyHandoff(
  raw: unknown,
):
  | { ok: true; handoff: CreationWorkspaceStrategyHandoff }
  | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "Missing Strategy handoff." };
  }
  const h = raw as Partial<CreationWorkspaceStrategyHandoff>;
  if (h.version !== CREATION_WORKSPACE_STRATEGY_HANDOFF_VERSION) {
    return { ok: false, reason: "Unsupported Strategy handoff version." };
  }
  if (!h.id || !h.workspaceId || !h.strategicQuestion) {
    return { ok: false, reason: "Malformed Strategy handoff." };
  }
  if (h.autoApproved !== false || h.requiresReview !== true) {
    return {
      ok: false,
      reason: "Strategy handoff must require review and never auto-approve.",
    };
  }
  if (h.createdAt && isStale(h.createdAt)) {
    return { ok: false, reason: "Strategy handoff is stale." };
  }
  // Guard: no candidate may arrive pre-approved
  const buckets: Array<CreationWorkspaceStrategyCandidate[] | undefined> = [
    h.evidence,
    h.assumptions,
    h.options,
    h.tradeoffs,
    h.risks,
    h.decisionCriteria,
    h.proposedPriorities,
    h.possibleInitiatives,
    h.possibleMeasures,
    h.unresolvedQuestions,
  ];
  if (buckets.some((b) => (b ?? []).some((c) => c.approved))) {
    return {
      ok: false,
      reason: "Strategy candidates must not be pre-approved.",
    };
  }
  return { ok: true, handoff: h as CreationWorkspaceStrategyHandoff };
}

export function consumeCreationWorkspaceStrategyHandoff(input?: {
  handoff?: CreationWorkspaceStrategyHandoff | null;
}): ConsumeStrategyHandoffResult {
  const raw = input?.handoff ?? peekStrategyHandoff();
  const validated = validateStrategyHandoff(raw);
  if (!validated.ok) {
    if (raw && typeof raw === "object" && "id" in raw) {
      markHandoffFailed(String((raw as { id: string }).id), "validate_strategy");
    }
    return {
      ok: false,
      reason: validated.reason,
      stage: "validate_strategy",
      handoff: (raw as CreationWorkspaceStrategyHandoff) ?? null,
    };
  }
  const handoff = validated.handoff;
  if (!isHandoffReusable(handoff.id)) {
    return {
      ok: false,
      reason: "Strategy handoff already consumed or superseded.",
      stage: "registry_guard",
      handoff,
    };
  }
  markHandoffOpening(handoff.id);
  updateHandoffRegistryEntry(handoff.id, { status: "ready_for_review" });
  storeStrategyHandoff(handoff);
  return {
    ok: true,
    mode: "review_candidates",
    handoff,
    autoApprovedCount: 0,
  };
}

function mapCandidates(
  list: CreationWorkspaceStrategyCandidate[],
  id: string,
  patch: Partial<Pick<CreationWorkspaceStrategyCandidate, "selected" | "approved" | "title" | "body">>,
): CreationWorkspaceStrategyCandidate[] {
  return list.map((c) => (c.id === id ? { ...c, ...patch } : c));
}

export function updateStrategyCandidate(
  handoff: CreationWorkspaceStrategyHandoff,
  candidateId: string,
  patch: Partial<
    Pick<CreationWorkspaceStrategyCandidate, "selected" | "approved" | "title" | "body">
  >,
): CreationWorkspaceStrategyHandoff {
  const next: CreationWorkspaceStrategyHandoff = {
    ...handoff,
    evidence: mapCandidates(handoff.evidence, candidateId, patch),
    assumptions: mapCandidates(handoff.assumptions, candidateId, patch),
    options: mapCandidates(handoff.options, candidateId, patch),
    tradeoffs: mapCandidates(handoff.tradeoffs, candidateId, patch),
    risks: mapCandidates(handoff.risks, candidateId, patch),
    decisionCriteria: mapCandidates(handoff.decisionCriteria, candidateId, patch),
    proposedPriorities: mapCandidates(
      handoff.proposedPriorities,
      candidateId,
      patch,
    ),
    possibleInitiatives: mapCandidates(
      handoff.possibleInitiatives,
      candidateId,
      patch,
    ),
    possibleMeasures: mapCandidates(handoff.possibleMeasures, candidateId, patch),
    unresolvedQuestions: mapCandidates(
      handoff.unresolvedQuestions,
      candidateId,
      patch,
    ),
  };
  storeStrategyHandoff(next);
  return next;
}

/** Approve only explicitly selected candidates — never silent. */
export function approveSelectedStrategyCandidates(
  handoff?: CreationWorkspaceStrategyHandoff | null,
): {
  ok: true;
  approvedIds: string[];
  handoff: CreationWorkspaceStrategyHandoff;
} | {
  ok: false;
  reason: string;
} {
  const raw = handoff ?? peekStrategyHandoff();
  const validated = validateStrategyHandoff(raw);
  if (!validated.ok) return { ok: false, reason: validated.reason };
  let next = validated.handoff;
  const approvedIds: string[] = [];
  const bump = (list: CreationWorkspaceStrategyCandidate[]) =>
    list.map((c) => {
      if (c.selected) {
        approvedIds.push(c.id);
        return { ...c, approved: true };
      }
      return c;
    });
  next = {
    ...next,
    evidence: bump(next.evidence),
    assumptions: bump(next.assumptions),
    options: bump(next.options),
    tradeoffs: bump(next.tradeoffs),
    risks: bump(next.risks),
    decisionCriteria: bump(next.decisionCriteria),
    proposedPriorities: bump(next.proposedPriorities),
    possibleInitiatives: bump(next.possibleInitiatives),
    possibleMeasures: bump(next.possibleMeasures),
    unresolvedQuestions: bump(next.unresolvedQuestions),
  };
  if (!approvedIds.length) {
    return { ok: false, reason: "Select at least one candidate to approve." };
  }
  markHandoffApproved(next.id, next.workspaceId);
  storeStrategyHandoff(next);
  return { ok: true, approvedIds, handoff: next };
}

export function cancelStrategyHandoff(
  handoff?: CreationWorkspaceStrategyHandoff | null,
): void {
  const h = handoff ?? peekStrategyHandoff();
  if (h) updateHandoffRegistryEntry(h.id, { status: "cancelled" });
  clearStrategyHandoff();
}
