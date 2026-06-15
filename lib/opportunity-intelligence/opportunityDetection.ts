/**
 * Map raw signals to explainable opportunity candidates.
 */

import type {
  Opportunity,
  OpportunitySignalHit,
  OpportunityType,
} from "./types";
import { scoreOpportunity } from "./opportunityScoring";
import { buildOpportunityTitle, suggestedStepForType } from "./opportunityMessages";

export type OpportunityCandidate = {
  opportunityType: OpportunityType;
  title: string;
  source: OpportunitySignalHit["source"];
  reason: string;
  signals: OpportunitySignalHit[];
  totalWeight: number;
};

export function detectOpportunityCandidates(
  hits: OpportunitySignalHit[],
): OpportunityCandidate[] {
  const groups = new Map<string, OpportunityCandidate>();

  for (const hit of hits) {
    const key = `${hit.opportunityType}:${hit.topic}`;
    const prev = groups.get(key);
    if (prev) {
      prev.signals.push(hit);
      prev.totalWeight += hit.weight;
      if (!prev.reason.includes(hit.detail)) {
        prev.reason = `${prev.reason}; ${hit.detail}`;
      }
    } else {
      groups.set(key, {
        opportunityType: hit.opportunityType,
        title: buildOpportunityTitle(hit.opportunityType, hit.topic),
        source: hit.source,
        reason: hit.detail,
        signals: [hit],
        totalWeight: hit.weight,
      });
    }
  }

  return [...groups.values()]
    .filter((c) => c.totalWeight >= 3)
    .sort((a, b) => b.totalWeight - a.totalWeight);
}

export function candidateToOpportunity(
  candidate: OpportunityCandidate,
  now = new Date(),
): Opportunity {
  const scored = scoreOpportunity(candidate);
  const ts = now.toISOString();
  const id = stableOpportunityId(candidate);
  return {
    id,
    title: candidate.title,
    opportunityType: candidate.opportunityType,
    source: candidate.source,
    confidence: scored.confidence,
    impact: scored.impact,
    effort: scored.effort,
    urgency: scored.urgency,
    reason: candidate.reason,
    suggestedNextStep: suggestedStepForType(candidate.opportunityType),
    status: "suggested",
    createdAt: ts,
    updatedAt: ts,
  };
}

export function pickTopOpportunity(
  opportunities: Opportunity[],
): Opportunity | null {
  if (!opportunities.length) return null;
  return [...opportunities].sort((a, b) => priorityScore(b) - priorityScore(a))[0] ?? null;
}

export function priorityScore(o: Opportunity): number {
  const level = (l: string) => (l === "high" ? 3 : l === "medium" ? 2 : 1);
  return level(o.impact) * 2 - level(o.effort) + level(o.confidence);
}

function stableOpportunityId(candidate: OpportunityCandidate): string {
  const base = `${candidate.opportunityType}:${candidate.title}`.toLowerCase();
  let h = 0;
  for (let i = 0; i < base.length; i++) {
    h = (h * 31 + base.charCodeAt(i)) | 0;
  }
  return `opp-${Math.abs(h)}`;
}
