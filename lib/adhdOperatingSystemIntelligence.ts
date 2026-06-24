/**
 * ADHD Operating System Intelligence™ (P0.8.1)
 * Identifies how the user's ADHD brain creates momentum, loses momentum,
 * makes decisions, and finishes work — not surface symptom labels.
 */

import { getProjects } from "./companionStore";
import {
  buildWhatIveLearnedProfile,
  getPhase2DiscoveryState,
  type AdhdPatternId,
  type Phase2LearningStyleId,
} from "./phase2ProgressiveDiscovery";
import {
  buildUserOperatingManual,
  getPhase3RelationshipState,
  type PredictivePatternId,
} from "./phase3AdaptiveRelationship";
import {
  buildPersonalOperatingManual,
  getPhase5EcosystemState,
} from "./phase5CompanionIntelligenceEcosystem";
import type {
  ObservationCategory,
  ObservationConfidence,
  RelationshipObservation,
} from "./relationshipObservationEngine";

export type OperatingPatternDomain =
  | "momentum_builder"
  | "momentum_killer"
  | "completion"
  | "attention"
  | "decision"
  | "business";

export type OperatingPatternConfidence =
  | "emerging"
  | "observed"
  | "strong"
  | "consistent";

export type OperatingQuestionFocus =
  | "completion"
  | "momentum"
  | "attention"
  | "decision"
  | "business"
  | "general";

export type OperatingPatternInsight = {
  id: string;
  domain: OperatingPatternDomain;
  text: string;
  confidence: OperatingPatternConfidence;
  evidenceCount: number;
  sourceCount: number;
  sources: string[];
};

export type AdhdOperatingSystemProfile = {
  insights: OperatingPatternInsight[];
  momentumBuilders: OperatingPatternInsight[];
  momentumKillers: OperatingPatternInsight[];
  completionPatterns: OperatingPatternInsight[];
  attentionPatterns: OperatingPatternInsight[];
  decisionPatterns: OperatingPatternInsight[];
  businessPatterns: OperatingPatternInsight[];
  narrative: string;
};

type EvidenceBundle = {
  adhdPatterns: Map<AdhdPatternId, number>;
  predictivePatterns: Map<PredictivePatternId, number>;
  challenges: Map<string, number>;
  momentumSignals: string[];
  frictionSignals: string[];
  decisionSignals: string[];
  learningStyle: Phase2LearningStyleId | null;
  learningConfidence: number;
  growthSignals: Record<string, number>;
  sessionCount: number;
  activeProjects: number;
  completedProjects: number;
  abandonedRatio: number;
};

const MIN_EMERGING_SIGNALS = 2;
const MIN_OBSERVED_SIGNALS = 3;
const MIN_STRONG_SIGNALS = 4;
const MIN_CONSISTENT_SIGNALS = 5;

function daysSince(iso: string, now: Date): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 999;
  return Math.max(0, Math.floor((now.getTime() - t) / 86_400_000));
}

function operatingConfidence(
  evidenceCount: number,
  sourceCount: number,
): OperatingPatternConfidence | null {
  if (evidenceCount < MIN_EMERGING_SIGNALS) return null;
  if (evidenceCount >= MIN_CONSISTENT_SIGNALS && sourceCount >= 2) {
    return "consistent";
  }
  if (evidenceCount >= MIN_STRONG_SIGNALS) return "strong";
  if (evidenceCount >= MIN_OBSERVED_SIGNALS) return "observed";
  return "emerging";
}

function toObservationConfidence(
  c: OperatingPatternConfidence,
): ObservationConfidence {
  if (c === "consistent" || c === "strong") return "strong";
  if (c === "observed") return "forming";
  return "early";
}

function domainCategory(domain: OperatingPatternDomain): ObservationCategory {
  switch (domain) {
    case "momentum_builder":
      return "growth_patterns";
    case "momentum_killer":
      return "recurring_obstacles";
    case "completion":
      return "adhd_patterns";
    case "attention":
      return "focus_patterns";
    case "decision":
      return "decision_making";
    case "business":
      return "business_building";
    default:
      return "adhd_patterns";
  }
}

function collectEvidence(now: Date): EvidenceBundle {
  const p2 = getPhase2DiscoveryState();
  const p3 = getPhase3RelationshipState();
  const p5 = getPhase5EcosystemState();
  const userManual = buildUserOperatingManual();
  const manual = buildPersonalOperatingManual();

  const adhdPatterns = new Map<AdhdPatternId, number>();
  for (const p of p2.adhdPatterns) {
    if (p.count >= 2) adhdPatterns.set(p.id, p.count);
  }

  const predictivePatterns = new Map<PredictivePatternId, number>();
  for (const p of p3.predictivePatterns) {
    if (p.count >= 2) predictivePatterns.set(p.id, p.count);
  }

  const challenges = new Map<string, number>();
  for (const c of p2.challenges) {
    if (c.count >= 2) challenges.set(c.label.toLowerCase(), c.count);
  }

  const projects = typeof window !== "undefined" ? getProjects() : [];
  const activeProjects = projects.filter((p) => p.status !== "completed").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const total = activeProjects + completedProjects;
  const abandonedRatio =
    total > 0 ? activeProjects / Math.max(1, total) : 0;

  return {
    adhdPatterns,
    predictivePatterns,
    challenges,
    momentumSignals: manual.whatCreatesMomentum ?? [],
    frictionSignals: [
      ...userManual.frictionPatterns,
      ...(buildWhatIveLearnedProfile().challenges ?? []),
    ],
    decisionSignals: manual.howIMakeDecisions ?? [],
    learningStyle: p2.learningStyle.primary ?? null,
    learningConfidence: p2.learningStyle.confidence,
    growthSignals: p5.growthSignals as Record<string, number>,
    sessionCount: p2.sessionCount,
    activeProjects,
    completedProjects,
    abandonedRatio,
  };
}

function hasPattern(
  bundle: EvidenceBundle,
  id: AdhdPatternId,
  min = 2,
): boolean {
  return (bundle.adhdPatterns.get(id) ?? 0) >= min;
}

function hasPredictive(
  bundle: EvidenceBundle,
  id: PredictivePatternId,
  min = 2,
): boolean {
  return (bundle.predictivePatterns.get(id) ?? 0) >= min;
}

function challengeMentions(bundle: EvidenceBundle, re: RegExp): number {
  let count = 0;
  for (const [label, n] of bundle.challenges) {
    if (re.test(label)) count += n;
  }
  return count;
}

function frictionMentions(bundle: EvidenceBundle, re: RegExp): boolean {
  return bundle.frictionSignals.some((f) => re.test(f));
}

function momentumMentions(bundle: EvidenceBundle, re: RegExp): boolean {
  return bundle.momentumSignals.some((m) => re.test(m));
}

function pushInsight(
  list: OperatingPatternInsight[],
  insight: OperatingPatternInsight | null,
): void {
  if (!insight) return;
  if (list.some((i) => i.id === insight.id)) return;
  list.push(insight);
}

function buildCompletionInsights(bundle: EvidenceBundle): OperatingPatternInsight[] {
  const insights: OperatingPatternInsight[] = [];
  const sources: string[] = [];
  let evidence = 0;

  if (hasPattern(bundle, "follow_through_challenges")) {
    evidence += bundle.adhdPatterns.get("follow_through_challenges")!;
    sources.push("follow_through_challenges");
  }
  if (hasPattern(bundle, "perfectionism")) {
    evidence += bundle.adhdPatterns.get("perfectionism")!;
    sources.push("perfectionism");
  }
  if (hasPattern(bundle, "shiny_object_syndrome")) {
    evidence += Math.min(2, bundle.adhdPatterns.get("shiny_object_syndrome")!);
    sources.push("shiny_object_syndrome");
  }
  if (hasPattern(bundle, "launch_avoidance")) {
    evidence += bundle.adhdPatterns.get("launch_avoidance")!;
    sources.push("launch_avoidance");
  }
  evidence += Math.min(3, challengeMentions(bundle, /finish|complet|follow.?through|abandon/i));

  const maintenancePhase =
    hasPattern(bundle, "follow_through_challenges") &&
    (hasPattern(bundle, "perfectionism") ||
      frictionMentions(bundle, /refin|polish|tweak|perfect/i) ||
      challengeMentions(bundle, /finish|maintenance|admin/i) > 0);

  if (maintenancePhase) {
    const conf = operatingConfidence(evidence, sources.length);
    pushInsight(insights, conf ? {
      id: "os-completion-maintenance-phase",
      domain: "completion",
      text:
        "Projects usually lose momentum after the creative phase ends and work shifts into repetitive maintenance, refinement, administration, or follow-up.",
      confidence: conf,
      evidenceCount: evidence,
      sourceCount: sources.length,
      sources,
    } : null);
  }

  const noveltyLoss =
    hasPattern(bundle, "shiny_object_syndrome") &&
    (hasPattern(bundle, "follow_through_challenges") ||
      challengeMentions(bundle, /new|start|idea/i) > 0);

  if (noveltyLoss) {
    const ev =
      (bundle.adhdPatterns.get("shiny_object_syndrome") ?? 0) +
      (bundle.adhdPatterns.get("follow_through_challenges") ?? 0);
    const conf = operatingConfidence(ev, 2);
    pushInsight(insights, conf ? {
      id: "os-completion-novelty-loss",
      domain: "completion",
      text:
        "Momentum often drops when novelty fades — the exciting creation phase ends and the project starts feeling like upkeep.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 2,
      sources: ["shiny_object_syndrome", "follow_through_challenges"],
    } : null);
  }

  const shippingGap = hasPattern(bundle, "launch_avoidance") || hasPredictive(bundle, "launch_avoidance");
  if (shippingGap) {
    const ev =
      (bundle.adhdPatterns.get("launch_avoidance") ?? 0) +
      (bundle.predictivePatterns.get("launch_avoidance") ?? 0);
    const conf = operatingConfidence(ev, 1);
    pushInsight(insights, conf ? {
      id: "os-completion-shipping-gap",
      domain: "completion",
      text:
        "The drop tends to happen between 'almost ready' and 'out in the world' — shipping carries more perceived risk than building.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 1,
      sources: ["launch_avoidance"],
    } : null);
  }

  if (bundle.abandonedRatio >= 0.6 && bundle.activeProjects >= 3) {
    const conf = operatingConfidence(bundle.activeProjects, 2);
    pushInsight(insights, conf ? {
      id: "os-completion-active-load",
      domain: "completion",
      text:
        "Several active projects are competing for attention at once — finishing slows when too many threads stay open simultaneously.",
      confidence: conf,
      evidenceCount: bundle.activeProjects,
      sourceCount: 2,
      sources: ["project_load", "active_projects"],
    } : null);
  }

  return insights;
}

function buildMomentumInsights(bundle: EvidenceBundle): {
  builders: OperatingPatternInsight[];
  killers: OperatingPatternInsight[];
} {
  const builders: OperatingPatternInsight[] = [];
  const killers: OperatingPatternInsight[] = [];

  const placeholderMomentum = /^(conversations|clear priorities)$/i;
  const builderSignals = bundle.momentumSignals.filter(
    (s) => s.trim().length > 0 && !placeholderMomentum.test(s.trim()),
  );
  if (
    builderSignals.length >= 2 ||
    (builderSignals.length >= 1 &&
      momentumMentions(bundle, /creat|build|problem|teach|help|learn|design|innov/i))
  ) {
    const ev = Math.max(builderSignals.length, 2);
    const conf = operatingConfidence(ev, 1);
    pushInsight(builders, conf ? {
      id: "os-momentum-creation-energy",
      domain: "momentum_builder",
      text:
        "You usually have strong energy during creation and problem-solving — building, brainstorming, and making something tangible creates forward motion.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 1,
      sources: ["momentum_manual"],
    } : null);
  }

  if (
    frictionMentions(bundle, /admin|maintenance|repetit|follow.?up|document|cleanup|detail/i) ||
    hasPattern(bundle, "planning_addiction")
  ) {
    let ev = frictionMentions(bundle, /admin|maintenance|repetit|follow.?up|document|cleanup|detail/i)
      ? 2
      : 0;
    if (hasPattern(bundle, "planning_addiction")) {
      ev += bundle.adhdPatterns.get("planning_addiction")!;
    }
    const conf = operatingConfidence(ev, 1);
    pushInsight(killers, conf ? {
      id: "os-momentum-admin-drain",
      domain: "momentum_killer",
      text:
        "Energy tends to drop when work becomes repetitive maintenance, administration, documentation, or follow-up rather than creation.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 1,
      sources: ["friction_patterns"],
    } : null);
  }

  if (hasPattern(bundle, "overwhelm_cycles") || hasPredictive(bundle, "cognitive_overload")) {
    const ev =
      (bundle.adhdPatterns.get("overwhelm_cycles") ?? 0) +
      (bundle.predictivePatterns.get("cognitive_overload") ?? 0);
    const conf = operatingConfidence(ev, 2);
    pushInsight(killers, conf ? {
      id: "os-momentum-overwhelm-competition",
      domain: "momentum_killer",
      text:
        "Overwhelm tends to occur when too many active priorities compete for attention at the same time — not from lack of capability.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 2,
      sources: ["overwhelm_cycles", "cognitive_overload"],
    } : null);
  }

  return { builders, killers };
}

function buildDecisionInsights(bundle: EvidenceBundle): OperatingPatternInsight[] {
  const insights: OperatingPatternInsight[] = [];
  let evidence = 0;
  const sources: string[] = [];

  if (hasPredictive(bundle, "decision_overload_after_ideas")) {
    evidence += bundle.predictivePatterns.get("decision_overload_after_ideas")!;
    sources.push("decision_overload_after_ideas");
  }
  if (bundle.learningStyle === "conversational" && bundle.learningConfidence >= 0.45) {
    evidence += 2;
    sources.push("conversational_decision");
  }
  if (bundle.learningStyle === "visual" && bundle.learningConfidence >= 0.45) {
    evidence += 2;
    sources.push("visual_decision");
  }
  if (hasPattern(bundle, "shiny_object_syndrome")) {
    evidence += 1;
    sources.push("shiny_object_syndrome");
  }

  if (hasPredictive(bundle, "decision_overload_after_ideas") || evidence >= MIN_OBSERVED_SIGNALS) {
    const conf = operatingConfidence(evidence, sources.length);
    pushInsight(insights, conf ? {
      id: "os-decision-multiple-options",
      domain: "decision",
      text:
        "Your decision-making becomes harder when multiple good options exist because every option can stay mentally active at once.",
      confidence: conf,
      evidenceCount: evidence,
      sourceCount: sources.length,
      sources,
    } : null);
  }

  if (
    bundle.learningStyle === "conversational" &&
    bundle.learningConfidence >= 0.5 &&
    bundle.sessionCount >= 3
  ) {
    const conf = operatingConfidence(
      Math.round(bundle.learningConfidence * 6),
      1,
    );
    pushInsight(insights, conf ? {
      id: "os-decision-conversational",
      domain: "decision",
      text:
        "You tend to decide by talking things through — clarity often arrives in conversation rather than in silent analysis.",
      confidence: conf,
      evidenceCount: Math.round(bundle.learningConfidence * 6),
      sourceCount: 1,
      sources: ["learning_style"],
    } : null);
  }

  return insights;
}

function buildAttentionInsights(bundle: EvidenceBundle): OperatingPatternInsight[] {
  const insights: OperatingPatternInsight[] = [];

  if (hasPredictive(bundle, "cognitive_overload")) {
    const ev = bundle.predictivePatterns.get("cognitive_overload")!;
    const conf = operatingConfidence(ev, 1);
    pushInsight(insights, conf ? {
      id: "os-attention-open-loops",
      domain: "attention",
      text:
        "Attention fragments when too many open loops compete — focus drains when everything feels equally urgent.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 1,
      sources: ["cognitive_overload"],
    } : null);
  }

  if (momentumMentions(bundle, /creat|build|problem|launch/i) && bundle.sessionCount >= 3) {
    const conf = operatingConfidence(
      Math.max(2, bundle.momentumSignals.filter((s) => /creat|build|problem|launch/i.test(s)).length),
      1,
    );
    pushInsight(insights, conf ? {
      id: "os-attention-creation-sustain",
      domain: "attention",
      text:
        "Attention sustains longest during creation and active problem-solving — passive or repetitive work loses you faster.",
      confidence: conf,
      evidenceCount: 2,
      sourceCount: 1,
      sources: ["momentum_manual"],
    } : null);
  }

  return insights;
}

function buildBusinessInsights(bundle: EvidenceBundle): OperatingPatternInsight[] {
  const insights: OperatingPatternInsight[] = [];

  const createsFasterThanFinishes =
    (hasPattern(bundle, "shiny_object_syndrome") || momentumMentions(bundle, /creat|idea|build/i)) &&
    (hasPattern(bundle, "follow_through_challenges") ||
      challengeMentions(bundle, /finish|complet/i) > 0);

  if (createsFasterThanFinishes) {
    const ev =
      (bundle.adhdPatterns.get("shiny_object_syndrome") ?? 0) +
      (bundle.adhdPatterns.get("follow_through_challenges") ?? 0);
    const conf = operatingConfidence(ev, 2);
    pushInsight(insights, conf ? {
      id: "os-business-create-faster-than-finish",
      domain: "business",
      text:
        "You tend to generate ideas and build faster than you finish — creation energizes you; maintenance and closing loops cost more.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 2,
      sources: ["creation", "completion"],
    } : null);
  }

  const launchesFasterThanMaintains =
    hasPattern(bundle, "launch_avoidance") ||
    hasPattern(bundle, "visibility_resistance");

  if (launchesFasterThanMaintains) {
    const ev =
      (bundle.adhdPatterns.get("launch_avoidance") ?? 0) +
      (bundle.adhdPatterns.get("visibility_resistance") ?? 0);
    const conf = operatingConfidence(ev, 1);
    pushInsight(insights, conf ? {
      id: "os-business-launch-maintain-gap",
      domain: "business",
      text:
        "You may launch or create faster than you maintain — the business-building stretch after launch is where momentum often thins.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 1,
      sources: ["launch_visibility"],
    } : null);
  }

  if (
    hasPattern(bundle, "planning_addiction") &&
    (bundle.growthSignals.follow_through_improving ?? 0) < 2
  ) {
    const ev = bundle.adhdPatterns.get("planning_addiction")!;
    const conf = operatingConfidence(ev, 1);
    pushInsight(insights, conf ? {
      id: "os-business-plans-before-motion",
      domain: "business",
      text:
        "Planning can feel like progress before motion starts — systems and outlines sometimes substitute for the messier work of shipping.",
      confidence: conf,
      evidenceCount: ev,
      sourceCount: 1,
      sources: ["planning_addiction"],
    } : null);
  }

  return insights;
}

export function buildAdhdOperatingSystemProfile(
  now = new Date(),
): AdhdOperatingSystemProfile {
  const bundle = collectEvidence(now);
  const corroboratedSignals =
    [...bundle.adhdPatterns.values()].reduce((sum, count) => sum + count, 0) +
    [...bundle.predictivePatterns.values()].reduce((sum, count) => sum + count, 0) +
    [...bundle.challenges.values()].reduce((sum, count) => sum + count, 0);

  if (corroboratedSignals < MIN_EMERGING_SIGNALS) {
    return {
      insights: [],
      momentumBuilders: [],
      momentumKillers: [],
      completionPatterns: [],
      attentionPatterns: [],
      decisionPatterns: [],
      businessPatterns: [],
      narrative:
        "Operating patterns are still forming — need repeated evidence before explaining why behaviors happen.",
    };
  }

  const completionPatterns = buildCompletionInsights(bundle);
  const { builders, killers } = buildMomentumInsights(bundle);
  const decisionPatterns = buildDecisionInsights(bundle);
  const attentionPatterns = buildAttentionInsights(bundle);
  const businessPatterns = buildBusinessInsights(bundle);

  const insights = [
    ...completionPatterns,
    ...builders,
    ...killers,
    ...decisionPatterns,
    ...attentionPatterns,
    ...businessPatterns,
  ].sort((a, b) => {
    const rank = { consistent: 4, strong: 3, observed: 2, emerging: 1 };
    return rank[b.confidence] - rank[a.confidence] || b.evidenceCount - a.evidenceCount;
  });

  const lead = insights[0];
  const narrative = lead
    ? lead.text
    : "Operating patterns are still forming — need repeated signals before explaining why behaviors happen.";

  return {
    insights,
    momentumBuilders: builders,
    momentumKillers: killers,
    completionPatterns,
    attentionPatterns,
    decisionPatterns,
    businessPatterns,
    narrative,
  };
}

export function detectOperatingQuestionFocus(userText: string): OperatingQuestionFocus {
  const t = userText.trim();
  if (!t) return "general";

  if (
    /\b(?:good starter|poor finisher|bad finisher|start.*(?:but|and).*(?:finish|complet)|finish what|keep starting|instead of finishing|trouble finishing|can'?t finish|abandon)\b/i.test(
      t,
    )
  ) {
    return "completion";
  }
  if (/\b(?:overwhelm|too many (?:things|projects|priorities)|competing for attention)\b/i.test(t)) {
    return "momentum";
  }
  if (/\b(?:lose focus|distract|attention|sustain focus|can'?t focus)\b/i.test(t)) {
    return "attention";
  }
  if (
    /\b(?:decide|decision|choose|which option|can'?t decide|decision.?making)\b/i.test(t) &&
    /\b(?:pattern|why|how do i|how i)\b/i.test(t)
  ) {
    return "decision";
  }
  if (/\b(?:business|launch|market|revenue|offer|grow faster|build faster)\b/i.test(t)) {
    return "business";
  }
  return "general";
}

const FOCUS_DOMAINS: Record<
  Exclude<OperatingQuestionFocus, "general">,
  OperatingPatternDomain[]
> = {
  completion: ["completion", "momentum_builder", "momentum_killer"],
  momentum: ["momentum_killer", "momentum_builder", "attention"],
  attention: ["attention", "momentum_killer"],
  decision: ["decision"],
  business: ["business", "completion"],
};

export function operatingPatternsForUserQuestion(
  userText: string,
  now = new Date(),
  limit = 4,
): OperatingPatternInsight[] {
  const profile = buildAdhdOperatingSystemProfile(now);
  if (!profile.insights.length) return [];

  const focus = detectOperatingQuestionFocus(userText);
  if (focus === "general") {
    return profile.insights.slice(0, limit);
  }

  const domains = FOCUS_DOMAINS[focus];
  const ranked = profile.insights
    .map((insight) => ({
      insight,
      rank: domains.indexOf(insight.domain),
    }))
    .filter((row) => row.rank >= 0)
    .sort((a, b) => a.rank - b.rank);

  if (!ranked.length) return profile.insights.slice(0, limit);
  return ranked.slice(0, limit).map((row) => row.insight);
}

/** Surface symptom → operating insight upgrade when evidence supports it. */
export function upgradeSurfaceToOperatingInsight(
  surfaceText: string,
): string | null {
  const t = surfaceText.toLowerCase();

  if (/trouble finish|struggle.*finish|hard to finish|follow.?through/i.test(t)) {
    return "Projects usually lose momentum after the creative phase ends and maintenance begins.";
  }
  if (/overwhelm|too much/i.test(t)) {
    return "Overwhelm tends to occur when too many active projects compete for attention at the same time.";
  }
  if (/difficult(y)? choosing|can'?t decide|trouble choos/i.test(t)) {
    return "Your decision-making becomes harder when multiple good options exist because every option remains mentally active.";
  }
  if (/new ideas.*energy|shiny|unfinished/i.test(t)) {
    return "Momentum often drops when novelty fades — creation energizes you; upkeep costs more.";
  }
  if (/talk.*through|conversational clarity/i.test(t)) {
    return null;
  }
  if (/generates.*ideas|lots of ideas/i.test(t)) {
    return "You tend to generate ideas faster than you execute — creation is a strength; narrowing and closing loops is the friction point.";
  }

  return null;
}

export function collectOperatingSystemObservationCandidates(
  now = new Date(),
): RelationshipObservation[] {
  const profile = buildAdhdOperatingSystemProfile(now);
  const p2 = getPhase2DiscoveryState();

  return profile.insights.map((insight) => {
    const obsConfidence = toObservationConfidence(insight.confidence);
    const score =
      (insight.confidence === "consistent"
        ? 1
        : insight.confidence === "strong"
          ? 0.9
          : insight.confidence === "observed"
            ? 0.75
            : 0.55) +
      Math.min(0.2, insight.evidenceCount * 0.03);

    return {
      id: insight.id,
      category: domainCategory(insight.domain),
      text: insight.text,
      evidence: `Operating pattern across ${insight.evidenceCount} repeated signals`,
      confidence: obsConfidence,
      frequency: insight.evidenceCount,
      recencyDays: daysSince(p2.lastSessionAt, now),
      score,
      source: `os:${insight.domain}`,
    };
  });
}

export function adhdOperatingSystemHintForChat(userText?: string): string | null {
  const profile = buildAdhdOperatingSystemProfile();
  if (!profile.insights.length) return null;

  const focus = userText ? detectOperatingQuestionFocus(userText) : "general";
  const relevant = userText
    ? operatingPatternsForUserQuestion(userText, new Date(), 3)
    : profile.insights.slice(0, 3);

  if (!relevant.length) return null;

  const lines = [
    "ADHD OPERATING SYSTEM INTELLIGENCE (P0.8.1 — internal; do NOT name categories):",
    "Explain WHY patterns happen — momentum phase shifts, attention competition, decision mechanics — not surface labels.",
    "Never say: 'You have trouble finishing', 'You get overwhelmed', 'You have difficulty choosing'.",
    "Prefer operating explanations like:",
    ...relevant.map((i) => `- ${i.text}`),
  ];

  if (focus === "completion") {
    lines.push(
      "USER ASKS ABOUT STARTING VS FINISHING — prioritize completion + momentum patterns first.",
      "Do NOT lead with conversational clarity, visual mapping, or generic decision-making unless directly relevant.",
      'PASS: "Looking at your patterns, this doesn\'t seem to be a starting problem — energy is usually strong during creation. The drop tends to happen when work becomes repetitive or administrative."',
    );
  }

  if (focus === "momentum") {
    lines.push(
      "Explain overwhelm as competing priorities and energy phase shifts — not character flaws.",
    );
  }

  return lines.join("\n");
}

export function formatOperatingPatternsForPrompt(
  insights: OperatingPatternInsight[],
): string {
  if (!insights.length) {
    return "Operating patterns still forming — need repeated evidence before explaining why behaviors happen.";
  }
  return insights
    .map((i, n) => `${n + 1}. ${i.text} (${i.confidence} confidence)`)
    .join("\n");
}
