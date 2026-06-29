/**
 * Spark Core Intelligence v1.0 — Memory & Personalization Engine
 */

import { extractFactsFromMessage } from "./governance";
import { buildMemoryProfile } from "./profile";
import {
  confirmMemoryUpdate,
  getPendingProposal,
  proposeMemoryWrite,
  writeMemoryDirect,
} from "./proposals";
import { buildRecallDecision, contextBundleFromRecall } from "./recall";
import { detectConflicts } from "./conflicts";
import type { CoreMemoryInput, CoreMemoryResult } from "./types";
import { SPARK_CORE_MEMORY_ENGINE_VERSION } from "./types";

export function runCoreMemory(input: CoreMemoryInput): CoreMemoryResult {
  const recall = buildRecallDecision(input.userId, input.memberMessage);
  const contextBundle = contextBundleFromRecall(recall.recalledFacts);

  if (input.activeRoom && !contextBundle.preferred_rooms) {
    const rooms = recall.recalledFacts.find((r) => r.key === "preferred_rooms");
    if (!rooms) {
      contextBundle.preferred_rooms = [input.activeRoom];
    }
  }

  const extracted = extractFactsFromMessage(input.memberMessage);
  const pendingProposals = extracted.map((fact) =>
    proposeMemoryWrite({
      userId: input.userId,
      key: fact.key,
      proposedValue: fact.value,
      sourceText: input.memberMessage,
      provenance: fact.provenance,
      explicitConsent: input.rememberConsent ?? /\bremember\b/i.test(input.memberMessage),
    }),
  );

  const conflicts = detectConflicts(
    input.userId,
    extracted.map((f) => ({ key: f.key, value: f.value })),
  );

  let egress: CoreMemoryResult["egress"];

  if (input.confirmedProposalId) {
    confirmMemoryUpdate(input.userId, input.confirmedProposalId);
  } else {
    const needsPrompt = pendingProposals.find(
      (p) => !p.blocked && p.requiresConfirmation,
    );
    if (needsPrompt?.promptText) {
      egress = {
        rememberPrompt: {
          proposalId: needsPrompt.id,
          promptText: needsPrompt.promptText,
        },
      };
    } else {
      const hasConflict = conflicts.length > 0;
      const autoWrite = pendingProposals.find(
        (p) => !p.blocked && !p.requiresConfirmation && !hasConflict,
      );
      if (autoWrite) {
        writeMemoryDirect({
          userId: input.userId,
          key: autoWrite.key,
          value: autoWrite.proposedValue,
          provenance: autoWrite.provenance,
        });
      }
    }

    const conflict = conflicts[0];
    if (conflict && !egress?.rememberPrompt) {
      egress = {
        ...egress,
        confirmationPrompt: {
          conflictId: conflict.existingId,
          promptText: conflict.promptText,
        },
      };
    }
  }

  if (recall.staleFacts.length > 0 && !egress?.confirmationPrompt) {
    const stale = recall.staleFacts[0];
    egress = {
      ...egress,
      confirmationPrompt: {
        conflictId: stale.id,
        promptText: `I still have "${stale.value}" for your ${String(stale.key).replace(/_/g, " ")} — is that still right?`,
      },
    };
  }

  const profile = buildMemoryProfile(input.userId);
  if (profile.totalActive > 0 && recall.recalledFacts.length >= 3) {
    egress = {
      ...egress,
      profileHint: "Using what I already know about your business — tell me if anything has changed.",
    };
  }

  return {
    ingress: {
      recall,
      contextBundle,
      pendingProposals: pendingProposals.filter((p) => !p.blocked),
      conflicts,
    },
    egress,
    readyToPersonalize: recall.recalledFacts.length > 0 || profile.totalActive > 0,
    engineVersion: SPARK_CORE_MEMORY_ENGINE_VERSION,
  };
}

export {
  confirmMemoryUpdate,
  deleteMemory,
  editMemory,
  exportMemory,
  getPendingProposal,
  proposeMemoryWrite,
  writeMemoryDirect,
  clearPendingProposals,
} from "./proposals";
export { buildMemoryProfile } from "./profile";
export { buildRecallDecision, contextBundleFromRecall } from "./recall";
export { applyMemoryAging } from "./aging";
export { detectConflict, detectConflicts } from "./conflicts";
export { clearMemoryStore } from "./store";
export type { CoreMemoryInput, CoreMemoryResult } from "./types";
