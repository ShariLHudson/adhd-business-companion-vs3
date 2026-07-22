/**
 * Format Chamber knowledge contracts for the existing chat hint path
 * (chamberMemberHintForChat → companion-chat intentHint).
 *
 * Never expose pack IDs, file paths, or retrieval mechanics to the member.
 * Paths are listed for the model as internal authority references only.
 */

import {
  chamberKnowledgeShouldAugmentChat,
  loadChamberKnowledge,
} from "./loadChamberKnowledge";
import type { ChamberKnowledgeRetrievalSlice } from "./types";

export function formatChamberKnowledgePromptBlock(
  slice: ChamberKnowledgeRetrievalSlice,
): string {
  if (!slice.contract) return "";

  const c = slice.contract;
  const pathNote =
    slice.selectedPaths.length > 0
      ? [
          "",
          "INTERNAL KNOWLEDGE AUTHORITY (do not name files or pack IDs to the member):",
          ...slice.selectedPaths.slice(0, 12).map((p) => `- ${p}`),
          slice.selectedPaths.length > 12
            ? `- … +${slice.selectedPaths.length - 12} more paths`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  const bridgeNote =
    slice.runtimeBridge === "eventsIntelligence"
      ? "\nRuntime bridge: Events Intelligence (lib/eventsIntelligence) — keep using Event Record / foundation guide behavior."
      : "";

  return [
    `CHAMBER KNOWLEDGE LIBRARY ACTIVE (BINDING — ${c.memberId}):`,
    `Library version: ${c.libraryVersion}`,
    `Wiring: ${slice.wiringStatus}`,
    bridgeNote,
    "",
    "PRIMARY OWNERSHIP (stay in lane):",
    ...c.primaryOwns.map((line) => `- ${line}`),
    "",
    "DOES NOT OWN (bridge; do not absorb):",
    ...c.doesNotOwn.map((line) => `- ${line}`),
    "",
    "SAFETY / PRODUCTION RULES:",
    ...c.safetyRules.map((line) => `- ${line}`),
    ...c.productionCompletionRules.map((line) => `- ${line}`),
    "",
    "COLLABORATION BRIDGES (when clearly multi-domain):",
    ...c.collaborationBridges.map((line) => `- ${line}`),
    "",
    "RETRIEVAL POSTURE:",
    `- Prefer this library when signals match: ${c.retrievalSignals.slice(0, 10).join("; ")}`,
    `- Do not treat as primary when: ${c.negativeSignals.slice(0, 6).join("; ")}`,
    pathNote,
    "",
    "Apply this expertise silently. Speak as Shari with this member's specialty — never as a help desk quoting a knowledge base.",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

/**
 * Load + format knowledge block for an active Chamber member chat turn.
 */
export function chamberKnowledgeHintForChat(
  memberId: string,
  options?: { domainHint?: string | null; skipFilesystemCheck?: boolean },
): string | null {
  if (!chamberKnowledgeShouldAugmentChat(memberId)) return null;
  const slice = loadChamberKnowledge(memberId, {
    domainHint: options?.domainHint,
    skipFilesystemCheck: options?.skipFilesystemCheck ?? true,
  });
  const block = formatChamberKnowledgePromptBlock(slice);
  return block.trim() ? block : null;
}
