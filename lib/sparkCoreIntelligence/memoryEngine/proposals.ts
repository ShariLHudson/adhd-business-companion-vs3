/**
 * Memory write proposals, confirmation, edit, delete, export.
 */

import { confidenceAfterConfirm } from "./aging";
import { detectConflict } from "./conflicts";
import { evaluateWriteCandidate, memoryTypeForKey, isRememberableKey } from "./governance";
import { getRecord, listAllForUser, removeRecord, upsertRecord } from "./store";
import type {
  MemoryConfidence,
  MemoryExport,
  MemoryProvenance,
  MemoryRecord,
  MemoryWriteProposal,
} from "./types";
import { SPARK_CORE_MEMORY_ENGINE_VERSION } from "./types";

const pendingProposals = new Map<string, MemoryWriteProposal>();

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function initialConfidence(provenance: MemoryProvenance): MemoryConfidence {
  if (provenance === "member_confirmed") return "confirmed";
  if (provenance === "member_stated") return "observed";
  return "needs_confirmation";
}

export function proposeMemoryWrite(input: {
  userId: string;
  key: string;
  proposedValue: unknown;
  sourceText: string;
  provenance?: MemoryProvenance;
  explicitConsent?: boolean;
}): MemoryWriteProposal {
  const provenance = input.provenance ?? "member_stated";
  const evaluation = evaluateWriteCandidate({
    userId: input.userId,
    key: input.key,
    value: input.proposedValue,
    sourceText: input.sourceText,
    provenance,
    explicitConsent: input.explicitConsent,
  });

  const conflict = !evaluation.blocked
    ? detectConflict(input.userId, input.key, input.proposedValue)
    : undefined;

  const proposal: MemoryWriteProposal = {
    id: newId("mem-prop"),
    userId: input.userId,
    memoryType: evaluation.memoryType,
    key: input.key,
    proposedValue: input.proposedValue,
    provenance,
    requiresConfirmation:
      evaluation.requiresConfirmation || Boolean(conflict),
    blocked: evaluation.blocked,
    blockReason: evaluation.blockReason,
    promptText:
      conflict?.promptText ??
      evaluation.promptText ??
      (input.explicitConsent
        ? undefined
        : `Would you like me to remember this about your ${input.key.replace(/_/g, " ")}?`),
    conflictWithId: conflict?.existingId,
  };

  if (!proposal.blocked) pendingProposals.set(proposal.id, proposal);
  return proposal;
}

export function confirmMemoryUpdate(
  userId: string,
  proposalId: string,
): MemoryRecord | undefined {
  const proposal = pendingProposals.get(proposalId);
  if (!proposal || proposal.userId !== userId) return undefined;

  const now = new Date().toISOString();
  const existing = proposal.conflictWithId
    ? getRecord(userId, proposal.conflictWithId)
    : undefined;

  const confidence = confidenceAfterConfirm(
    existing?.confidence ?? initialConfidence(proposal.provenance),
  );

  const record: MemoryRecord = {
    id: existing?.id ?? newId("mem"),
    userId,
    memoryType: proposal.memoryType,
    key: proposal.key,
    value: proposal.proposedValue,
    confidence,
    provenance: "member_confirmed",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    confirmedAt: now,
    lastAccessedAt: now,
    intelligenceHooks: existing?.intelligenceHooks ?? {
      id: existing?.id ?? newId("mem"),
      createdAt: now,
    },
  };

  upsertRecord(record);
  pendingProposals.delete(proposalId);
  return record;
}

export function editMemory(
  userId: string,
  recordId: string,
  value: unknown,
): MemoryRecord | undefined {
  const existing = getRecord(userId, recordId);
  if (!existing || existing.memoryType === "founder") return undefined;

  const now = new Date().toISOString();
  const updated: MemoryRecord = {
    ...existing,
    value,
    confidence: "high_confidence",
    provenance: "member_confirmed",
    updatedAt: now,
    confirmedAt: now,
  };
  return upsertRecord(updated);
}

export function deleteMemory(userId: string, recordId: string): boolean {
  pendingProposals.forEach((p, id) => {
    if (p.userId === userId && p.conflictWithId === recordId) {
      pendingProposals.delete(id);
    }
  });
  return removeRecord(userId, recordId);
}

export function exportMemory(userId: string): MemoryExport {
  return {
    userId,
    exportedAt: new Date().toISOString(),
    version: SPARK_CORE_MEMORY_ENGINE_VERSION,
    records: listAllForUser(userId, true),
  };
}

export function getPendingProposal(proposalId: string): MemoryWriteProposal | undefined {
  return pendingProposals.get(proposalId);
}

export function writeMemoryDirect(input: {
  userId: string;
  key: string;
  value: unknown;
  provenance?: MemoryProvenance;
}): MemoryRecord | undefined {
  if (!isRememberableKey(input.key)) return undefined;
  const now = new Date().toISOString();
  const record: MemoryRecord = {
    id: newId("mem"),
    userId: input.userId,
    memoryType: memoryTypeForKey(input.key),
    key: input.key,
    value: input.value,
    confidence: initialConfidence(input.provenance ?? "member_stated"),
    provenance: input.provenance ?? "member_stated",
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
    intelligenceHooks: { id: newId("mem"), createdAt: now },
  };
  return upsertRecord(record);
}

/** Test helper */
export function clearPendingProposals(): void {
  pendingProposals.clear();
}
