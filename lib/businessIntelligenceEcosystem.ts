/**
 * Phase 7 — Business Intelligence Ecosystem™
 * Understand the business as a living system — meaning, not metrics.
 */

import { evaluateBusinessOS } from "./business-os/businessEngine";
import { gatherBusinessSignals } from "./business-os/businessSignals";
import type { BusinessOSSnapshot } from "./business-os/types";
import { analyzeSalesIntelligence } from "./companionSalesIntelligence";
import {
  getBusinessProfile,
  getPrimaryAvatar,
  getProjects,
  getTemplates,
} from "./companionStore";
import type { ChatTurn } from "./companionIntelligence";
import { getPhase2DiscoveryState } from "./phase2ProgressiveDiscovery";
import {
  buildBusinessHealthDashboard,
  detectBusinessOpportunities,
} from "./phase4BusinessOperatingPartner";
import type { BusinessEvolutionStage } from "./phase5CompanionIntelligenceEcosystem";
import { getPhase5EcosystemState } from "./phase5CompanionIntelligenceEcosystem";
import {
  buildCompanionKnowledgeGraph,
  isPhase6CompanionIntelligenceNetworkActive,
} from "./phase6CompanionIntelligenceNetwork";
import { getSavedWork } from "./savedWorkStore";

export type OfferKind =
  | "workshop"
  | "course"
  | "coaching"
  | "consulting"
  | "membership"
  | "digital_product"
  | "service"
  | "other";

export type OfferStage = "idea" | "building" | "active" | "paused" | "abandoned";

export type OfferIntelligence = {
  id: string;
  label: string;
  kind: OfferKind;
  stage: OfferStage;
  momentum: "high" | "moderate" | "low" | "unclear";
  narrative: string;
};

export type AudienceIntelligence = {
  whoTheyHelp: string;
  challenges: string[];
  resonantLanguage: string[];
  recurringQuestions: string[];
  recurringObjections: string[];
  engagementTopics: string[];
};

export type ContentIntelligence = {
  themes: string[];
  existingContent: string[];
  reuseCandidates: string[];
  gaps: string[];
  repurposingOpportunities: string[];
};

export type VisibilityIntelligence = {
  state: "helping" | "avoided" | "stalled" | "improving" | "emerging";
  narrative: string;
  wins: string[];
  resistanceSignals: string[];
};

export type RevenueIntelligence = {
  drivers: string[];
  opportunities: string[];
  risks: string[];
  pricingPatterns: string[];
  narrative: string;
};

export type BusinessBottleneck = {
  id: string;
  label: string;
  narrative: string;
  leverage: "highest" | "high" | "moderate";
};

export type BusinessOpportunityInsight = {
  id: string;
  label: string;
  prompt: string;
  kind:
    | "unused_asset"
    | "abandoned_project"
    | "unfinished_launch"
    | "repurposing"
    | "referral"
    | "lead"
    | "audience"
    | "revenue";
};

export type BusinessHealthNarrative = {
  momentum: string;
  confidence: string;
  visibility: string;
  salesActivity: string;
  offerClarity: string;
  followThrough: string;
  opportunityFlow: string;
  summary: string;
};

export type StrategicFocus = {
  focusNow: string;
  canWait: string[];
  highestLeverage: string;
  narrative: string;
};

export type BusinessKnowledgeNode = {
  id: string;
  domain:
    | "offer"
    | "client"
    | "content"
    | "project"
    | "strategy"
    | "sales"
    | "revenue"
    | "marketing"
    | "visibility"
    | "launch"
    | "goal"
    | "outcome";
  label: string;
  location: string;
};

export type BusinessKnowledgeGraph = {
  nodes: BusinessKnowledgeNode[];
  edges: { from: string; to: string; label: string }[];
  updatedAt: string;
};

export type BusinessIntelligenceSnapshot = {
  businessStage: BusinessEvolutionStage;
  businessHealth: BusinessHealthNarrative;
  offers: OfferIntelligence[];
  audience: AudienceIntelligence;
  content: ContentIntelligence;
  visibility: VisibilityIntelligence;
  revenue: RevenueIntelligence;
  bottleneck: BusinessBottleneck | null;
  opportunities: BusinessOpportunityInsight[];
  strategicFocus: StrategicFocus;
  knowledgeGraph: BusinessKnowledgeGraph;
  osSnapshot: BusinessOSSnapshot;
  updatedAt: string;
};

export type Phase7BusinessIntelligenceState = {
  topicMentions: Record<string, number>;
  insightsOffered: number;
  lastInsightOfferAt?: string;
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase7-business-intelligence-v1";
const INSIGHT_COOLDOWN_MS = 4 * 24 * 60 * 60 * 1000;
const MIN_BUSINESS_GRAPH_NODES = 3;

const OFFER_KIND_RULES: { kind: OfferKind; re: RegExp }[] = [
  { kind: "workshop", re: /\bworkshop/i },
  { kind: "course", re: /\bcourse|program\b/i },
  { kind: "coaching", re: /\bcoaching\b/i },
  { kind: "consulting", re: /\bconsult/i },
  { kind: "membership", re: /\bmembership|community\b/i },
  { kind: "digital_product", re: /\bdigital|download|ebook\b/i },
  { kind: "service", re: /\bservice|done[- ]for[- ]you\b/i },
];

function defaultState(): Phase7BusinessIntelligenceState {
  return {
    topicMentions: {},
    insightsOffered: 0,
    updatedAt: new Date().toISOString(),
  };
}

function readState(): Phase7BusinessIntelligenceState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: Phase7BusinessIntelligenceState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase7-business-intelligence-updated"));
}

export function getPhase7BusinessIntelligenceState(): Phase7BusinessIntelligenceState {
  return readState();
}

function inferOfferKind(text: string): OfferKind {
  for (const { kind, re } of OFFER_KIND_RULES) {
    if (re.test(text)) return kind;
  }
  return "other";
}

function inferOfferStage(
  status: string,
  updatedAt: string,
  now: Date,
): OfferStage {
  if (status === "completed") return "active";
  if (status === "paused") return "paused";
  const daysSince =
    (now.getTime() - new Date(updatedAt).getTime()) / 86_400_000;
  if (daysSince > 21 && status === "in-progress") return "abandoned";
  if (daysSince > 7) return "building";
  return status === "not-started" ? "idea" : "building";
}

export function buildBusinessKnowledgeGraph(now = new Date()): BusinessKnowledgeGraph {
  const companionGraph = buildCompanionKnowledgeGraph(now);
  const nodes: BusinessKnowledgeNode[] = [];
  const edges: BusinessKnowledgeGraph["edges"] = [];

  const domainMap: Record<string, BusinessKnowledgeNode["domain"]> = {
    offer: "offer",
    audience: "client",
    document: "content",
    content: "content",
    project: "project",
    strategy: "strategy",
    goal: "goal",
    survey: "marketing",
    workshop: "offer",
    launch: "launch",
  };

  for (const n of companionGraph.nodes) {
    const domain = domainMap[n.kind] ?? "project";
    nodes.push({
      id: n.id,
      domain,
      label: n.label,
      location: n.location,
    });
  }

  const profile = getBusinessProfile();
  if (profile?.sells) {
    nodes.push({
      id: "offer:primary",
      domain: "offer",
      label: profile.sells,
      location: "Business Profile",
    });
  }

  for (const edge of companionGraph.edges) {
    edges.push({ from: edge.from, to: edge.to, label: edge.label ?? "relates" });
  }

  if (profile?.sells && nodes.some((n) => n.domain === "client")) {
    const client = nodes.find((n) => n.domain === "client");
    if (client) edges.push({ from: "offer:primary", to: client.id, label: "serves" });
  }

  return { nodes, edges, updatedAt: now.toISOString() };
}

export function buildOfferIntelligence(now = new Date()): OfferIntelligence[] {
  const offers: OfferIntelligence[] = [];
  const profile = getBusinessProfile();
  const p2 = getPhase2DiscoveryState();
  const p4Activities = getPhase5EcosystemState();

  if (profile?.sells) {
    offers.push({
      id: "offer:primary",
      label: profile.sells,
      kind: inferOfferKind(profile.sells),
      stage: "active",
      momentum: "moderate",
      narrative: "Primary offer from your business profile.",
    });
  }

  for (const project of getProjects()) {
    const blob = `${project.name} ${project.goal}`;
    if (!/\boffer|launch|workshop|course|program|product|service\b/i.test(blob)) continue;
    const kind = inferOfferKind(blob);
    const stage = inferOfferStage(project.status, project.updatedAt, now);
    offers.push({
      id: `offer:project:${project.id}`,
      label: project.name,
      kind,
      stage,
      momentum: stage === "abandoned" ? "low" : stage === "active" ? "high" : "moderate",
      narrative:
        stage === "abandoned"
          ? `${project.name} has gone quiet — may need clarity or a gentle restart.`
          : `${project.name} is in ${stage.replace(/_/g, " ")} stage.`,
    });
  }

  for (const doc of getSavedWork()) {
    if (!/\boffer|workshop|course|program|pricing\b/i.test(`${doc.title} ${doc.body}`)) continue;
    offers.push({
      id: `offer:doc:${doc.id}`,
      label: doc.title,
      kind: inferOfferKind(doc.title),
      stage: doc.status === "archived" ? "abandoned" : doc.status === "draft" ? "building" : "active",
      momentum: "moderate",
      narrative: `Saved in ${doc.savedLocation}.`,
    });
  }

  if (p2.business.primaryOffer && !offers.some((o) => o.label === p2.business.primaryOffer)) {
    offers.push({
      id: "offer:discovered",
      label: p2.business.primaryOffer,
      kind: inferOfferKind(p2.business.primaryOffer),
      stage: "building",
      momentum: "moderate",
      narrative: "Emerging from discovery conversations.",
    });
  }

  if (offers.length >= 3 && p2.challenges.some((c) => /offer|confus/i.test(c.label))) {
    for (const o of offers) {
      if (o.stage !== "abandoned") o.narrative += " Multiple offers may be creating confusion.";
    }
  }

  void p4Activities;
  return offers.slice(0, 8);
}

export function buildAudienceIntelligence(): AudienceIntelligence {
  const profile = getBusinessProfile();
  const avatar = getPrimaryAvatar();
  const p2 = getPhase2DiscoveryState();

  return {
    whoTheyHelp: avatar?.who ?? profile?.idealClient ?? "Still emerging from your work together.",
    challenges: [
      avatar?.painPoints,
      ...p2.challenges.slice(0, 4).map((c) => c.label),
    ].filter(Boolean) as string[],
    resonantLanguage: [
      avatar?.messagingAngle,
      avatar?.solution,
      profile?.tone,
    ].filter(Boolean) as string[],
    recurringQuestions: p2.goals.slice(0, 3).map((g) => g.text),
    recurringObjections: avatar?.objections ? [avatar.objections] : [],
    engagementTopics: [
      ...(avatar?.contentPrefs ? [avatar.contentPrefs] : []),
      ...p2.strengths.slice(0, 3),
    ],
  };
}

export function buildContentIntelligence(): ContentIntelligence {
  const saved = getSavedWork();
  const templates = getTemplates();
  const contentItems = [
    ...saved.filter((d) =>
      /content|post|blog|newsletter|video|workshop/i.test(
        `${d.title} ${d.artifactType} ${d.typeFolder}`,
      ),
    ),
    ...templates.filter((t) => t.category === "content"),
  ];

  const themes = [
    ...new Set(
      contentItems.flatMap((c) => {
        const text = "title" in c ? c.title : "";
        const body = "body" in c ? c.body : "";
        const matches = `${text} ${body}`.match(/\b(visibility|launch|offer|teaching|client)\b/gi);
        return matches ? matches.map((m) => m.toLowerCase()) : [];
      }),
    ),
  ];

  const existing = contentItems.map((c) => ("title" in c ? c.title : "")).filter(Boolean);

  const gaps: string[] = [];
  if (!themes.includes("visibility")) gaps.push("Visibility content");
  if (!themes.includes("offer")) gaps.push("Offer-explaining content");
  if (!existing.length) gaps.push("Foundational content library still forming");

  return {
    themes,
    existingContent: existing.slice(0, 6),
    reuseCandidates: existing.slice(0, 4),
    gaps: gaps.slice(0, 4),
    repurposingOpportunities: existing.length >= 2
      ? [`Repurpose ${existing[0]} into ${existing[1] ? "another format" : "social snippets"}`]
      : [],
  };
}

export function buildVisibilityIntelligence(): VisibilityIntelligence {
  const p2 = getPhase2DiscoveryState();
  const health = buildBusinessHealthDashboard();
  const visibilityChallenge = p2.challenges.find((c) =>
    /visibility|marketing|seen/i.test(c.label),
  );
  const resistance = p2.adhdPatterns.filter((p) => p.id === "visibility_resistance");
  const wins = p2.resources
    .filter((r) => r.helpfulScore >= 50 && /content|create/i.test(r.label))
    .map((r) => r.label);

  let state: VisibilityIntelligence["state"] = "emerging";
  if (resistance.some((r) => r.count >= 2)) state = "avoided";
  else if (health.visibility === "consistent") state = "helping";
  else if (health.visibility === "inconsistent") state = "stalled";
  else if (health.visibility === "growing") state = "improving";

  return {
    state,
    narrative:
      state === "avoided"
        ? "Visibility tends to create friction — worth connecting to helping others, not performance."
        : state === "stalled"
          ? "Visibility activity has stalled — a small visible step may unlock momentum."
          : state === "improving"
            ? "Visibility is improving — keep connecting it to purpose."
            : "Visibility patterns still emerging.",
    wins,
    resistanceSignals: resistance.map((r) => r.id.replace(/_/g, " ")),
  };
}

export function buildRevenueIntelligence(
  os = evaluateBusinessOS(),
): RevenueIntelligence {
  const profile = getBusinessProfile();
  const p2 = getPhase2DiscoveryState();
  const drivers: string[] = [];
  if (profile?.sells) drivers.push(profile.sells);
  if (p2.resources.some((r) => /sales|client|conversation/i.test(r.label))) {
    drivers.push("Client conversations");
  }
  if (p2.strengths.some((s) => /teach|coach/i.test(s))) drivers.push("Teaching");

  const opportunities = os.activeOpportunities
    .filter((o) => o.area === "sales" || o.area === "finances" || /revenue|lead/i.test(o.label))
    .map((o) => o.label);

  const risks = os.activeRisks
    .filter((r) => r.area === "finances" || r.area === "sales")
    .map((r) => r.label);

  const pricingPatterns: string[] = [];
  if (p2.adhdPatterns.some((p) => p.id === "pricing_anxiety")) {
    pricingPatterns.push("Pricing conversations create anxiety");
  }
  if (p2.challenges.some((c) => /pric/i.test(c.label))) {
    pricingPatterns.push("Offer pricing needs clarity");
  }

  return {
    drivers: drivers.length ? drivers : ["Still learning what creates revenue here"],
    opportunities: opportunities.slice(0, 4),
    risks: risks.slice(0, 4),
    pricingPatterns,
    narrative:
      drivers[0]
        ? `Revenue tends to come from ${drivers.slice(0, 2).join(" and ")}.`
        : "Revenue drivers still forming — every client conversation adds signal.",
  };
}

export function identifyBusinessBottleneck(
  os = evaluateBusinessOS(),
  now = new Date(),
): BusinessBottleneck | null {
  const p2 = getPhase2DiscoveryState();
  const visibility = buildVisibilityIntelligence();

  if (visibility.state === "avoided" || visibility.state === "stalled") {
    return {
      id: "visibility",
      label: "Visibility",
      narrative: "Visibility appears to be the current constraint — not ability, but being seen.",
      leverage: "highest",
    };
  }

  if (p2.adhdPatterns.some((p) => p.id === "launch_avoidance" && p.count >= 2)) {
    return {
      id: "launch_delay",
      label: "Launch delay",
      narrative: "Launch keeps getting delayed — the bottleneck may be commitment, not preparation.",
      leverage: "highest",
    };
  }

  if (p2.challenges.some((c) => /decision|stuck/i.test(c.label))) {
    return {
      id: "decision_paralysis",
      label: "Decision paralysis",
      narrative: "Too many open decisions may be slowing everything else down.",
      leverage: "high",
    };
  }

  if (
    gatherBusinessSignals().followUpCount > 0 ||
    p2.adhdPatterns.some((p) => p.id === "follow_through_challenges")
  ) {
    return {
      id: "follow_up",
      label: "Follow-through",
      narrative: "Leads and follow-ups may be the constraint — interest without closure.",
      leverage: "high",
    };
  }

  const offerConfusion = buildOfferIntelligence(now).filter(
    (o) => o.stage !== "abandoned" && /confusion/i.test(o.narrative),
  );
  if (offerConfusion.length >= 2) {
    return {
      id: "offer_confusion",
      label: "Offer clarity",
      narrative: "Multiple offers may be creating confusion — clarity could unlock momentum.",
      leverage: "high",
    };
  }

  const topRisk = os.activeRisks[0];
  if (topRisk) {
    return {
      id: topRisk.id,
      label: topRisk.label,
      narrative: topRisk.reason,
      leverage: topRisk.severity === "high" ? "highest" : "high",
    };
  }

  return null;
}

export function identifyBusinessOpportunities(now = new Date()): BusinessOpportunityInsight[] {
  const insights: BusinessOpportunityInsight[] = [];
  const phase4Opps = detectBusinessOpportunities(now);
  const content = buildContentIntelligence();

  for (const opp of phase4Opps) {
    insights.push({
      id: opp.id,
      label: opp.label,
      prompt: `${opp.reason} (Only if you want to explore — no pressure.)`,
      kind:
        opp.id === "unused_content"
          ? "repurposing"
          : opp.id === "revenue_opportunity"
            ? "revenue"
            : opp.id === "unfinished_project"
              ? "abandoned_project"
              : "unfinished_launch",
    });
  }

  for (const item of content.reuseCandidates.slice(0, 2)) {
    insights.push({
      id: `reuse:${item}`,
      label: "Content reuse",
      prompt: `You already have **${item}** — would repurposing it help right now?`,
      kind: "repurposing",
    });
  }

  return insights.slice(0, 6);
}

export function buildBusinessHealthNarrative(now = new Date()): BusinessHealthNarrative {
  const health = buildBusinessHealthDashboard({ now });
  const os = evaluateBusinessOS({ now });
  const offers = buildOfferIntelligence(now);
  const offerClarity =
    offers.filter((o) => /confusion/i.test(o.narrative)).length >= 2
      ? "Multiple offers may need simplifying"
      : offers.length === 1
        ? "Primary offer is fairly clear"
        : offers.length === 0
          ? "Offer picture still forming"
          : "Offer portfolio emerging";

  return {
    momentum: `Momentum feels ${health.momentum.replace(/_/g, " ")}.`,
    confidence: `Confidence feels ${health.confidence.replace(/_/g, " ")}.`,
    visibility: `Visibility is ${health.visibility.replace(/_/g, " ")}.`,
    salesActivity: `Sales activity is ${health.salesActivity.replace(/_/g, " ")}.`,
    offerClarity,
    followThrough: `Follow-through is ${health.followThrough.replace(/_/g, " ")}.`,
    opportunityFlow:
      os.activeOpportunities.length >= 2
        ? "Several opportunities are surfacing — focus may matter more than volume."
        : os.activeOpportunities.length === 1
          ? "One clear opportunity is worth attention."
          : "Opportunity flow is quiet — good time to strengthen foundations.",
    summary: health.narrative,
  };
}

export function inferBusinessStage(now = new Date()): BusinessEvolutionStage {
  return getPhase5EcosystemState().businessStage;
}

export function buildStrategicFocus(now = new Date()): StrategicFocus {
  const bottleneck = identifyBusinessBottleneck(evaluateBusinessOS({ now }), now);
  const os = evaluateBusinessOS({ now });
  const stage = inferBusinessStage(now);

  const focusNow = bottleneck
    ? bottleneck.label
    : os.recommendedActions[0]?.label ?? "Strengthen the core offer";

  const canWait = os.recommendedActions.slice(1, 4).map((a) => a.label);
  if (stage === "startup") canWait.push("Scaling systems");
  if (stage === "scaling") canWait.push("New offer experiments");

  const highestLeverage =
    bottleneck?.narrative ??
    os.activeOpportunities[0]?.reason ??
    "Conversations that clarify the next offer or client step.";

  return {
    focusNow,
    canWait: canWait.slice(0, 3),
    highestLeverage,
    narrative: `Right now, ${focusNow.toLowerCase()} likely deserves the most attention.`,
  };
}

export function buildBusinessIntelligenceSnapshot(now = new Date()): BusinessIntelligenceSnapshot {
  const os = evaluateBusinessOS({ now });
  return {
    businessStage: inferBusinessStage(now),
    businessHealth: buildBusinessHealthNarrative(now),
    offers: buildOfferIntelligence(now),
    audience: buildAudienceIntelligence(),
    content: buildContentIntelligence(),
    visibility: buildVisibilityIntelligence(),
    revenue: buildRevenueIntelligence(os),
    bottleneck: identifyBusinessBottleneck(os, now),
    opportunities: identifyBusinessOpportunities(now),
    strategicFocus: buildStrategicFocus(now),
    knowledgeGraph: buildBusinessKnowledgeGraph(now),
    osSnapshot: os,
    updatedAt: now.toISOString(),
  };
}

export function isPhase7BusinessIntelligenceEcosystemActive(now = new Date()): boolean {
  if (!isPhase6CompanionIntelligenceNetworkActive(now)) return false;
  const profile = getBusinessProfile();
  const p2 = getPhase2DiscoveryState();
  const hasBusinessDepth = Boolean(
    profile?.sells || profile?.role || p2.business.primaryOffer,
  );
  if (!hasBusinessDepth) return false;
  return buildBusinessKnowledgeGraph(now).nodes.length >= MIN_BUSINESS_GRAPH_NODES;
}

function cooldownClear(lastAt: string | undefined, now: Date): boolean {
  if (!lastAt) return true;
  return now.getTime() - new Date(lastAt).getTime() >= INSIGHT_COOLDOWN_MS;
}

export function identifyOfferConfusion(now = new Date()): string | null {
  const offers = buildOfferIntelligence(now).filter((o) => o.stage !== "abandoned");
  if (offers.length < 2) return null;
  const p2 = getPhase2DiscoveryState();
  if (!p2.challenges.some((c) => /offer|confus|too many/i.test(c.label))) return null;
  return `You have several offers in motion (${offers.map((o) => o.label).slice(0, 3).join(", ")}). Would simplifying help — only if you want to explore that?`;
}

export function identifyRevenueOpportunity(now = new Date()): string | null {
  const revenue = buildRevenueIntelligence(evaluateBusinessOS({ now }));
  if (!revenue.opportunities.length) return null;
  return `A revenue opportunity may be waiting: ${revenue.opportunities[0]}. Want to explore it — optional?`;
}

export function identifyContentReuse(now = new Date(), userText?: string): string | null {
  const content = buildContentIntelligence();
  if (!content.reuseCandidates.length) return null;
  const topic = userText ?? "";
  if (topic && !/\bcontent|post|write|create|repurpos/i.test(topic)) return null;
  return `You already have **${content.reuseCandidates[0]}** — would reusing or repurposing it save effort?`;
}

export function identifyVisibilityBottleneck(): string | null {
  const visibility = buildVisibilityIntelligence();
  if (visibility.state !== "avoided" && visibility.state !== "stalled") return null;
  return `${visibility.narrative} Would a small visibility step connected to helping others feel doable?`;
}

export function identifySalesAvoidanceSupport(
  userText: string,
  messages: ChatTurn[] = [],
): string | null {
  const sales = analyzeSalesIntelligence({ userText, messages });
  if (!sales?.inSalesContext || sales.primaryPattern !== "sales_avoidance") return null;
  return `${sales.companionMove} (Only if you want support — no pressure to sell.)`;
}

export function businessStageAwareRecommendation(now = new Date()): string | null {
  const stage = inferBusinessStage(now);
  const focus = buildStrategicFocus(now);
  const stageGuidance: Record<BusinessEvolutionStage, string> = {
    startup: "At startup stage, clarity on one offer and first clients matters most.",
    growth: "In growth stage, visibility and consistent lead flow deserve attention.",
    stability: "In stability stage, systems and offer refinement create leverage.",
    expansion: "In expansion stage, new offers or markets need careful sequencing.",
    scaling: "In scaling stage, delegation and systems matter more than heroics.",
    pivot: "During a pivot, simplifying commitments before adding new ones helps.",
  };
  return `${stageGuidance[stage]} Focus now: ${focus.focusNow}.`;
}

export function maybeBusinessIntelligenceInsight(input: {
  userText: string;
  messages?: ChatTurn[];
  now?: Date;
}): string | null {
  if (!isPhase7BusinessIntelligenceEcosystemActive(input.now)) return null;
  const now = input.now ?? new Date();
  const cur = readState();
  if (!cooldownClear(cur.lastInsightOfferAt, now)) return null;

  const text = input.userText;
  const candidates = [
    identifyOfferConfusion(now),
    /\bcontent|repurpos|post\b/i.test(text) ? identifyContentReuse(now, text) : null,
    /\bvisibility|marketing|seen\b/i.test(text) ? identifyVisibilityBottleneck() : null,
    /\brevenue|money|sales|client\b/i.test(text) ? identifyRevenueOpportunity(now) : null,
    identifySalesAvoidanceSupport(text, input.messages ?? []),
    businessStageAwareRecommendation(now),
  ].filter(Boolean) as string[];

  return candidates[0] ?? null;
}

export function recordBusinessIntelligenceInsightShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastInsightOfferAt: now.toISOString(),
    insightsOffered: cur.insightsOffered + 1,
  });
}

export function observePhase7BusinessTurn(input: {
  userText: string;
  now?: Date;
}): Phase7BusinessIntelligenceState {
  if (!isPhase7BusinessIntelligenceEcosystemActive(input.now)) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const cur = readState();
  const topicMentions = { ...cur.topicMentions };
  for (const topic of ["offer", "revenue", "visibility", "content", "sales", "launch"]) {
    if (new RegExp(`\\b${topic}`, "i").test(t)) {
      topicMentions[topic] = (topicMentions[topic] ?? 0) + 1;
    }
  }

  const next = {
    ...cur,
    topicMentions,
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  writeState(next);
  return next;
}

export function formatBusinessIntelligenceForPanel(
  snapshot = buildBusinessIntelligenceSnapshot(),
): string {
  const b = snapshot.bottleneck;
  return [
    "## Business Intelligence Ecosystem™",
    "",
    "_Understanding your business — meaning, not metrics._",
    "",
    "### Business Stage",
    snapshot.businessStage.charAt(0).toUpperCase() + snapshot.businessStage.slice(1),
    "",
    "### Business Health",
    snapshot.businessHealth.summary,
    "",
    "### Strategic Focus",
    snapshot.strategicFocus.narrative,
    `**Focus now:** ${snapshot.strategicFocus.focusNow}`,
    snapshot.strategicFocus.canWait.length
      ? `**Can wait:** ${snapshot.strategicFocus.canWait.join(", ")}`
      : null,
    "",
    "### Current Bottleneck",
    b ? b.narrative : "No single constraint standing out — steady progress mode.",
    "",
    "### What Creates Revenue",
    snapshot.revenue.narrative,
    "",
    "### Offers",
    ...snapshot.offers.slice(0, 4).map((o) => `• ${o.label} — ${o.narrative}`),
    "",
    "### Visibility",
    snapshot.visibility.narrative,
  ]
    .filter(Boolean)
    .join("\n");
}

export function phase7BusinessIntelligenceHintForChat(input?: {
  userText?: string;
  messages?: ChatTurn[];
  insight?: string | null;
}): string | null {
  if (!isPhase7BusinessIntelligenceEcosystemActive()) return null;

  const snapshot = buildBusinessIntelligenceSnapshot();
  const insight =
    input?.insight ??
    (input?.userText
      ? maybeBusinessIntelligenceInsight({
          userText: input.userText,
          messages: input.messages,
        })
      : null);

  const parts = [
    "PHASE 7 BUSINESS INTELLIGENCE ECOSYSTEM™ (understand the business, not just the user):",
    "Goal: answer what helps grow, what slows down, what deserves attention, what's missed, highest return on effort.",
    "Meaning not metrics. Insight not data dumps. Guidance not reports. Never a dashboard, CRM, or spreadsheet.",
    "One companion face — never expose internal layers or confidence scores.",
    `Business stage: ${snapshot.businessStage}.`,
    snapshot.businessHealth.summary,
    `Strategic focus: ${snapshot.strategicFocus.focusNow}.`,
    snapshot.bottleneck
      ? `Current bottleneck: ${snapshot.bottleneck.label} — ${snapshot.bottleneck.narrative}`
      : "No dominant bottleneck detected.",
    `Revenue: ${snapshot.revenue.narrative}`,
    `Visibility: ${snapshot.visibility.narrative}`,
    `Offer intelligence: ${snapshot.offers.length} offer signal(s) tracked.`,
    `Audience: helps ${snapshot.audience.whoTheyHelp.slice(0, 80)}.`,
    snapshot.content.reuseCandidates[0]
      ? `Content reuse candidate: ${snapshot.content.reuseCandidates[0]}.`
      : null,
    "Permission first for all opportunities. User should feel: 'This companion understands my business.'",
  ];

  if (insight) {
    parts.push("BUSINESS INTELLIGENCE INSIGHT (optional — weave naturally once):", `"${insight}"`);
  }

  parts.push(
    "Ultimate goal: user never wonders 'What should I work on next?' — companion reveals the answer.",
  );

  return parts.filter(Boolean).join("\n");
}

export function resetPhase7BusinessIntelligenceForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
