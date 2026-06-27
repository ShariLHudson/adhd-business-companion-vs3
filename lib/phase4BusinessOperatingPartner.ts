/**
 * Phase 4 — Business Operating Partner
 * From anticipation to business partnership. Help run the business, not just conversations.
 */

import { evaluateBusinessOS } from "./business-os/businessEngine";
import type { BusinessOSSnapshot } from "./business-os/types";
import { getProjects, getBusinessProfile } from "./companionStore";
import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import { getRecentConfidenceWins } from "./companionConfidenceEngine";
import { isPhase1OnboardingComplete } from "./phase1Onboarding";
import {
  getPhase2DiscoveryState,
  type ResourcePreferenceId,
} from "./phase2ProgressiveDiscovery";
import {
  buildUserOperatingManual,
  daysSinceRelationshipStart,
  isPhase3AdaptiveRelationshipActive,
  type UserOperatingManual,
} from "./phase3AdaptiveRelationship";

export type BusinessHealthDimension =
  | "momentum"
  | "confidence"
  | "visibility"
  | "sales_activity"
  | "follow_through";

export type HealthMeaning = "growing" | "stable" | "slowing" | "building" | "declining" | "consistent" | "inconsistent" | "healthy" | "needs_attention" | "strong" | "moderate" | "at_risk";

export type BusinessHealthDashboard = {
  momentum: HealthMeaning;
  confidence: HealthMeaning;
  visibility: HealthMeaning;
  salesActivity: HealthMeaning;
  followThrough: HealthMeaning;
  narrative: string;
  updatedAt: string;
};

export type BusinessOpportunityId =
  | "unfollowed_leads"
  | "unused_content"
  | "abandoned_launch"
  | "unfinished_project"
  | "unused_strategy"
  | "content_theme"
  | "bottleneck"
  | "revenue_opportunity";

export type BusinessOpportunity = {
  id: BusinessOpportunityId;
  label: string;
  reason: string;
  impact: "low" | "medium" | "high";
};

export type MomentumActivityId =
  | "content_creation"
  | "sales_conversation"
  | "client_outreach"
  | "offer_refinement"
  | "launch_activity"
  | "decision_compass"
  | "create";

export type BusinessOperatingManual = {
  howBusinessGrows: {
    bestContentChannels: string[];
    bestLeadSources: string[];
    strongestOffers: string[];
    mostEffectiveResources: string[];
    highestMomentumActivities: string[];
    recurringBottlenecks: string[];
    avoidancePatterns: string[];
  };
  userManual: UserOperatingManual;
  updatedAt: string;
};

export type Phase4BusinessPartnerState = {
  momentumActivities: Partial<Record<MomentumActivityId, number>>;
  opportunitiesSurfaced: number;
  proactiveOffersShown: number;
  lastProactiveOfferAt?: string;
  checkpointsShown: Record<"90" | "180" | "365", boolean>;
  founderMetrics: {
    proactiveAccepted: number;
    proactiveDeclined: number;
    opportunityAwarenessShown: number;
    recommendationHelpful: number;
  };
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase4-business-operating-partner-v1";
const MIN_PHASE4_DAYS = 30;
const MIN_PHASE4_SESSIONS = 12;
const PROACTIVE_COOLDOWN_MS = 4 * 24 * 60 * 60 * 1000;

const MOMENTUM_SIGNALS: { re: RegExp; id: MomentumActivityId }[] = [
  { re: /\b(?:write|draft|post|content|blog|newsletter|video)\b/i, id: "content_creation" },
  { re: /\b(?:sales call|discovery call|client call|pitch)\b/i, id: "sales_conversation" },
  { re: /\b(?:outreach|follow up|reach out|email.*client)\b/i, id: "client_outreach" },
  { re: /\b(?:offer|package|pricing|program)\b/i, id: "offer_refinement" },
  { re: /\b(?:launch|ship|publish|release)\b/i, id: "launch_activity" },
];

function defaultState(): Phase4BusinessPartnerState {
  const now = new Date().toISOString();
  return {
    momentumActivities: {},
    opportunitiesSurfaced: 0,
    proactiveOffersShown: 0,
    checkpointsShown: { "90": false, "180": false, "365": false },
    founderMetrics: {
      proactiveAccepted: 0,
      proactiveDeclined: 0,
      opportunityAwarenessShown: 0,
      recommendationHelpful: 0,
    },
    updatedAt: now,
  };
}

function readState(): Phase4BusinessPartnerState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: Phase4BusinessPartnerState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase4-partner-updated"));
}

export function getPhase4PartnerState(): Phase4BusinessPartnerState {
  return readState();
}

export function isPhase4BusinessOperatingPartnerActive(now = new Date()): boolean {
  if (!isPhase1OnboardingComplete()) return false;
  if (!isPhase3AdaptiveRelationshipActive(now)) return false;

  const p2 = getPhase2DiscoveryState();
  const days = daysSinceRelationshipStart(now);
  const hasBusinessContext = Boolean(
    p2.business.type || p2.goals.length >= 1 || getBusinessProfile()?.role,
  );

  return (
    hasBusinessContext &&
    (days >= MIN_PHASE4_DAYS || p2.sessionCount >= MIN_PHASE4_SESSIONS)
  );
}

function mapBusinessHealth(snapshot: BusinessOSSnapshot): BusinessHealthDashboard {
  const momentum: HealthMeaning =
    snapshot.businessHealth === "healthy"
      ? "growing"
      : snapshot.businessHealth === "stable"
        ? "stable"
        : "slowing";

  const wins = getRecentConfidenceWins(5).length;
  const confidence: HealthMeaning =
    wins >= 3 ? "building" : wins >= 1 ? "stable" : "declining";

  const marketing = snapshot.businessAreas.find((a) => a.area === "marketing");
  const visibility: HealthMeaning =
    marketing?.status === "healthy"
      ? "consistent"
      : marketing?.status === "watch"
        ? "inconsistent"
        : "growing";

  const sales = snapshot.businessAreas.find((a) => a.area === "sales");
  const salesActivity: HealthMeaning =
    sales?.status === "healthy" ? "healthy" : "needs_attention";

  const projects = getProjects();
  const active = projects.filter((p) => p.status === "in-progress").length;
  const stalled = projects.filter(
    (p) => p.horizon === "now" && p.status === "in-progress",
  ).length;
  const followThrough: HealthMeaning =
    stalled === 0 && active > 0
      ? "strong"
      : stalled <= 1
        ? "moderate"
        : "at_risk";

  const narrative = [
    snapshot.businessHealth !== "unknown"
      ? `Business load feels ${snapshot.businessHealth.replace(/_/g, " ")}.`
      : null,
    snapshot.activeOpportunities[0]?.reason,
    snapshot.activeRisks[0]?.reason,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    momentum,
    confidence,
    visibility,
    salesActivity,
    followThrough,
    narrative: narrative || "Still learning what matters most in your business rhythm.",
    updatedAt: new Date().toISOString(),
  };
}

export function buildBusinessHealthDashboard(
  input?: { text?: string; now?: Date },
): BusinessHealthDashboard {
  const snapshot = evaluateBusinessOS({
    text: input?.text,
    now: input?.now,
  });
  return mapBusinessHealth(snapshot);
}

export function detectBusinessOpportunities(now = new Date()): BusinessOpportunity[] {
  if (!isPhase4BusinessOperatingPartnerActive(now)) return [];

  const snapshot = evaluateBusinessOS({ now });
  const opportunities: BusinessOpportunity[] = [];

  for (const opp of snapshot.activeOpportunities.slice(0, 4)) {
    opportunities.push({
      id: mapOpportunityId(opp.id),
      label: opp.label,
      reason: opp.reason,
      impact: opp.impact,
    });
  }

  const projects = getProjects();
  const abandoned = projects.filter(
    (p) =>
      p.horizon === "now" &&
      p.status === "in-progress" &&
      p.updatedAt &&
      now.getTime() - new Date(p.updatedAt).getTime() > 14 * 86_400_000,
  );
  if (abandoned.length > 0) {
    opportunities.push({
      id: "unfinished_project",
      label: "Unfinished project",
      reason: `${abandoned[0]!.name} has been quiet for a while.`,
      impact: "medium",
    });
  }

  const p2 = getPhase2DiscoveryState();
  if (p2.adhdPatterns.some((p) => p.id === "launch_avoidance" && p.count >= 2)) {
    opportunities.push({
      id: "abandoned_launch",
      label: "Launch may need a gentle restart",
      reason: "Launch activity has gone quiet — awareness only, no pressure.",
      impact: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

function mapOpportunityId(id: string): BusinessOpportunityId {
  if (id.includes("follow")) return "unfollowed_leads";
  if (id.includes("content")) return "unused_content";
  if (id.includes("launch")) return "abandoned_launch";
  if (id.includes("stalled") || id.includes("project")) return "unfinished_project";
  if (id.includes("revenue")) return "revenue_opportunity";
  return "bottleneck";
}

export function observePhase4BusinessTurn(input: {
  userText: string;
  resourceUsed?: ResourcePreferenceId;
  now?: Date;
}): Phase4BusinessPartnerState {
  if (!isPhase4BusinessOperatingPartnerActive(input.now)) return readState();

  const t = input.userText.trim();
  const cur = readState();
  const activities = { ...cur.momentumActivities };

  for (const { re, id } of MOMENTUM_SIGNALS) {
    if (re.test(t)) activities[id] = (activities[id] ?? 0) + 1;
  }
  if (input.resourceUsed === "decision_compass") {
    activities.decision_compass = (activities.decision_compass ?? 0) + 1;
  }
  if (input.resourceUsed === "create") {
    activities.create = (activities.create ?? 0) + 1;
  }

  const next = {
    ...cur,
    momentumActivities: activities,
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  writeState(next);
  return next;
}

export function buildBusinessOperatingManual(): BusinessOperatingManual {
  const userManual = buildUserOperatingManual();
  const p2 = getPhase2DiscoveryState();
  const p4 = readState();
  const profile = getBusinessProfile();
  const effectiveness = getUserInterventionEffectiveness()
    .filter((e) => e.rates.adaptiveWeight >= 55)
    .slice(0, 4)
    .map((e) => e.label);

  const rankedActivities = (
    Object.entries(p4.momentumActivities) as [MomentumActivityId, number][]
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id]) => activityLabel(id));

  return {
    howBusinessGrows: {
      bestContentChannels: profile?.goals.filter((g) => /content|visibility|marketing/i.test(g)) ?? [],
      bestLeadSources: profile?.traits?.length ? profile.traits.slice(0, 3) : [],
      strongestOffers: profile?.sells
        ? [profile.sells]
        : p2.business.primaryOffer
          ? [p2.business.primaryOffer]
          : [],
      mostEffectiveResources: userManual.bestResources.length
        ? userManual.bestResources
        : effectiveness,
      highestMomentumActivities: rankedActivities.length
        ? rankedActivities
        : ["Content creation", "Decision Compass", "Conversation"],
      recurringBottlenecks: userManual.frictionPatterns.slice(0, 4),
      avoidancePatterns: p2.adhdPatterns
        .filter((p) => p.count >= 2)
        .map((p) => p.id.replace(/_/g, " "))
        .slice(0, 4),
    },
    userManual,
    updatedAt: new Date().toISOString(),
  };
}

function activityLabel(id: MomentumActivityId): string {
  const labels: Record<MomentumActivityId, string> = {
    content_creation: "Content creation",
    sales_conversation: "Sales conversations",
    client_outreach: "Client outreach",
    offer_refinement: "Offer refinement",
    launch_activity: "Launch activities",
    decision_compass: "Decision Compass",
    create: "Create",
  };
  return labels[id];
}

export function maybeProactiveBusinessSupport(input?: {
  userText?: string;
  now?: Date;
}): string | null {
  if (!isPhase4BusinessOperatingPartnerActive(input?.now)) return null;

  const cur = readState();
  const now = input?.now ?? new Date();
  if (cur.lastProactiveOfferAt) {
    const elapsed = now.getTime() - new Date(cur.lastProactiveOfferAt).getTime();
    if (elapsed < PROACTIVE_COOLDOWN_MS) return null;
  }

  const opportunities = detectBusinessOpportunities(now);
  const launch = opportunities.find((o) => o.id === "abandoned_launch");
  if (launch) {
    return "Your launch plan has been inactive for a while. Would you like help restarting it — only if you want to?";
  }

  const project = opportunities.find((o) => o.id === "unfinished_project");
  if (project) {
    return `${project.reason} Would a small next step help — permission first?`;
  }

  const p4 = readState();
  const contentCount = p4.momentumActivities.content_creation ?? 0;
  if (contentCount >= 3) {
    return "You've completed several content pieces recently. This may be a good time to schedule distribution — want help with that?";
  }

  const p2 = getPhase2DiscoveryState();
  const compass = p2.resources.find((r) => r.id === "decision_compass" && r.helpfulScore >= 55);
  if (compass && /\b(?:decide|stuck|which|where to focus)\b/i.test(input?.userText ?? "")) {
    return "You usually gain momentum after a Decision Compass session when facing decisions like this. Want to try that?";
  }

  return null;
}

export function recordProactiveBusinessOfferShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastProactiveOfferAt: now.toISOString(),
    proactiveOffersShown: cur.proactiveOffersShown + 1,
    founderMetrics: {
      ...cur.founderMetrics,
      opportunityAwarenessShown: cur.founderMetrics.opportunityAwarenessShown + 1,
    },
  });
}

export type BusinessPartnershipCheckpoint = {
  dayMark: 90 | 180 | 365;
  title: string;
  accomplishments: string[];
};

export function getBusinessPartnershipCheckpoint(
  now = new Date(),
): BusinessPartnershipCheckpoint | null {
  if (!isPhase4BusinessOperatingPartnerActive(now)) return null;

  const days = daysSinceRelationshipStart(now);
  const mark: 90 | 180 | 365 | null =
    days >= 365 ? 365 : days >= 180 ? 180 : days >= 90 ? 90 : null;
  if (!mark) return null;

  const cur = readState();
  if (cur.checkpointsShown[String(mark) as "90" | "180" | "365"]) return null;

  const manual = buildBusinessOperatingManual();
  const health = buildBusinessHealthDashboard({ now });
  const p2 = getPhase2DiscoveryState();
  const wins = getRecentConfidenceWins(10).map((w) => w.label);

  return {
    dayMark: mark,
    title: "What We've Accomplished Together",
    accomplishments: [
      `${p2.sessionCount} working sessions over ${days} days`,
      `Momentum: ${health.momentum}`,
      `Confidence: ${health.confidence}`,
      manual.howBusinessGrows.highestMomentumActivities[0]
        ? `Strongest momentum from: ${manual.howBusinessGrows.highestMomentumActivities[0]}`
        : "Still discovering your highest-impact activities",
      wins[0] ? `Recent win: ${wins[0]}` : "Building confidence wins over time",
      manual.howBusinessGrows.recurringBottlenecks[0]
        ? `Pattern worked on: ${manual.howBusinessGrows.recurringBottlenecks[0]}`
        : "Patterns still emerging",
    ].filter(Boolean),
  };
}

export function markBusinessCheckpointShown(mark: 90 | 180 | 365): void {
  const cur = readState();
  writeState({
    ...cur,
    checkpointsShown: { ...cur.checkpointsShown, [String(mark)]: true },
  });
}

export function formatBusinessOperatingManualForPanel(
  manual = buildBusinessOperatingManual(),
  stage?: string,
): string {
  const g = manual.howBusinessGrows;
  const stageLabel = stage
    ? stage.charAt(0).toUpperCase() + stage.slice(1)
    : "Growth";
  return [
    "## Business Operating Manual",
    "",
    "### Business Stage",
    stageLabel,
    "",
    "### What Creates Business Growth",
    ...(g.highestMomentumActivities.length
      ? g.highestMomentumActivities.map((a) => `• ${a}`)
      : ["• Still emerging"]),
    "",
    "### Common Bottlenecks",
    ...(g.recurringBottlenecks.length
      ? g.recurringBottlenecks.map((b) => `• ${b}`)
      : ["• Still emerging"]),
    "",
    "### Opportunities Worth Exploring",
    ...(g.avoidancePatterns.length
      ? g.avoidancePatterns.map((a) => `• ${a.replace(/_/g, " ")}`)
      : ["• Will surface gently as patterns emerge"]),
  ].join("\n");
}

export function formatBusinessOperatingManualForDisplay(
  manual = buildBusinessOperatingManual(),
): string {
  const g = manual.howBusinessGrows;
  const lines = [
    "## Business Operating Manual",
    "",
    "_How this business grows — continuously evolving._",
    "",
    "### How This Business Grows",
  ];
  if (g.strongestOffers.length) {
    lines.push("", "**Strongest offers**", ...g.strongestOffers.map((o) => `• ${o}`));
  }
  if (g.mostEffectiveResources.length) {
    lines.push("", "**Most effective resources**", ...g.mostEffectiveResources.map((r) => `• ${r}`));
  }
  if (g.highestMomentumActivities.length) {
    lines.push(
      "",
      "**Highest momentum activities**",
      ...g.highestMomentumActivities.map((a) => `• ${a}`),
    );
  }
  if (g.recurringBottlenecks.length) {
    lines.push("", "**Recurring bottlenecks**", ...g.recurringBottlenecks.map((b) => `• ${b}`));
  }
  if (g.avoidancePatterns.length) {
    lines.push("", "**Common avoidance patterns**", ...g.avoidancePatterns.map((a) => `• ${a}`));
  }
  return lines.join("\n");
}

export function formatBusinessHealthForDisplay(
  health = buildBusinessHealthDashboard(),
): string {
  return [
    "## Business Health",
    "",
    `**Momentum:** ${capitalize(health.momentum)}`,
    `**Confidence:** ${capitalize(health.confidence)}`,
    `**Visibility:** ${capitalize(health.visibility)}`,
    `**Sales activity:** ${capitalize(health.salesActivity.replace(/_/g, " "))}`,
    `**Follow-through:** ${capitalize(health.followThrough.replace(/_/g, " "))}`,
    "",
    health.narrative,
  ].join("\n");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function phase4BusinessOperatingPartnerHintForChat(input?: {
  proactiveSupport?: string | null;
  userText?: string;
}): string | null {
  if (!isPhase4BusinessOperatingPartnerActive()) return null;

  const manual = buildBusinessOperatingManual();
  const health = buildBusinessHealthDashboard({ text: input?.userText });
  const opportunities = detectBusinessOpportunities();
  const proactive = input?.proactiveSupport ?? maybeProactiveBusinessSupport({ userText: input?.userText });

  const parts = [
    "PHASE 4 BUSINESS OPERATING PARTNER (trusted partner — not software):",
    "Goal: help run the business — goals, projects, momentum, opportunities — not just chat.",
    "User should feel: 'I have a business partner' — NOT coach, chatbot, or productivity tool.",
    "Never pushy, nagging, controlling, or managing. Permission first. User remains in control.",
    "Trust language: 'It seems like…', 'I'm noticing…', 'Would you like…'",
    `Business momentum: ${health.momentum}. Confidence: ${health.confidence}. Follow-through: ${health.followThrough}.`,
  ];

  if (manual.howBusinessGrows.highestMomentumActivities[0]) {
    parts.push(
      `Highest-impact activity signal: ${manual.howBusinessGrows.highestMomentumActivities[0]}.`,
    );
  }
  if (opportunities[0]) {
    parts.push(
      `Opportunity awareness (no pressure): ${opportunities[0].label} — ${opportunities[0].reason}`,
    );
  }

  if (proactive) {
    parts.push("PROACTIVE BUSINESS SUPPORT (permission first — optional):", `"${proactive}"`);
  }

  parts.push(
    "Recommend what works for THIS user — history, patterns, resource effectiveness, outcomes.",
    "Explain what matters in plain language — meaning first, not metrics dashboards.",
    "User should think: 'This app helps me run my business.'",
  );

  return parts.join("\n");
}

export function resetPhase4PartnerForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
