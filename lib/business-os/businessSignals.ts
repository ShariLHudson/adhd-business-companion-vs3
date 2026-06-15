/**
 * Business signals from existing intelligence systems and app state.
 */

import { getProjects } from "@/lib/companionStore";
import { listDocumentMetadata } from "@/lib/documentMetadataStore";
import { buildFounderDecisionReport } from "@/lib/decision-intelligence/founderDecisionReporting";
import { getDecisionStore } from "@/lib/decision-intelligence/decisionStore";
import { buildFounderMorningBriefing } from "@/lib/founder-briefing/briefingEngine";
import { getLoopStore } from "@/lib/loop-intelligence/loopStore";
import { buildFounderMomentumReport } from "@/lib/momentum-intelligence/founderMomentumReporting";
import { getMomentumStore } from "@/lib/momentum-intelligence/momentumStore";
import {
  getOpportunities,
  getOpportunityStore,
} from "@/lib/opportunity-intelligence/opportunityStore";
import { buildFounderRecoveryReport } from "@/lib/recovery-intelligence/founderRecoveryReporting";
import { getRecoveryStore } from "@/lib/recovery-intelligence/recoveryStore";
import {
  getRelationships,
  getRelationshipStore,
} from "@/lib/relationship-intelligence/relationshipStore";
import { buildFounderUserHealthReport } from "@/lib/user-health/founderUserHealthReporting";
import type { BusinessArea, BusinessOSInput } from "./types";

const MS_DAY = 86_400_000;

export type BusinessSignalHit = {
  id: string;
  area: BusinessArea;
  label: string;
  reason: string;
  weight: number;
  kind: "risk" | "opportunity" | "friction" | "capacity";
};

export type BusinessSignalContext = {
  now: Date;
  hits: BusinessSignalHit[];
  activeProjectCount: number;
  stalledProjectCount: number;
  followUpCount: number;
  workflowFrictionCount: number;
  revenuePlaceholderCount: number;
  marketingIdeaCount: number;
  deliveryLoadCount: number;
  supportFrictionCount: number;
  founderBottleneckCount: number;
};

export function gatherBusinessSignals(
  input: BusinessOSInput = {},
): BusinessSignalContext {
  const now = input.now ?? new Date();
  const hits: BusinessSignalHit[] = [];
  const text = input.text?.trim() ?? "";

  collectProjectSignals(hits);
  collectOpportunitySignals(hits);
  collectRelationshipSignals(hits, now);
  collectDecisionSignals(hits);
  collectMomentumSignals(hits);
  collectRecoverySignals(hits);
  collectUserHealthSignals(hits);
  collectWorkflowMemorySignals(hits);
  collectOutcomeSignals(hits);
  collectBriefingSignals(hits, now);
  collectTextSignals(hits, text);

  return {
    now,
    hits,
    activeProjectCount: countHits(hits, "too_many_projects"),
    stalledProjectCount: countHits(hits, "stalled_offer"),
    followUpCount: countHits(hits, "missing_follow_up"),
    workflowFrictionCount: countHits(hits, "workflow_friction"),
    revenuePlaceholderCount: countHits(hits, "revenue_placeholder"),
    marketingIdeaCount: countHits(hits, "marketing_inconsistency"),
    deliveryLoadCount: countHits(hits, "delivery_overload"),
    supportFrictionCount: countHits(hits, "support_friction"),
    founderBottleneckCount: countHits(hits, "founder_bottleneck"),
  };
}

function countHits(hits: BusinessSignalHit[], idPrefix: string): number {
  return hits.filter((h) => h.id.startsWith(idPrefix)).length;
}

function collectProjectSignals(hits: BusinessSignalHit[]): void {
  const projects = getProjects();
  const activeNow = projects.filter(
    (p) =>
      p.horizon === "now" &&
      p.status !== "completed" &&
      p.status !== "paused",
  );
  const stalled = projects.filter(
    (p) =>
      p.horizon === "now" &&
      p.status === "in-progress" &&
      (!p.nextAction?.trim() || p.nextAction.toLowerCase() === "tbd"),
  );

  if (activeNow.length >= 4) {
    hits.push({
      id: "too_many_projects",
      area: "projects",
      label: "Several active projects",
      reason: `${activeNow.length} projects marked "now"`,
      weight: Math.min(8, activeNow.length),
      kind: "risk",
    });
  }

  for (const p of stalled.slice(0, 3)) {
    hits.push({
      id: `stalled_offer_${p.id}`,
      area: "offers",
      label: `Stalled: ${p.name}`,
      reason: "In progress without a clear next action",
      weight: 4,
      kind: "risk",
    });
  }

  const deliveryHeavy = projects.filter(
    (p) =>
      p.status === "active-focus" || p.status === "in-progress",
  );
  if (deliveryHeavy.length >= 3) {
    hits.push({
      id: "delivery_overload",
      area: "delivery",
      label: "Delivery load is high",
      reason: `${deliveryHeavy.length} projects in active delivery`,
      weight: 5,
      kind: "risk",
    });
  }
}

function collectOpportunitySignals(hits: BusinessSignalHit[]): void {
  const opportunities = getOpportunities().filter((o) => o.status !== "dismissed");
  const contentIdeas = opportunities.filter((o) =>
    ["content_opportunity", "lead_magnet_opportunity", "workshop_opportunity"].includes(
      o.opportunityType,
    ),
  );
  const offerIdeas = opportunities.filter(
    (o) => o.opportunityType === "offer_opportunity",
  );
  const revenueSignals = opportunities.filter(
    (o) =>
      o.opportunityType === "offer_opportunity" ||
      o.opportunityType === "lead_magnet_opportunity" ||
      o.reason.toLowerCase().includes("revenue") ||
      o.reason.toLowerCase().includes("monetize"),
  );

  if (contentIdeas.length >= 2 && !contentIdeas.some((o) => o.urgency === "high")) {
    hits.push({
      id: "marketing_inconsistency",
      area: "marketing",
      label: "Marketing ideas without a current campaign",
      reason: `${contentIdeas.length} content ideas, no clear active campaign`,
      weight: 4,
      kind: "friction",
    });
  }

  if (offerIdeas.length >= 2) {
    hits.push({
      id: "stalled_offer_ideas",
      area: "offers",
      label: "Multiple offer ideas open",
      reason: `${offerIdeas.length} offer concepts not yet focused`,
      weight: 4,
      kind: "risk",
    });
  }

  for (const o of revenueSignals.slice(0, 2)) {
    hits.push({
      id: `revenue_placeholder_${o.id}`,
      area: "finances",
      label: o.title,
      reason: "Revenue or monetization signal worth reviewing",
      weight: 3,
      kind: "opportunity",
    });
  }

  const workflowOpps = opportunities.filter(
    (o) => o.opportunityType === "workflow_opportunity",
  );
  for (const o of workflowOpps.slice(0, 2)) {
    hits.push({
      id: `workflow_friction_${o.id}`,
      area: "operations",
      label: o.title,
      reason: "Repeatable workflow may be ready to systematize",
      weight: 4,
      kind: "opportunity",
    });
  }

  const productFriction = opportunities.filter(
    (o) => o.opportunityType === "product_opportunity",
  );
  for (const o of productFriction.slice(0, 2)) {
    hits.push({
      id: `support_friction_${o.id}`,
      area: "customer_support",
      label: o.title,
      reason: "User friction mentioned — review before adding features",
      weight: 4,
      kind: "friction",
    });
  }
}

function collectRelationshipSignals(hits: BusinessSignalHit[], now: Date): void {
  const relationships = getRelationships();
  const followUps: string[] = [];

  for (const r of relationships) {
    if (r.nextSuggestedTouchpoint) {
      followUps.push(r.name);
      continue;
    }
    if (r.lastInteraction) {
      const days =
        (now.getTime() - new Date(r.lastInteraction).getTime()) / MS_DAY;
      if (days >= 14) followUps.push(r.name);
    }
  }

  if (followUps.length > 0) {
    hits.push({
      id: "missing_follow_up",
      area: "relationships",
      label: `${followUps.length} possible follow-up${followUps.length > 1 ? "s" : ""}`,
      reason: "Warm relationships worth a gentle touch",
      weight: Math.min(6, followUps.length + 2),
      kind: "opportunity",
    });
  }

  const warmPartners = relationships.filter((r) =>
    ["collaborator", "referral_partner", "client"].includes(r.relationshipType),
  );
  if (warmPartners.length >= 3 && followUps.length === 0) {
    hits.push({
      id: "relationship_opportunity",
      area: "relationships",
      label: "Relationship network active",
      reason: `${warmPartners.length} warm connections tracked`,
      weight: 3,
      kind: "opportunity",
    });
  }

  void getRelationshipStore();
}

function collectDecisionSignals(hits: BusinessSignalHit[]): void {
  const report = buildFounderDecisionReport();
  const store = getDecisionStore();
  const recent = store.history.slice(-10);

  if (report.parkedCount > report.resolvedCount) {
    hits.push({
      id: "founder_bottleneck_decisions",
      area: "founder_capacity",
      label: "Unresolved decisions parked",
      reason: `${report.parkedCount} parked vs ${report.resolvedCount} resolved`,
      weight: 5,
      kind: "capacity",
    });
  }

  if (report.stuckInLoopCount >= 2) {
    hits.push({
      id: "founder_bottleneck_decision_loops",
      area: "founder_capacity",
      label: "Decision fatigue pattern",
      reason: `${report.stuckInLoopCount} stuck decision loops`,
      weight: 5,
      kind: "capacity",
    });
  }

  if (recent.filter((d) => d.decisionState === "stuck").length >= 2) {
    hits.push({
      id: "founder_bottleneck",
      area: "founder_capacity",
      label: "Founder attention split across decisions",
      reason: "Multiple stuck decisions detected",
      weight: 6,
      kind: "capacity",
    });
  }
}

function collectMomentumSignals(hits: BusinessSignalHit[]): void {
  const report = buildFounderMomentumReport();
  const store = getMomentumStore();
  const latest = store.history[store.history.length - 1];

  if (report.stalledCount >= 2) {
    hits.push({
      id: "founder_bottleneck_momentum",
      area: "founder_capacity",
      label: "Momentum has stalled recently",
      reason: `${report.stalledCount} stalled momentum samples`,
      weight: 4,
      kind: "capacity",
    });
  }

  if (latest?.momentumLevel === "strong" || latest?.momentumLevel === "building") {
    hits.push({
      id: "momentum_opportunity",
      area: "projects",
      label: "Momentum is building",
      reason: "Protect current movement before adding load",
      weight: 3,
      kind: "opportunity",
    });
  }
}

function collectRecoverySignals(hits: BusinessSignalHit[]): void {
  const report = buildFounderRecoveryReport();
  const store = getRecoveryStore();
  const latest = store.history[store.history.length - 1];

  if (report.burnoutRiskCount > 0) {
    hits.push({
      id: "founder_bottleneck_burnout",
      area: "founder_capacity",
      label: "Recovery needs attention",
      reason: `${report.burnoutRiskCount} burnout-risk signal(s)`,
      weight: 7,
      kind: "capacity",
    });
  }

  if (
    latest?.recoveryLevel === "depleted" ||
    latest?.recoveryLevel === "burnout_risk"
  ) {
    hits.push({
      id: "founder_bottleneck_recovery",
      area: "founder_capacity",
      label: "Founder load appears high",
      reason: "Energy recovery should come before growth pressure",
      weight: 8,
      kind: "capacity",
    });
  }
}

function collectUserHealthSignals(hits: BusinessSignalHit[]): void {
  const report = buildFounderUserHealthReport();

  if (report.overloadedCount >= 2) {
    hits.push({
      id: "founder_bottleneck_overload",
      area: "founder_capacity",
      label: "Cognitive overload pattern",
      reason: `${report.overloadedCount} overloaded samples this week`,
      weight: 6,
      kind: "capacity",
    });
  }
}

function collectWorkflowMemorySignals(hits: BusinessSignalHit[]): void {
  const store = getOpportunityStore();
  const workflowSamples = store.founderSamples.filter((s) =>
    s.type.includes("workflow"),
  );
  const loopStore = getLoopStore();
  const planningLoops = loopStore.snapshots.filter(
    (s) => s.loopType === "planning_loop" || s.loopType === "research_loop",
  );
  const docs = listDocumentMetadata();
  const sopDocs = docs.filter((d) =>
    /sop|workflow|process|checklist/i.test(d.type + d.title),
  );

  if (workflowSamples.length >= 2 || planningLoops.length >= 2) {
    hits.push({
      id: "workflow_friction_repeat",
      area: "operations",
      label: "Repeated setup steps detected",
      reason: "A workflow may be ready to become a system",
      weight: 4,
      kind: "opportunity",
    });
  }

  if (sopDocs.length >= 1 && workflowSamples.length >= 1) {
    hits.push({
      id: "workflow_friction_sop",
      area: "operations",
      label: "SOP patterns emerging",
      reason: `${sopDocs.length} documented process(es) tracked`,
      weight: 3,
      kind: "opportunity",
    });
  }
}

function collectOutcomeSignals(hits: BusinessSignalHit[]): void {
  const momentum = getMomentumStore();
  const recentWins = momentum.history
    .slice(-5)
    .flatMap((s) => s.wins)
    .slice(0, 3);

  for (const win of recentWins) {
    hits.push({
      id: `outcome_win_${win.id}`,
      area: "delivery",
      label: win.label,
      reason: "Recent outcome completed",
      weight: 2,
      kind: "opportunity",
    });
  }

  const completedProjects = getProjects().filter((p) => p.status === "completed");
  if (completedProjects.length > 0) {
    const latest = completedProjects[completedProjects.length - 1]!;
    hits.push({
      id: `outcome_project_${latest.id}`,
      area: "projects",
      label: `Completed: ${latest.name}`,
      reason: "Project outcome reached",
      weight: 2,
      kind: "opportunity",
    });
  }
}

function collectBriefingSignals(hits: BusinessSignalHit[], now: Date): void {
  const briefing = buildFounderMorningBriefing(now);

  for (const risk of briefing.risks.slice(0, 2)) {
    hits.push({
      id: `briefing_risk_${risk.id}`,
      area: mapBriefingSourceToArea(risk.source),
      label: risk.title,
      reason: risk.reason,
      weight: risk.weight,
      kind: "risk",
    });
  }

  for (const opp of briefing.opportunities.slice(0, 2)) {
    hits.push({
      id: `briefing_opp_${opp.id}`,
      area: mapBriefingSourceToArea(opp.source),
      label: opp.title,
      reason: opp.reason,
      weight: opp.weight,
      kind: "opportunity",
    });
  }
}

function mapBriefingSourceToArea(source: string): BusinessArea {
  switch (source) {
    case "relationship":
      return "relationships";
    case "opportunity":
      return "marketing";
    case "decision":
      return "founder_capacity";
    case "recovery":
    case "user_health":
      return "founder_capacity";
    case "loop":
      return "operations";
    default:
      return "projects";
  }
}

function collectTextSignals(hits: BusinessSignalHit[], text: string): void {
  if (!text) return;

  if (/\b(too many projects|scattered|all over the place|moving pieces)\b/i.test(text)) {
    hits.push({
      id: "too_many_projects_text",
      area: "projects",
      label: "Several moving pieces mentioned",
      reason: "User named fragmentation in conversation",
      weight: 5,
      kind: "risk",
    });
  }

  if (/\b(follow up|haven'?t emailed|need to reach out)\b/i.test(text)) {
    hits.push({
      id: "missing_follow_up_text",
      area: "relationships",
      label: "Follow-up on user's mind",
      reason: "Mentioned in conversation",
      weight: 4,
      kind: "opportunity",
    });
  }

  if (/\b(launch|campaign|marketing|content calendar)\b/i.test(text)) {
    hits.push({
      id: "marketing_inconsistency_text",
      area: "marketing",
      label: "Marketing on user's mind",
      reason: "Mentioned in conversation",
      weight: 3,
      kind: "friction",
    });
  }
}

export function shouldEvaluateBusinessOS(text: string): boolean {
  return /\b(business|company|offers?|marketing|sales|revenue|clients?|customers?|projects?|overwhelm|moving pieces|prioriti[sz]e|what matters)\b/i.test(
    text,
  );
}
