/**
 * 050 — Conflict resolution: owner synthesizes; Board never overwrites Chamber.
 */

import { resolveOwnership } from "./resolveOwnership";
import type { ConflictSynthesisResult } from "./types";

export type ContributorAdvice = {
  from: string;
  advice: string;
  weight?: "suggestion" | "risk" | "requirement";
};

/**
 * Synthesize conflicting contributor / Board advice into one owner-led guidance.
 */
export function synthesizeOwnershipConflict(input: {
  blueprintId?: string | null;
  assetTypeId?: string | null;
  advice: ContributorAdvice[];
  userMustDecide?: boolean;
}): ConflictSynthesisResult {
  const ownership = resolveOwnership({
    blueprintId: input.blueprintId,
    assetTypeId: input.assetTypeId,
  });
  const owner = String(ownership.primaryOwner);
  const considerations = input.advice.map(
    (a) => `${a.from}: ${a.advice}${a.weight === "risk" ? " (risk)" : ""}`,
  );

  const risks = input.advice.filter((a) => a.weight === "risk");
  const requirements = input.advice.filter((a) => a.weight === "requirement");

  let synthesizedGuidance: string;
  if (requirements.length && !input.userMustDecide) {
    synthesizedGuidance = `We'll follow ${owner}'s lead and honor the hard constraint: ${requirements[0]!.advice}. Other views are noted.`;
  } else if (input.userMustDecide) {
    synthesizedGuidance = `There is a real tradeoff here. ${considerations.slice(0, 2).join(" · ")} Which direction feels right to you?`;
  } else {
    synthesizedGuidance = `I've weighed the perspectives and I'm staying with ${owner}'s path while keeping these in view: ${considerations
      .slice(0, 2)
      .join("; ")}.`;
  }

  return {
    synthesizedGuidance,
    deferredToOwner: owner,
    userDecisionNeeded: Boolean(input.userMustDecide),
    recordedRationale: `Deferred to ${owner} per ${ownership.conflictPolicy}. Risks noted: ${risks.length}.`,
    considerations,
  };
}

/**
 * Unified response — one coherent reply, Shari voice, owner synthesizes.
 */
export function buildUnifiedOwnerResponse(input: {
  ownerVoice: string;
  contributorNotes?: string[];
  nextStep?: string | null;
}): string {
  const parts = [input.ownerVoice.trim()];
  // Never dump internal agent chatter — fold notes silently into one line max
  if (input.contributorNotes?.length) {
    const folded = input.contributorNotes
      .map((n) => n.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(" ");
    if (folded && !input.ownerVoice.includes(folded.slice(0, 40))) {
      // Keep as soft continuity, not attribution theater
      parts.push(folded);
    }
  }
  if (input.nextStep?.trim()) {
    parts.push(input.nextStep.trim());
  }
  return parts.filter(Boolean).join("\n\n");
}
