/**
 * Materialize brain proposals into today's plan — after user confirmation only.
 */

import type { CompanionProposal, CompanionJudgmentResult } from "@/lib/companionBrain";
import type { PlanDayItem, PlanItemColumn } from "@/lib/planMyDay/types";
import { saveTodayPlanItems } from "@/lib/planMyDay/planDayItems";
import { whyTodayForItem } from "./whyToday";

function uid(): string {
  return `plan-brain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function columnForProposal(
  proposal: CompanionProposal,
  isMomentum: boolean,
): PlanItemColumn {
  if (proposal.kind === "explorationBlock") return "today";
  return isMomentum ? "today" : "ready";
}

export function proposalsToPlanItems(
  proposals: CompanionProposal[],
  momentumProposalId: string | null,
  judgment?: CompanionJudgmentResult,
): PlanDayItem[] {
  return proposals.map((p) => {
    const draft: PlanDayItem = {
      id: uid(),
      title: p.label,
      durationMinutes: p.durationMinutes,
      flexible: !p.durationMinutes,
      column: columnForProposal(p, p.id === momentumProposalId),
      done: false,
      createdAt: new Date().toISOString(),
      notes: p.reason,
    };
    return {
      ...draft,
      notes: judgment ? whyTodayForItem(draft, judgment) : p.reason,
    };
  });
}

export function materializeConfirmedProposals(
  existing: PlanDayItem[],
  proposals: CompanionProposal[],
  momentumCandidateId: string | null,
  judgment?: CompanionJudgmentResult,
): PlanDayItem[] {
  if (!proposals.length) return existing;

  const existingTitles = new Set(
    existing.map((i) => i.title.trim().toLowerCase()),
  );
  const momentumProposalId = momentumCandidateId
    ? `proposal-${momentumCandidateId}`
    : proposals[0]?.id ?? null;

  const fresh = proposalsToPlanItems(
    proposals,
    momentumProposalId,
    judgment,
  ).filter((item) => !existingTitles.has(item.title.trim().toLowerCase()));

  if (!fresh.length) return existing;
  return saveTodayPlanItems([...existing, ...fresh]);
}
