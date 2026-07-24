/**
 * Business Estate proposal consumer — field-level approval required.
 * No silent authoritative writeback.
 */

import {
  CREATION_WORKSPACE_ESTATE_HANDOFF_VERSION,
  MAX_HANDOFF_AGE_MS,
  type CreationWorkspaceEstateHandoff,
  type CreationWorkspaceEstateProposalField,
} from "./contracts";
import {
  isHandoffReusable,
  markHandoffApproved,
  markHandoffFailed,
  markHandoffOpening,
  updateHandoffRegistryEntry,
} from "./registry";
import {
  clearEstateHandoff,
  peekEstateHandoff,
  storeEstateHandoff,
} from "./storage";

export type ConsumeEstateHandoffResult =
  | {
      ok: true;
      mode: "field_review";
      handoff: CreationWorkspaceEstateHandoff;
      silentWritebackAllowed: false;
    }
  | {
      ok: false;
      reason: string;
      stage: string;
      handoff?: CreationWorkspaceEstateHandoff | null;
    };

function isStale(createdAt: string): boolean {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t > MAX_HANDOFF_AGE_MS;
}

export function validateEstateHandoff(
  raw: unknown,
  opts?: { allowApprovedFields?: boolean },
):
  | { ok: true; handoff: CreationWorkspaceEstateHandoff }
  | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "Missing Business Estate handoff." };
  }
  const h = raw as Partial<CreationWorkspaceEstateHandoff>;
  if (h.version !== CREATION_WORKSPACE_ESTATE_HANDOFF_VERSION) {
    return { ok: false, reason: "Unsupported Business Estate handoff version." };
  }
  if (!h.id || !h.workspaceId || !Array.isArray(h.proposals)) {
    return { ok: false, reason: "Malformed Business Estate handoff." };
  }
  if (h.requiresFieldApproval !== true || h.silentWritebackAllowed !== false) {
    return {
      ok: false,
      reason: "Estate handoffs require field approval and forbid silent writeback.",
    };
  }
  if (h.createdAt && isStale(h.createdAt)) {
    return { ok: false, reason: "Business Estate handoff is stale." };
  }
  if (!opts?.allowApprovedFields && (h.proposals ?? []).some((p) => p.approved)) {
    return {
      ok: false,
      reason: "Estate proposals must not arrive pre-approved.",
    };
  }
  for (const p of h.proposals ?? []) {
    if (!p.destinationField || !p.proposedValue?.trim()) {
      return {
        ok: false,
        reason: "Each estate proposal needs a destination field and proposed value.",
      };
    }
  }
  return { ok: true, handoff: h as CreationWorkspaceEstateHandoff };
}

export function consumeCreationWorkspaceEstateHandoff(input?: {
  handoff?: CreationWorkspaceEstateHandoff | null;
}): ConsumeEstateHandoffResult {
  const raw = input?.handoff ?? peekEstateHandoff();
  const validated = validateEstateHandoff(raw);
  if (!validated.ok) {
    if (raw && typeof raw === "object" && "id" in raw) {
      markHandoffFailed(String((raw as { id: string }).id), "validate_estate");
    }
    return {
      ok: false,
      reason: validated.reason,
      stage: "validate_estate",
      handoff: (raw as CreationWorkspaceEstateHandoff) ?? null,
    };
  }
  const handoff = validated.handoff;
  if (!isHandoffReusable(handoff.id)) {
    return {
      ok: false,
      reason: "Business Estate handoff already consumed or superseded.",
      stage: "registry_guard",
      handoff,
    };
  }
  markHandoffOpening(handoff.id);
  updateHandoffRegistryEntry(handoff.id, { status: "ready_for_review" });
  storeEstateHandoff(handoff);
  return {
    ok: true,
    mode: "field_review",
    handoff,
    silentWritebackAllowed: false,
  };
}

export function setEstateProposalApproval(
  handoff: CreationWorkspaceEstateHandoff,
  proposalId: string,
  approved: boolean,
): CreationWorkspaceEstateHandoff {
  const proposals: CreationWorkspaceEstateProposalField[] = handoff.proposals.map(
    (p) => (p.id === proposalId ? { ...p, approved } : p),
  );
  const next = { ...handoff, proposals };
  storeEstateHandoff(next);
  return next;
}

/**
 * Apply only explicitly approved fields. Returns applied field keys —
 * callers persist to Estate; this module never silent-writes.
 */
export function applyApprovedEstateProposals(
  handoff?: CreationWorkspaceEstateHandoff | null,
): {
  ok: true;
  applied: CreationWorkspaceEstateProposalField[];
  skipped: CreationWorkspaceEstateProposalField[];
  handoff: CreationWorkspaceEstateHandoff;
} | {
  ok: false;
  reason: string;
} {
  const raw = handoff ?? peekEstateHandoff();
  const validated = validateEstateHandoff(raw, { allowApprovedFields: true });
  if (!validated.ok) return { ok: false, reason: validated.reason };
  const current = validated.handoff;
  const applied = current.proposals.filter((p) => p.approved);
  const skipped = current.proposals.filter((p) => !p.approved);
  if (!applied.length) {
    return { ok: false, reason: "Approve at least one field before applying." };
  }
  markHandoffApproved(current.id, current.workspaceId);
  updateHandoffRegistryEntry(current.id, {
    status: "approved",
    lastSynchronizationAt: new Date().toISOString(),
  });
  return { ok: true, applied, skipped, handoff: current };
}

export function cancelEstateHandoff(
  handoff?: CreationWorkspaceEstateHandoff | null,
): void {
  const h = handoff ?? peekEstateHandoff();
  if (h) updateHandoffRegistryEntry(h.id, { status: "cancelled" });
  clearEstateHandoff();
}
