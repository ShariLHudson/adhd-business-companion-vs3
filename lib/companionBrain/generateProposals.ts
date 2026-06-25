/**
 * Proposal Generation™ — prepare options, never auto-commit.
 * @see constitution.ts — generateProposals
 */

import type {
  AssembledContext,
  CompanionProposal,
  MomentumAction,
} from "./types";

function proposalCap(ctx: AssembledContext): number {
  if (ctx.cycleState === "protected") return 0;
  if (ctx.dayMode === "celebration") return 0;
  if (ctx.orientationOnly) return 1;
  if (ctx.dayMode === "recovery") return 1;
  if (ctx.dayMode === "survival") return 2;
  if (ctx.dayMode === "family") return 1;
  if (ctx.dayMode === "health") return 2;
  if (ctx.dayMode === "creative") return 2;
  if (ctx.capacity.energy === "high" && ctx.capacity.motivation === "scattered") {
    return 4;
  }
  return 4;
}

export function generateProposals(
  ctx: AssembledContext,
  momentum: MomentumAction,
): CompanionProposal[] {
  const cap = proposalCap(ctx);
  if (cap === 0) return [];

  const proposals: CompanionProposal[] = [];
  const used = new Set<string>();

  if (momentum.kind === "explorationBlock" && momentum.label) {
    proposals.push({
      id: "proposal-exploration",
      kind: "explorationBlock",
      label: momentum.label,
      reason: momentum.reason,
      durationMinutes: momentum.durationMinutes ?? 45,
    });
    used.add(momentum.label);
  } else if (momentum.candidateId && momentum.label && momentum.kind === "action") {
    proposals.push({
      id: `proposal-${momentum.candidateId}`,
      kind: "action",
      label: momentum.label,
      reason: momentum.reason,
      durationMinutes: momentum.durationMinutes,
    });
    used.add(momentum.candidateId);
  }

  for (const c of ctx.candidates) {
    if (proposals.length >= cap) break;
    if (used.has(c.id)) continue;
    if (ctx.exclusions.some((e) => c.label.toLowerCase().includes(e.toLowerCase()))) {
      continue;
    }
    proposals.push({
      id: `proposal-${c.id}`,
      kind: c.themes.includes("explore") ? "explorationBlock" : "action",
      label: c.label,
      reason: `Fits today's capacity and focus.`,
      durationMinutes: c.estimatedMinutes,
    });
    used.add(c.id);
  }

  return proposals.slice(0, cap);
}
