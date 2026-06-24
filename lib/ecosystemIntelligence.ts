/**
 * Phase 11 — Ecosystem Intelligence™
 * Understand the whole life system — not just business.
 */

import { evaluateBusinessOS } from "./business-os/businessEngine";
import type { ChatTurn } from "./companionIntelligence";
import { getPhase1OnboardingState } from "./phase1Onboarding";
import {
  buildBusinessIntelligenceSnapshot,
  isPhase7BusinessIntelligenceEcosystemActive,
} from "./businessIntelligenceEcosystem";
import { getPhase2DiscoveryState } from "./phase2ProgressiveDiscovery";
import { daysSinceRelationshipStart } from "./phase3AdaptiveRelationship";
import { buildPersonalOperatingManual } from "./phase5CompanionIntelligenceEcosystem";

export type LifeDomainId =
  | "business"
  | "energy"
  | "learning"
  | "relationships"
  | "health"
  | "mindset"
  | "purpose"
  | "environment"
  | "creativity"
  | "finance"
  | "time"
  | "personal_growth";

export type CapacityLevel =
  | "high"
  | "moderate"
  | "recovery_needed"
  | "overloaded"
  | "hyperfocused"
  | "fragile_momentum";

export type LifeSeason =
  | "building"
  | "recovery"
  | "launch"
  | "learning"
  | "growth"
  | "maintenance"
  | "transition";

export type EnergyDimension = {
  physical: string;
  mental: string;
  emotional: string;
  creative: string;
  decision: string;
  narrative: string;
};

export type DomainSignal = {
  domain: LifeDomainId;
  label: string;
  state: "strong" | "steady" | "strained" | "emerging";
  narrative: string;
};

export type InterconnectionChain = {
  id: string;
  chain: string[];
  narrative: string;
  evidence: "early" | "growing" | "strong";
};

export type WholeSystemInsight = {
  text: string;
  domains: LifeDomainId[];
  evidence: "early" | "growing" | "strong";
};

export type EcosystemIntelligenceSnapshot = {
  domains: DomainSignal[];
  capacity: CapacityLevel;
  capacityNarrative: string;
  energy: EnergyDimension;
  season: LifeSeason;
  seasonNarrative: string;
  purpose: string;
  interconnections: InterconnectionChain[];
  insights: WholeSystemInsight[];
  harmonyNarrative: string;
  updatedAt: string;
};

export type EcosystemIntelligenceState = {
  domainMentions: Partial<Record<LifeDomainId, number>>;
  chainsObserved: number;
  insightsOffered: number;
  lastInsightOfferAt?: string;
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase11-ecosystem-intelligence-v1";
const INSIGHT_COOLDOWN_MS = 4 * 24 * 60 * 60 * 1000;
const MIN_DOMAIN_SIGNALS = 4;

const DOMAIN_LABELS: Record<LifeDomainId, string> = {
  business: "Business",
  energy: "Energy",
  learning: "Learning",
  relationships: "Relationships",
  health: "Health",
  mindset: "Mindset",
  purpose: "Purpose",
  environment: "Environment",
  creativity: "Creativity",
  finance: "Finance",
  time: "Time",
  personal_growth: "Personal Growth",
};

const LIFE_DOMAIN_SIGNALS: { domain: LifeDomainId; re: RegExp }[] = [
  { domain: "energy", re: /\b(?:tired|exhausted|low energy|burned out|sleep|rest)\b/i },
  { domain: "health", re: /\b(?:health|sick|pain|exercise|wellness)\b/i },
  { domain: "relationships", re: /\b(?:partner|spouse|family|friend|relationship)\b/i },
  { domain: "environment", re: /\b(?:workspace|office|home|clutter|distraction|noise)\b/i },
  { domain: "finance", re: /\b(?:money|bills|cash flow|financial|income)\b/i },
  { domain: "time", re: /\b(?:no time|schedule|calendar|overcommitted|deadline)\b/i },
  { domain: "creativity", re: /\b(?:creative|ideas?|inspiration|art|design)\b/i },
  { domain: "purpose", re: /\b(?:why|purpose|meaning|impact|legacy|mission)\b/i },
  { domain: "mindset", re: /\b(?:confidence|anxiety|overwhelm|stuck|fear)\b/i },
  { domain: "learning", re: /\b(?:learn|course|read|study|skill)\b/i },
  { domain: "personal_growth", re: /\b(?:grow|growth|become|transform|habit)\b/i },
  { domain: "business", re: /\b(?:business|client|offer|launch|sales|revenue)\b/i },
];

function defaultState(): EcosystemIntelligenceState {
  return {
    domainMentions: {},
    chainsObserved: 0,
    insightsOffered: 0,
    updatedAt: new Date().toISOString(),
  };
}

function readState(): EcosystemIntelligenceState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: EcosystemIntelligenceState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase11-ecosystem-updated"));
}

export function getEcosystemIntelligenceState(): EcosystemIntelligenceState {
  return readState();
}

function domainsInText(text: string): LifeDomainId[] {
  const found: LifeDomainId[] = [];
  for (const { domain, re } of LIFE_DOMAIN_SIGNALS) {
    if (re.test(text)) found.push(domain);
  }
  return [...new Set(found)];
}

export function inferCapacityLevel(now = new Date()): {
  level: CapacityLevel;
  narrative: string;
} {
  const os = evaluateBusinessOS({ now });
  const p2 = getPhase2DiscoveryState();
  const overload = os.founderLoad === "critical" || os.founderLoad === "high";
  const overwhelm = p2.challenges.some((c) => /overwhelm/i.test(c.label));
  const hyperfocus = p2.adhdPatterns.some((p) => p.id === "shiny_object_syndrome" && p.count >= 2);
  const recovery = p2.challenges.some((c) => /burn|tired|exhaust/i.test(c.label));

  if (overload && overwhelm) {
    return {
      level: "overloaded",
      narrative: "Capacity looks overloaded — recovery may matter more than output right now.",
    };
  }
  if (recovery) {
    return {
      level: "recovery_needed",
      narrative: "Recovery looks needed before pushing harder on business tasks.",
    };
  }
  if (hyperfocus) {
    return {
      level: "hyperfocused",
      narrative: "Hyperfocus energy is present — protect one thread before adding more.",
    };
  }
  if (os.founderLoad === "moderate" || p2.challenges.length >= 2) {
    return {
      level: "fragile_momentum",
      narrative: "Momentum is fragile — small wins beat big pushes.",
    };
  }
  if (os.businessHealth === "healthy") {
    return { level: "high", narrative: "Capacity looks reasonably high for meaningful work." };
  }
  return { level: "moderate", narrative: "Moderate capacity — match effort to what fits today." };
}

export function inferLifeSeason(now = new Date()): { season: LifeSeason; narrative: string } {
  const biz = buildBusinessIntelligenceSnapshot(now);
  const p2 = getPhase2DiscoveryState();
  const stage = biz.businessStage;

  if (/\blaunch|ship|release\b/i.test(p2.goals.map((g) => g.text).join(" "))) {
    return { season: "launch", narrative: "Launch season — protect focus and reduce new commitments." };
  }
  if (stage === "startup" || stage === "growth") {
    return { season: "building", narrative: "Building season — foundations and clarity come first." };
  }
  if (p2.challenges.some((c) => /burn|tired|recover/i.test(c.label))) {
    return { season: "recovery", narrative: "Recovery season — sustainability over speed." };
  }
  if (p2.learningStyle.confidence >= 0.6) {
    return { season: "learning", narrative: "Learning season — experimentation and skill-building fit well." };
  }
  if (stage === "scaling" || stage === "expansion") {
    return { season: "growth", narrative: "Growth season — systems and delegation matter." };
  }
  if (stage === "stability") {
    return { season: "maintenance", narrative: "Maintenance season — steady rhythm over heroic sprints." };
  }
  return { season: "transition", narrative: "Transition season — simplify before adding." };
}

export function buildEnergyIntelligence(now = new Date()): EnergyDimension {
  const p2 = getPhase2DiscoveryState();
  const capacity = inferCapacityLevel(now);
  const peak = p2.energy.peakWindow;
  const low = p2.energy.lowWindow;

  return {
    physical: capacity.level === "recovery_needed" ? "Low" : peak ? `${peak} tends to be stronger` : "Emerging",
    mental: p2.challenges.some((c) => /overwhelm|decision/i.test(c.label)) ? "Strained" : "Available",
    emotional: p2.challenges.some((c) => /confidence|anxiety/i.test(c.label)) ? "Variable" : "Steady",
    creative: p2.strengths.some((s) => /creat|teach/i.test(s)) ? "Strong when engaged" : "Emerging",
    decision: p2.resources.some((r) => r.id === "decision_compass" && r.helpfulScore >= 50)
      ? "Better with visual clarity"
      : "Easier after simplifying",
    narrative: `Energy overall: ${capacity.narrative}${low ? ` Low window: ${low}.` : ""}`,
  };
}

export function buildDomainSignals(now = new Date()): DomainSignal[] {
  const p2 = getPhase2DiscoveryState();
  const p1 = getPhase1OnboardingState().profile;
  const biz = buildBusinessIntelligenceSnapshot(now);
  const manual = buildPersonalOperatingManual();

  const signals: DomainSignal[] = [
    {
      domain: "business",
      label: DOMAIN_LABELS.business,
      state: biz.offers.length >= 1 ? "steady" : "emerging",
      narrative: biz.strategicFocus.narrative,
    },
    {
      domain: "energy",
      label: DOMAIN_LABELS.energy,
      state: inferCapacityLevel(now).level === "overloaded" ? "strained" : "steady",
      narrative: inferCapacityLevel(now).narrative,
    },
    {
      domain: "learning",
      label: DOMAIN_LABELS.learning,
      state: "steady",
      narrative: `Learns best through ${manual.howILearnBest.toLowerCase()}.`,
    },
    {
      domain: "mindset",
      label: DOMAIN_LABELS.mindset,
      state: p2.challenges.length >= 2 ? "strained" : "steady",
      narrative: p2.challenges[0] ? `Recurring friction: ${p2.challenges[0]!.label}` : "Patterns still emerging.",
    },
    {
      domain: "purpose",
      label: DOMAIN_LABELS.purpose,
      state: p1.winDefinition || p1.desiredOutcome ? "strong" : "emerging",
      narrative: p1.desiredOutcome ?? p1.winDefinition ?? "Purpose still forming through your work.",
    },
    {
      domain: "time",
      label: DOMAIN_LABELS.time,
      state: p2.energy.peakWindow ? "steady" : "emerging",
      narrative: p2.energy.peakWindow
        ? `Peak work window: ${p2.energy.peakWindow}.`
        : "Time patterns still emerging.",
    },
    {
      domain: "creativity",
      label: DOMAIN_LABELS.creativity,
      state: manual.whatCreatesMomentum.length >= 2 ? "strong" : "emerging",
      narrative: manual.whatCreatesMomentum[0]
        ? `Momentum often from ${manual.whatCreatesMomentum[0]!.toLowerCase()}.`
        : "Creative patterns still emerging.",
    },
    {
      domain: "personal_growth",
      label: DOMAIN_LABELS.personal_growth,
      state: daysSinceRelationshipStart(now) >= 60 ? "steady" : "emerging",
      narrative: "Growth tracked across your whole journey, not single tasks.",
    },
  ];

  return signals;
}

export function buildInterconnectionChains(now = new Date()): InterconnectionChain[] {
  const p2 = getPhase2DiscoveryState();
  const biz = buildBusinessIntelligenceSnapshot(now);
  const chains: InterconnectionChain[] = [];

  if (p2.challenges.some((c) => /sleep|tired|energy/i.test(c.label))) {
    chains.push({
      id: "sleep_confidence_visibility",
      chain: ["Poor sleep", "Lower confidence", "Lower visibility", "Fewer sales conversations"],
      narrative: "Sleep and energy may be upstream of visibility struggles.",
      evidence: "growing",
    });
  }
  if (p2.challenges.some((c) => /relationship|family|partner/i.test(c.label))) {
    chains.push({
      id: "relationship_focus_overwhelm",
      chain: ["Relationship stress", "Reduced focus", "Project abandonment", "Overwhelm"],
      narrative: "Life stress may be affecting business follow-through.",
      evidence: "growing",
    });
  }
  if (biz.businessHealth.confidence.includes("building") || biz.businessHealth.momentum.includes("growing")) {
    chains.push({
      id: "win_confidence_momentum",
      chain: ["Business win", "Confidence increase", "Visibility increase", "Momentum increase"],
      narrative: "Wins tend to compound across confidence and visibility.",
      evidence: "strong",
    });
  }
  if (p2.adhdPatterns.some((p) => p.id === "visibility_resistance")) {
    chains.push({
      id: "confidence_visibility",
      chain: ["Confidence drops", "Visibility becomes harder", "Sales conversations reduce"],
      narrative: "When confidence drops, visibility often becomes harder — not a character flaw.",
      evidence: "strong",
    });
  }
  if (p2.strengths.some((s) => /teach/i.test(s))) {
    chains.push({
      id: "teaching_momentum",
      chain: ["Teaching", "Confidence", "Momentum", "Business growth"],
      narrative: "Teaching often restores momentum for you.",
      evidence: "growing",
    });
  }

  return chains;
}

export function buildWholeSystemInsights(now = new Date()): WholeSystemInsight[] {
  const p2 = getPhase2DiscoveryState();
  const manual = buildPersonalOperatingManual();
  const capacity = inferCapacityLevel(now);
  const insights: WholeSystemInsight[] = [];

  if (p2.learningStyle.primary === "visual") {
    insights.push({
      text: "Business momentum tends to improve when decisions are mapped visually.",
      domains: ["business", "learning", "mindset"],
      evidence: "growing",
    });
  }
  if (capacity.level === "overloaded" || capacity.level === "recovery_needed") {
    insights.push({
      text: "Capacity is low — visibility may not be the issue; energy and recovery may be.",
      domains: ["energy", "business", "mindset"],
      evidence: "strong",
    });
  }
  if (manual.whatCreatesMomentum.some((m) => /teach/i.test(m))) {
    insights.push({
      text: "You often regain momentum after teaching or helping others.",
      domains: ["creativity", "purpose", "business"],
      evidence: "growing",
    });
  }
  if (p2.challenges.some((c) => /environment|clutter|workspace/i.test(c.label))) {
    insights.push({
      text: "Your business momentum tends to improve when your environment is simplified.",
      domains: ["environment", "business", "energy"],
      evidence: "early",
    });
  }

  return insights;
}

export function buildEcosystemIntelligenceSnapshot(
  now = new Date(),
): EcosystemIntelligenceSnapshot {
  const capacity = inferCapacityLevel(now);
  const season = inferLifeSeason(now);
  const p1 = getPhase1OnboardingState().profile;

  return {
    domains: buildDomainSignals(now),
    capacity: capacity.level,
    capacityNarrative: capacity.narrative,
    energy: buildEnergyIntelligence(now),
    season: season.season,
    seasonNarrative: season.narrative,
    purpose: p1.desiredOutcome ?? p1.winDefinition ?? "Helping others through your business.",
    interconnections: buildInterconnectionChains(now),
    insights: buildWholeSystemInsights(now),
    harmonyNarrative:
      "Harmony over balance — build a business that fits your life, not a life that only serves the business.",
    updatedAt: now.toISOString(),
  };
}

export function isPhase11EcosystemIntelligenceActive(now = new Date()): boolean {
  if (!isPhase7BusinessIntelligenceEcosystemActive(now)) return false;
  const snapshot = buildEcosystemIntelligenceSnapshot(now);
  return (
    snapshot.domains.filter((d) => d.state !== "emerging").length >= MIN_DOMAIN_SIGNALS &&
    snapshot.interconnections.length >= 2
  );
}

function cooldownClear(lastAt: string | undefined, now: Date): boolean {
  if (!lastAt) return true;
  return now.getTime() - new Date(lastAt).getTime() >= INSIGHT_COOLDOWN_MS;
}

export function adaptRecommendationToCapacity(
  recommendation: string,
  now = new Date(),
): string {
  const capacity = inferCapacityLevel(now);
  if (capacity.level === "overloaded" || capacity.level === "recovery_needed") {
    return `${capacity.narrative} A smaller step may fit better than: ${recommendation}`;
  }
  if (capacity.level === "fragile_momentum") {
    return `Momentum is fragile — one protected win may beat: ${recommendation}`;
  }
  return recommendation;
}

export function maybeEcosystemInsight(input: {
  userText: string;
  now?: Date;
}): string | null {
  if (!isPhase11EcosystemIntelligenceActive(input.now)) return null;

  const now = input.now ?? new Date();
  const cur = readState();
  if (!cooldownClear(cur.lastInsightOfferAt, now)) return null;

  const text = input.userText;
  const snapshot = buildEcosystemIntelligenceSnapshot(now);
  const capacity = inferCapacityLevel(now);

  if (/\bwork harder|more hustle|just push\b/i.test(text)) {
    return `${capacity.narrative} The advice shifts when capacity is ${capacity.level.replace(/_/g, " ")}.`;
  }

  if (/\bwhy|purpose|meaning|lost motivation\b/i.test(text)) {
    return `Reconnecting to purpose: ${snapshot.purpose}. (Only if that still resonates — you can correct me.)`;
  }

  const insight = snapshot.insights[0];
  if (insight) {
    return `${insight.text} (I may be wrong — tell me if that doesn't fit.)`;
  }

  if (domainsInText(text).includes("energy") && capacity.level !== "high") {
    return identifyRecoveryRecommendation(now);
  }

  return null;
}

export function identifyRecoveryRecommendation(now = new Date()): string | null {
  const capacity = inferCapacityLevel(now);
  if (capacity.level !== "recovery_needed" && capacity.level !== "overloaded") return null;
  return `${capacity.narrative} Would a recovery-first step feel right — optional?`;
}

export function identifyPurposeReconnection(now = new Date()): string | null {
  const snapshot = buildEcosystemIntelligenceSnapshot(now);
  if (!snapshot.purpose || snapshot.purpose === "Helping others through your business.") return null;
  return `When things feel hard, your why often centers on: ${snapshot.purpose}. Does that still feel true?`;
}

export function identifyCrossDomainInsight(now = new Date()): WholeSystemInsight | null {
  const insights = buildWholeSystemInsights(now);
  return insights.find((i) => i.evidence !== "early") ?? insights[0] ?? null;
}

export function recordEcosystemInsightShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastInsightOfferAt: now.toISOString(),
    insightsOffered: cur.insightsOffered + 1,
  });
}

export function observeEcosystemIntelligenceTurn(input: {
  userText: string;
  now?: Date;
}): EcosystemIntelligenceState {
  if (!isPhase11EcosystemIntelligenceActive(input.now)) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const cur = readState();
  const domainMentions = { ...cur.domainMentions };
  for (const d of domainsInText(t)) {
    domainMentions[d] = (domainMentions[d] ?? 0) + 1;
  }

  const next = {
    ...cur,
    domainMentions,
    chainsObserved: buildInterconnectionChains(input.now).length,
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  writeState(next);
  return next;
}

export function formatEcosystemIntelligenceForPanel(
  snapshot = buildEcosystemIntelligenceSnapshot(),
): string {
  return [
    "## Ecosystem Intelligence™",
    "",
    "_Your whole life system — not silos._",
    "",
    "### Life Season",
    `${snapshot.season.charAt(0).toUpperCase() + snapshot.season.slice(1)} — ${snapshot.seasonNarrative}`,
    "",
    "### Capacity",
    snapshot.capacityNarrative,
    "",
    "### Purpose",
    snapshot.purpose,
    "",
    "### Whole-System Insights",
    ...snapshot.insights.map((i) => `• ${i.text}`),
    "",
    "### Connected Patterns",
    ...snapshot.interconnections.map((c) => `• ${c.narrative}`),
    "",
    snapshot.harmonyNarrative,
  ].join("\n");
}

export function phase11EcosystemIntelligenceHintForChat(input?: {
  userText?: string;
  insight?: string | null;
}): string | null {
  if (!isPhase11EcosystemIntelligenceActive()) return null;

  const snapshot = buildEcosystemIntelligenceSnapshot();
  const insight =
    input?.insight ??
    (input?.userText ? maybeEcosystemInsight({ userText: input.userText }) : null);

  const parts = [
    "PHASE 11 ECOSYSTEM INTELLIGENCE™ (whole life system — not just business):",
    "Goal: answer WHY things happen across life domains — business, energy, relationships, learning, health, purpose.",
    "Never silos. Never hustle-shame advice. Adapt to capacity, season, and energy.",
    `Life season: ${snapshot.season}. ${snapshot.seasonNarrative}`,
    `Capacity: ${snapshot.capacityNarrative}`,
    `Energy: ${snapshot.energy.narrative}`,
    `Purpose anchor: ${snapshot.purpose}`,
    `Interconnection chains observed: ${snapshot.interconnections.length}.`,
    "Domains: business, energy, learning, relationships, health, mindset, purpose, environment, creativity, finance, time, personal growth.",
    "Harmony over balance — business that fits life, not life serving business only.",
    "User should feel understood as a whole person — not judged, more sustainable, more resilient.",
  ];

  if (insight) {
    parts.push("ECOSYSTEM INSIGHT (trust-safe — optional):", `"${insight}"`);
  }

  if (snapshot.insights[0]) {
    parts.push(`Cross-domain pattern: ${snapshot.insights[0].text}`);
  }

  return parts.join("\n");
}

export function resetEcosystemIntelligenceForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Validation exports
export function validateCapacityAwareness(now = new Date()): boolean {
  const rec = adaptRecommendationToCapacity("post more content", now);
  const capacity = inferCapacityLevel(now);
  if (capacity.level === "high") return rec.includes("post more content");
  return rec !== "post more content";
}

export function validateEnergyInfluence(now = new Date()): boolean {
  return buildEnergyIntelligence(now).narrative.length > 0;
}

export function validateCrossDomainInsight(now = new Date()): boolean {
  return Boolean(identifyCrossDomainInsight(now));
}

export function validateRecoveryDetection(now = new Date()): boolean {
  const capacity = inferCapacityLevel(now);
  if (identifyRecoveryRecommendation(now) !== null) return true;
  return capacity.level === "high" || capacity.level === "fragile_momentum";
}

export function validatePurposeReconnection(now = new Date()): boolean {
  return identifyPurposeReconnection(now) !== null;
}

export function validateWholeSystemAccuracy(now = new Date()): boolean {
  const insights = buildWholeSystemInsights(now);
  return insights.every((i) => i.evidence === "early" || i.evidence === "growing" || i.evidence === "strong");
}
