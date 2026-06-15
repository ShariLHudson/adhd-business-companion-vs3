/**
 * Chief of Staff signals — aggregate intelligence for executive focus.
 */

import { evaluateBusinessOS } from "@/lib/business-os/businessEngine";
import type { BusinessOSSnapshot } from "@/lib/business-os/types";
import { getProjects } from "@/lib/companionStore";
import { buildFounderDecisionReport } from "@/lib/decision-intelligence/founderDecisionReporting";
import { buildFounderMorningBriefing } from "@/lib/founder-briefing/briefingEngine";
import { buildFounderMomentumReport } from "@/lib/momentum-intelligence/founderMomentumReporting";
import { getOpportunities } from "@/lib/opportunity-intelligence/opportunityStore";
import { buildFounderRecoveryReport } from "@/lib/recovery-intelligence/founderRecoveryReporting";
import { getRecoveryStore } from "@/lib/recovery-intelligence/recoveryStore";
import { buildFounderRelationshipReport } from "@/lib/relationship-intelligence/founderRelationshipReporting";
import type { ChiefOfStaffInput } from "./types";

export type ChiefSignalContext = {
  now: Date;
  businessOS: BusinessOSSnapshot;
  briefingPriorities: string[];
  briefingRisks: string[];
  briefingOpportunities: string[];
  activeProjects: { id: string; name: string; horizon: string; status: string }[];
  newOpportunityCount: number;
  followUpCount: number;
  recoveryStrained: boolean;
  momentumStalled: boolean;
  decisionFatigue: boolean;
  text: string;
};

export function gatherChiefSignals(
  input: ChiefOfStaffInput = {},
): ChiefSignalContext {
  const now = input.now ?? new Date();
  const text = input.text?.trim() ?? "";
  const businessOS = evaluateBusinessOS({ now, text });
  const briefing = buildFounderMorningBriefing(now);
  const recoveryReport = buildFounderRecoveryReport(now);
  const momentumReport = buildFounderMomentumReport(now);
  const decisionReport = buildFounderDecisionReport(now);
  const relationshipReport = buildFounderRelationshipReport(now);

  const recoveryStore = getRecoveryStore();
  const latestRecovery = recoveryStore.history[recoveryStore.history.length - 1];

  const projects = getProjects()
    .filter((p) => p.status !== "completed")
    .map((p) => ({
      id: p.id,
      name: p.name,
      horizon: p.horizon,
      status: p.status,
    }));

  const newOpps = getOpportunities().filter((o) => o.status === "suggested");

  return {
    now,
    businessOS,
    briefingPriorities: briefing.topPriorities.map((p) => p.title),
    briefingRisks: briefing.risks.map((r) => r.title),
    briefingOpportunities: briefing.opportunities.map((o) => o.title),
    activeProjects: projects,
    newOpportunityCount: newOpps.length,
    followUpCount: relationshipReport.followUpOpportunities.length,
    recoveryStrained:
      recoveryReport.burnoutRiskCount > 0 ||
      latestRecovery?.recoveryLevel === "depleted" ||
      latestRecovery?.recoveryLevel === "burnout_risk",
    momentumStalled: momentumReport.stalledCount >= 2,
    decisionFatigue: decisionReport.stuckInLoopCount >= 2,
    text,
  };
}

export function shouldEvaluateChiefPerspective(text: string): boolean {
  return /\b(chief of staff|what matters|prioriti[sz]e|focus today|executive|overwhelm|too much|what should i ignore|ignore list)\b/i.test(
    text,
  );
}
