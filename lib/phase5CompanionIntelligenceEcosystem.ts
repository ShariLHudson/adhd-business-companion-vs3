/**
 * Phase 5 — Companion Intelligence Ecosystem
 * From business partner to personal operating system — lifelong adaptive relationship.
 */

import { getRecentConfidenceWins } from "./companionConfidenceEngine";
import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import { getBusinessProfile } from "./companionStore";
import { isPhase1OnboardingComplete } from "./phase1Onboarding";
import {
  getPhase2DiscoveryState,
  type Phase2LearningStyleId,
} from "./phase2ProgressiveDiscovery";
import {
  buildUserOperatingManual,
  daysSinceRelationshipStart,
  getPhase3RelationshipState,
} from "./phase3AdaptiveRelationship";
import {
  buildBusinessOperatingManual,
  getPhase4PartnerState,
  isPhase4BusinessOperatingPartnerActive,
} from "./phase4BusinessOperatingPartner";

export type BusinessEvolutionStage =
  | "startup"
  | "growth"
  | "stability"
  | "expansion"
  | "scaling"
  | "pivot";

export type GrowthSignalId =
  | "confidence_increasing"
  | "leadership_increasing"
  | "decision_speed_improving"
  | "visibility_growth"
  | "follow_through_improving"
  | "new_challenges_emerging";

export type MemoryEntryKind =
  | "decision"
  | "project"
  | "offer"
  | "experiment"
  | "win"
  | "lesson"
  | "pattern"
  | "preference";

export type MultiYearMemoryEntry = {
  kind: MemoryEntryKind;
  text: string;
  recordedAt: string;
};

export type WisdomInsight = {
  text: string;
  source: "pattern" | "intervention" | "outcome" | "lesson";
  confidence: "early" | "growing" | "strong";
  recordedAt: string;
};

export type PersonalOperatingManual = {
  howILearnBest: string;
  howIMakeDecisions: string[];
  howIBuildConfidence: string[];
  whatCreatesMomentum: string[];
  whatCreatesFriction: string[];
  updatedAt: string;
};

export type LegacySnapshot = {
  relationshipDays: number;
  confidenceWins: number;
  sessionsTogether: number;
  topMomentumActivity?: string;
  patternsWorkedOn: string[];
  narrative: string;
  updatedAt: string;
};

export type Phase5EcosystemState = {
  businessStage: BusinessEvolutionStage;
  growthSignals: Partial<Record<GrowthSignalId, number>>;
  multiYearMemory: MultiYearMemoryEntry[];
  wisdomInsights: WisdomInsight[];
  opportunityMentions: Record<string, number>;
  lastOpportunityOfferAt?: string;
  opportunityOffersShown: number;
  legacyCheckpointsShown: Record<"365" | "730" | "1095" | "1825", boolean>;
  founderMetrics: {
    growthObservations: number;
    opportunityOffers: number;
    wisdomInsightsRecorded: number;
    legacyCheckpointsReached: number;
  };
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase5-intelligence-ecosystem-v1";
const MIN_PHASE5_DAYS = 90;
const MIN_PHASE5_SESSIONS = 20;
const OPPORTUNITY_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;

const STAGE_SIGNALS: { re: RegExp; stage: BusinessEvolutionStage }[] = [
  { re: /\b(?:just starting|new business|first clients?)\b/i, stage: "startup" },
  { re: /\b(?:grow|scaling|more clients|expand)\b/i, stage: "growth" },
  { re: /\b(?:stable|consistent revenue|steady)\b/i, stage: "stability" },
  { re: /\b(?:expand|new offer|new market)\b/i, stage: "expansion" },
  { re: /\b(?:scale|team|hire|systems)\b/i, stage: "scaling" },
  { re: /\b(?:pivot|change direction|new model)\b/i, stage: "pivot" },
];

const OPPORTUNITY_TOPIC_SIGNALS: { re: RegExp; topic: string; prompt: string }[] = [
  {
    re: /\bworkshop/i,
    topic: "workshop",
    prompt:
      "You've mentioned workshops several times recently. Would you like to start outlining one?",
  },
  {
    re: /\blaunch/i,
    topic: "launch",
    prompt:
      "You usually begin thinking about launches around this stage. Want to explore what a launch could look like now?",
  },
  {
    re: /\b(?:course|program|membership)\b/i,
    topic: "offer",
    prompt:
      "An offer idea keeps surfacing in our conversations. Would you like to shape it together?",
  },
];

function defaultState(): Phase5EcosystemState {
  const now = new Date().toISOString();
  return {
    businessStage: "growth",
    growthSignals: {},
    multiYearMemory: [],
    wisdomInsights: [],
    opportunityMentions: {},
    opportunityOffersShown: 0,
    legacyCheckpointsShown: {
      "365": false,
      "730": false,
      "1095": false,
      "1825": false,
    },
    founderMetrics: {
      growthObservations: 0,
      opportunityOffers: 0,
      wisdomInsightsRecorded: 0,
      legacyCheckpointsReached: 0,
    },
    updatedAt: now,
  };
}

function readState(): Phase5EcosystemState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: Phase5EcosystemState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase5-ecosystem-updated"));
}

export function getPhase5EcosystemState(): Phase5EcosystemState {
  return readState();
}

export function isPhase5CompanionIntelligenceEcosystemActive(now = new Date()): boolean {
  if (!isPhase1OnboardingComplete()) return false;
  if (!isPhase4BusinessOperatingPartnerActive(now)) return false;

  const p2 = getPhase2DiscoveryState();
  const days = daysSinceRelationshipStart(now);
  return days >= MIN_PHASE5_DAYS || p2.sessionCount >= MIN_PHASE5_SESSIONS;
}

function learningStyleLabel(id: Phase2LearningStyleId): string {
  return id.replace(/_/g, " ");
}

export function buildPersonalOperatingManual(): PersonalOperatingManual {
  const p2 = getPhase2DiscoveryState();
  const userManual = buildUserOperatingManual();
  const businessManual = buildBusinessOperatingManual();
  const p4 = getPhase4PartnerState();
  const wins = getRecentConfidenceWins(8);

  const style = p2.learningStyle.primary;
  const secondary = p2.learningStyle.secondary;
  const howILearnBest =
    style === "hybrid" && secondary
      ? `${capitalize(learningStyleLabel(secondary))} + ${capitalize(learningStyleLabel(style))}`
      : capitalize(learningStyleLabel(style));

  const decisions: string[] = [];
  if (p2.resources.some((r) => r.id === "decision_compass" && r.helpfulScore >= 50)) {
    decisions.push("Benefits from Decision Compass");
    decisions.push("Needs visual comparison");
  }
  if (p2.challenges.some((c) => /decision|stuck/i.test(c.label))) {
    decisions.push("Overthinks under uncertainty");
  }
  if (!decisions.length) decisions.push("Conversational clarity before committing");

  const confidenceSources = [
    wins.some((w) => w.kind === "task_completed") ? "Completion" : null,
    wins.some((w) => w.kind === "goal_reached") ? "Progress" : null,
    wins.some((w) => w.kind === "momentum_progress") ? "Evidence of momentum" : null,
    wins.length >= 2 ? "Accumulated wins" : null,
    "Client feedback",
  ].filter(Boolean) as string[];

  const momentum =
    businessManual.howBusinessGrows.highestMomentumActivities.length > 0
      ? businessManual.howBusinessGrows.highestMomentumActivities
      : ["Conversations", "Clear priorities"];

  const friction = userManual.frictionPatterns.length
    ? userManual.frictionPatterns
    : ["Too many choices", "Visibility pressure"];

  return {
    howILearnBest,
    howIMakeDecisions: decisions,
    howIBuildConfidence: [...new Set(confidenceSources)].slice(0, 5),
    whatCreatesMomentum: momentum.slice(0, 5),
    whatCreatesFriction: friction.slice(0, 5),
    updatedAt: new Date().toISOString(),
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pushMemory(
  list: MultiYearMemoryEntry[],
  kind: MemoryEntryKind,
  text: string,
): MultiYearMemoryEntry[] {
  const entry = { kind, text: text.slice(0, 200), recordedAt: new Date().toISOString() };
  return [entry, ...list.filter((m) => !(m.kind === kind && m.text === entry.text))].slice(0, 80);
}

function bumpGrowthSignal(
  signals: Partial<Record<GrowthSignalId, number>>,
  id: GrowthSignalId,
): Partial<Record<GrowthSignalId, number>> {
  return { ...signals, [id]: (signals[id] ?? 0) + 1 };
}

function inferBusinessStage(text: string, cur: BusinessEvolutionStage): BusinessEvolutionStage {
  for (const { re, stage } of STAGE_SIGNALS) {
    if (re.test(text)) return stage;
  }
  const profile = getBusinessProfile();
  if (profile?.goals.some((g) => /scale|team/i.test(g))) return "scaling";
  if (profile?.goals.some((g) => /grow|clients/i.test(g))) return "growth";
  return cur;
}

function wisdomEntry(
  text: string,
  source: WisdomInsight["source"],
  confidence: WisdomInsight["confidence"],
): WisdomInsight {
  return { text, source, confidence, recordedAt: new Date().toISOString() };
}

function recordWisdomFromInterventions(insights: WisdomInsight[]): WisdomInsight[] {
  const effective = getUserInterventionEffectiveness()
    .filter((e) => e.rates.adaptiveWeight >= 70 && e.counts.completed >= 2)
    .slice(0, 3);

  let next = [...insights];
  for (const e of effective) {
    const text = `${e.label} consistently helps this user move forward.`;
    if (next.some((w) => w.text === text)) continue;
    next = [wisdomEntry(text, "intervention", "growing"), ...next].slice(0, 25);
  }
  return next;
}

export function observePhase5EcosystemTurn(input: {
  userText: string;
  now?: Date;
}): Phase5EcosystemState {
  if (!isPhase5CompanionIntelligenceEcosystemActive(input.now)) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const cur = readState();
  let memory = [...cur.multiYearMemory];
  let growthSignals = { ...cur.growthSignals };
  let opportunityMentions = { ...cur.opportunityMentions };
  let businessStage = inferBusinessStage(t, cur.businessStage);
  let wisdomInsights = [...cur.wisdomInsights];

  if (/\b(?:decided|chose|going with|let's do)\b/i.test(t)) {
    memory = pushMemory(memory, "decision", t);
  }
  if (/\b(?:project|launch|offer|workshop|program)\b/i.test(t)) {
    memory = pushMemory(memory, "project", t);
  }
  if (/\b(?:learned|lesson|realized|now i know)\b/i.test(t)) {
    memory = pushMemory(memory, "lesson", t);
    wisdomInsights = [
      wisdomEntry(t.slice(0, 160), "lesson", "early"),
      ...wisdomInsights,
    ].slice(0, 25);
  }
  if (/\b(?:confident|proud|nailed|finished|completed)\b/i.test(t)) {
    growthSignals = bumpGrowthSignal(growthSignals, "confidence_increasing");
  }
  if (/\b(?:faster|quicker|decided today)\b/i.test(t)) {
    growthSignals = bumpGrowthSignal(growthSignals, "decision_speed_improving");
  }
  if (/\b(?:visible|posted|published|marketing)\b/i.test(t)) {
    growthSignals = bumpGrowthSignal(growthSignals, "visibility_growth");
  }
  if (/\b(?:finished|follow through|completed|shipped)\b/i.test(t)) {
    growthSignals = bumpGrowthSignal(growthSignals, "follow_through_improving");
  }
  if (/\b(?:team|lead|delegate|hire)\b/i.test(t)) {
    growthSignals = bumpGrowthSignal(growthSignals, "leadership_increasing");
  }

  for (const { re, topic } of OPPORTUNITY_TOPIC_SIGNALS) {
    if (re.test(t)) {
      opportunityMentions[topic] = (opportunityMentions[topic] ?? 0) + 1;
    }
  }

  const p3 = getPhase3RelationshipState();
  for (const pattern of p3.predictivePatterns.filter((p) => p.count >= 3)) {
    const text = `Recurring pattern: ${pattern.label}`;
    if (!wisdomInsights.some((w) => w.text === text)) {
      wisdomInsights = [
        wisdomEntry(text, "pattern", pattern.confidence),
        ...wisdomInsights,
      ].slice(0, 25);
    }
  }

  wisdomInsights = recordWisdomFromInterventions(wisdomInsights);

  const next: Phase5EcosystemState = {
    ...cur,
    businessStage,
    growthSignals,
    multiYearMemory: memory,
    wisdomInsights,
    opportunityMentions,
    founderMetrics: {
      ...cur.founderMetrics,
      growthObservations: cur.founderMetrics.growthObservations + 1,
      wisdomInsightsRecorded: wisdomInsights.length,
    },
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  writeState(next);
  return next;
}

export function buildAdaptiveGrowthSummary(): string[] {
  const signals = readState().growthSignals;
  const labels: Record<GrowthSignalId, string> = {
    confidence_increasing: "Confidence increasing",
    leadership_increasing: "Leadership increasing",
    decision_speed_improving: "Decision speed improving",
    visibility_growth: "Visibility growth",
    follow_through_improving: "Follow-through improving",
    new_challenges_emerging: "New challenges emerging",
  };
  return (Object.entries(signals) as [GrowthSignalId, number][])
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => labels[id]);
}

export function maybePredictiveOpportunityOffer(input?: {
  now?: Date;
}): string | null {
  if (!isPhase5CompanionIntelligenceEcosystemActive(input?.now)) return null;

  const cur = readState();
  const now = input?.now ?? new Date();
  if (cur.lastOpportunityOfferAt) {
    const elapsed = now.getTime() - new Date(cur.lastOpportunityOfferAt).getTime();
    if (elapsed < OPPORTUNITY_COOLDOWN_MS) return null;
  }

  for (const { topic, prompt } of OPPORTUNITY_TOPIC_SIGNALS) {
    if ((cur.opportunityMentions[topic] ?? 0) >= 3) {
      return `${prompt} (Only if you want to — no pressure.)`;
    }
  }

  const projects = cur.multiYearMemory.filter((m) => m.kind === "project");
  if (projects.length >= 4) {
    const unique = new Set(projects.slice(0, 6).map((p) => p.text.slice(0, 30)));
    if (unique.size >= 3) {
      return "Several projects in memory seem related. Would you like to connect them — optional?";
    }
  }

  return null;
}

export function recordOpportunityOfferShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastOpportunityOfferAt: now.toISOString(),
    opportunityOffersShown: cur.opportunityOffersShown + 1,
    founderMetrics: {
      ...cur.founderMetrics,
      opportunityOffers: cur.founderMetrics.opportunityOffers + 1,
    },
  });
}

export function buildLegacyIntelligence(now = new Date()): LegacySnapshot {
  const p2 = getPhase2DiscoveryState();
  const days = daysSinceRelationshipStart(now);
  const wins = getRecentConfidenceWins(50);
  const businessManual = buildBusinessOperatingManual();
  const growth = buildAdaptiveGrowthSummary();

  return {
    relationshipDays: days,
    confidenceWins: wins.length,
    sessionsTogether: p2.sessionCount,
    topMomentumActivity: businessManual.howBusinessGrows.highestMomentumActivities[0],
    patternsWorkedOn: businessManual.howBusinessGrows.avoidancePatterns.slice(0, 4),
    narrative: growth.length
      ? `Since joining: ${growth.join("; ")}.`
      : "Still building your legacy story — every session adds to it.",
    updatedAt: now.toISOString(),
  };
}

export type EcosystemMilestoneCheckpoint = {
  yearMark: 1 | 2 | 3 | 5;
  dayMark: 365 | 730 | 1095 | 1825;
  title: string;
  accomplishments: string[];
};

export function getEcosystemMilestoneCheckpoint(
  now = new Date(),
): EcosystemMilestoneCheckpoint | null {
  if (!isPhase5CompanionIntelligenceEcosystemActive(now)) return null;

  const days = daysSinceRelationshipStart(now);
  const mark: 365 | 730 | 1095 | 1825 | null =
    days >= 1825 ? 1825 : days >= 1095 ? 1095 : days >= 730 ? 730 : days >= 365 ? 365 : null;
  if (!mark) return null;

  const cur = readState();
  const key = String(mark) as "365" | "730" | "1095" | "1825";
  if (cur.legacyCheckpointsShown[key]) return null;

  const legacy = buildLegacyIntelligence(now);
  const manual = buildPersonalOperatingManual();
  const yearMark: 1 | 2 | 3 | 5 =
    mark >= 1825 ? 5 : mark >= 1095 ? 3 : mark >= 730 ? 2 : 1;

  return {
    yearMark,
    dayMark: mark,
    title: "What We've Built Together",
    accomplishments: [
      `${legacy.sessionsTogether} sessions over ${legacy.relationshipDays} days`,
      `${legacy.confidenceWins} confidence wins recorded`,
      manual.whatCreatesMomentum[0]
        ? `Momentum often from: ${manual.whatCreatesMomentum[0]}`
        : "Momentum patterns still emerging",
      manual.whatCreatesFriction[0]
        ? `Worked through: ${manual.whatCreatesFriction[0]}`
        : "Patterns still emerging",
      `Business stage signal: ${readState().businessStage}`,
      legacy.narrative,
    ].filter(Boolean),
  };
}

export function markEcosystemCheckpointShown(mark: 365 | 730 | 1095 | 1825): void {
  const cur = readState();
  writeState({
    ...cur,
    legacyCheckpointsShown: { ...cur.legacyCheckpointsShown, [String(mark)]: true },
    founderMetrics: {
      ...cur.founderMetrics,
      legacyCheckpointsReached: cur.founderMetrics.legacyCheckpointsReached + 1,
    },
  });
}

export function formatWhatWeveBuiltTogetherForDisplay(
  legacy = buildLegacyIntelligence(),
  growth = buildAdaptiveGrowthSummary(),
): string {
  const lines = [
    "## What We've Built Together",
    "",
    "_Not statistics — the story of our work together._",
    "",
    `We've worked together across ${legacy.sessionsTogether} sessions.`,
    legacy.confidenceWins > 0
      ? `You've recorded ${legacy.confidenceWins} meaningful wins along the way.`
      : "Every session adds to what we're building.",
  ];
  if (legacy.topMomentumActivity) {
    lines.push(`Momentum often comes from ${legacy.topMomentumActivity.toLowerCase()}.`);
  }
  if (legacy.patternsWorkedOn.length) {
    lines.push("", "### Patterns Overcome");
    lines.push(...legacy.patternsWorkedOn.map((p) => `• ${p}`));
  }
  if (growth.length) {
    lines.push("", "### Growth Along The Way");
    lines.push(...growth.map((g) => `• ${g}`));
  }
  if (legacy.narrative) {
    lines.push("", legacy.narrative);
  }
  return lines.join("\n");
}

export function formatPersonalOperatingManualForDisplay(
  manual = buildPersonalOperatingManual(),
): string {
  return [
    "## Personal Operating Manual",
    "",
    "_One of the most valuable assets in the ecosystem — continuously refined._",
    "",
    "### How I Learn",
    manual.howILearnBest,
    "",
    "### How I Make Decisions",
    ...manual.howIMakeDecisions.map((d) => `• ${d}`),
    "",
    "### How I Build Confidence",
    ...manual.howIBuildConfidence.map((c) => `• ${c}`),
    "",
    "### What Creates Momentum",
    ...manual.whatCreatesMomentum.map((m) => `• ${m}`),
    "",
    "### What Creates Friction",
    ...manual.whatCreatesFriction.map((f) => `• ${f}`),
  ].join("\n");
}

export function formatWisdomEngineForDisplay(
  insights = readState().wisdomInsights,
): string {
  if (!insights.length) {
    return "## Wisdom Engine\n\nPersonal wisdom is still forming from your patterns and wins.";
  }
  return [
    "## Wisdom Engine",
    "",
    "_Personal wisdom — specific to you, not generic advice._",
    "",
    ...insights.slice(0, 8).map((w) => `• ${w.text}`),
  ].join("\n");
}

export function formatLegacyIntelligenceForDisplay(
  legacy = buildLegacyIntelligence(),
): string {
  return [
    "## Legacy Intelligence",
    "",
    `**Time together:** ${legacy.relationshipDays} days`,
    `**Sessions:** ${legacy.sessionsTogether}`,
    `**Confidence wins:** ${legacy.confidenceWins}`,
    legacy.topMomentumActivity
      ? `**Strongest momentum:** ${legacy.topMomentumActivity}`
      : null,
    "",
    legacy.narrative,
  ]
    .filter(Boolean)
    .join("\n");
}

export const KNOWLEDGE_ECOSYSTEM_MODULES = [
  "Knowledge Vault",
  "SOP Builder",
  "Templates",
  "Strategies",
  "Snippets",
  "Projects",
  "Content",
  "Training",
  "Client knowledge",
] as const;

export const COMPANION_NETWORK_LAYERS = [
  "Board of Directors",
  "Knowledge Intelligence",
  "Founder Intelligence",
  "Business Intelligence",
  "Content Intelligence",
  "Resource Intelligence",
] as const;

export function phase5CompanionIntelligenceEcosystemHintForChat(input?: {
  opportunityOffer?: string | null;
  userText?: string;
}): string | null {
  if (!isPhase5CompanionIntelligenceEcosystemActive()) return null;

  const manual = buildPersonalOperatingManual();
  const legacy = buildLegacyIntelligence();
  const growth = buildAdaptiveGrowthSummary();
  const stage = readState().businessStage;
  const opportunity = input?.opportunityOffer ?? maybePredictiveOpportunityOffer();

  const parts = [
    "PHASE 5 COMPANION INTELLIGENCE ECOSYSTEM (lifelong relationship — not productivity software):",
    "Goal: transformation — think better, decide better, learn faster, follow through, build confidence, reduce overwhelm.",
    "User should feel: 'This understands me better than any productivity system' — a trusted companion for years.",
    "One companion experience only — never expose internal layers (Board, Founder Intel, etc.).",
    "Never pushy. Permission first. User remains in control.",
    `Business evolution stage signal: ${stage}.`,
    `Days together: ${legacy.relationshipDays}. Sessions: ${legacy.sessionsTogether}.`,
  ];

  if (growth[0]) parts.push(`Adaptive growth: ${growth.join("; ")}.`);
  if (manual.whatCreatesMomentum[0]) {
    parts.push(`Momentum: ${manual.whatCreatesMomentum.slice(0, 2).join(", ")}.`);
  }
  if (manual.whatCreatesFriction[0]) {
    parts.push(`Friction to respect: ${manual.whatCreatesFriction[0]}.`);
  }

  if (opportunity) {
    parts.push("PREDICTIVE OPPORTUNITY (preparation, not prediction — optional):", `"${opportunity}"`);
  }

  parts.push(
    "Multi-year memory: user should never feel they're starting over.",
    "Recommendations adapt to business stage and personal operating manual.",
    "Milestone: help them become the person they want to become — not just run tasks.",
  );

  return parts.join("\n");
}

export function resetPhase5EcosystemForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
