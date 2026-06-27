/**
 * Phase 10 — Legacy & Transformation Intelligence
 * Understand long-term change — not activity, not metrics, transformation.
 */

import { getRecentConfidenceWins } from "./companionConfidenceEngine";
import { getBusinessProfile, getProjects } from "./companionStore";
import { getPhase1OnboardingState } from "./phase1Onboarding";
import { getPhase2DiscoveryState } from "./phase2ProgressiveDiscovery";
import { daysSinceRelationshipStart } from "./phase3AdaptiveRelationship";
import {
  buildLegacyIntelligence,
  buildPersonalOperatingManual,
  getPhase5EcosystemState,
} from "./phase5CompanionIntelligenceEcosystem";
import { isPhase7BusinessIntelligenceEcosystemActive } from "./businessIntelligenceEcosystem";
import { getSavedWork } from "./savedWorkStore";

export type TransformationDimension =
  | "visibility"
  | "confidence"
  | "business"
  | "follow_through"
  | "decision_quality"
  | "leadership"
  | "identity";

export type EvidenceLevel = "early" | "growing" | "strong";

export type OriginSnapshot = {
  businessStage?: string;
  primaryChallenge?: string;
  confidenceThemes: string[];
  goals: string[];
  struggles: string[];
  dreamOutcomes: string[];
  capturedAt: string;
};

export type ThenNowComparison = {
  dimension: TransformationDimension;
  label: string;
  then: string;
  now: string;
  evidence: EvidenceLevel;
};

export type PatternEvolution = {
  id: string;
  label: string;
  narrative: string;
  evidence: EvidenceLevel;
};

export type EmergingStrength = {
  id: string;
  label: string;
  narrative: string;
  evidence: EvidenceLevel;
};

export type ConfidenceLegacyItem = {
  source: string;
  narrative: string;
};

export type BusinessLegacyItem = {
  kind: string;
  label: string;
  narrative: string;
};

export type IdentityShift = {
  then: string;
  now: string;
  evidence: EvidenceLevel;
};

export type TransformationTimelineEntry = {
  id: string;
  category: string;
  label: string;
  recordedAt: string;
};

export type AnnualTransformationReview = {
  yearMark: 1 | 2 | 3 | 5;
  title: string;
  highlights: string[];
};

export type TransformationIntelligenceSnapshot = {
  origin: OriginSnapshot;
  timeline: TransformationTimelineEntry[];
  thenNow: ThenNowComparison[];
  patternEvolution: PatternEvolution[];
  strengths: EmergingStrength[];
  confidenceLegacy: ConfidenceLegacyItem[];
  businessLegacy: BusinessLegacyItem[];
  identity: IdentityShift[];
  annualReview: AnnualTransformationReview | null;
  transformationNarrative: string;
  updatedAt: string;
};

export type TransformationIntelligenceState = {
  reflectionsOffered: number;
  lastReflectionOfferAt?: string;
  timelineCaptured: number;
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase10-transformation-intelligence-v1";
const REFLECTION_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;
const MIN_THEN_NOW = 2;
const MIN_TRANSFORMATION_DAYS = 90;

const PATTERN_LABELS: Record<string, string> = {
  visibility_resistance: "Visibility resistance",
  follow_through_challenges: "Follow-through challenges",
  shiny_object_syndrome: "Shiny object syndrome",
  perfectionism: "Perfectionism",
  planning_addiction: "Planning addiction",
  launch_avoidance: "Launch avoidance",
};

function defaultState(): TransformationIntelligenceState {
  return {
    reflectionsOffered: 0,
    timelineCaptured: 0,
    updatedAt: new Date().toISOString(),
  };
}

function readState(): TransformationIntelligenceState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: TransformationIntelligenceState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase10-transformation-updated"));
}

export function getTransformationIntelligenceState(): TransformationIntelligenceState {
  return readState();
}

function evidenceFromCount(count: number): EvidenceLevel {
  if (count >= 5) return "strong";
  if (count >= 3) return "growing";
  return "early";
}

export function buildOriginSnapshot(now = new Date()): OriginSnapshot {
  const p1 = getPhase1OnboardingState().profile;
  const p2 = getPhase2DiscoveryState();
  const struggles = [
    p1.primaryChallenge,
    ...p2.challenges.slice(0, 4).map((c) => c.label),
  ].filter(Boolean) as string[];

  return {
    businessStage: p1.businessStage ?? p2.business.type,
    primaryChallenge: p1.primaryChallenge ?? p2.challenges[0]?.label,
    confidenceThemes: [
      p1.emotionalState,
      p1.primaryChallenge?.match(/confidence/i) ? "Confidence" : null,
      p2.challenges.find((c) => /confidence|doubt/i.test(c.label))?.label,
    ].filter(Boolean) as string[],
    goals: [
      p1.immediateGoal,
      p1.desiredOutcome,
      p1.successDefinition,
      ...p2.goals.slice(0, 3).map((g) => g.text),
    ].filter(Boolean) as string[],
    struggles: [...new Set(struggles)].slice(0, 6),
    dreamOutcomes: [p1.desiredOutcome, p1.winDefinition, p1.successDefinition].filter(
      Boolean,
    ) as string[],
    capturedAt: p2.firstSessionAt || now.toISOString(),
  };
}

export function buildTransformationTimeline(now = new Date()): TransformationTimelineEntry[] {
  const p2 = getPhase2DiscoveryState();
  const p5 = getPhase5EcosystemState();
  const projects = getProjects();
  const saved = getSavedWork();
  const wins = getRecentConfidenceWins(20);
  const entries: TransformationTimelineEntry[] = [];

  for (const project of projects.filter((p) => p.status === "completed").slice(0, 8)) {
    entries.push({
      id: `project-${project.id}`,
      category: "projects_completed",
      label: project.name,
      recordedAt: project.updatedAt,
    });
  }

  for (const mem of p5.multiYearMemory.slice(0, 12)) {
    entries.push({
      id: `memory-${mem.recordedAt}`,
      category: mem.kind,
      label: mem.text.slice(0, 120),
      recordedAt: mem.recordedAt,
    });
  }

  for (const win of wins.slice(0, 6)) {
    entries.push({
      id: `win-${win.id}`,
      category: "confidence",
      label: win.label,
      recordedAt: win.at,
    });
  }

  if (p2.business.primaryOffer) {
    entries.push({
      id: "offer-primary",
      category: "offers",
      label: p2.business.primaryOffer,
      recordedAt: p2.lastSessionAt,
    });
  }

  for (const item of saved.slice(0, 6)) {
    entries.push({
      id: `asset-${item.id}`,
      category: "content",
      label: item.title,
      recordedAt: item.updatedAt,
    });
  }

  const growth = p5.growthSignals;
  if ((growth.visibility_growth ?? 0) >= 2) {
    entries.push({
      id: "visibility-growth",
      category: "visibility",
      label: "Visibility momentum building",
      recordedAt: p2.lastSessionAt,
    });
  }
  if ((growth.follow_through_improving ?? 0) >= 2) {
    entries.push({
      id: "follow-through",
      category: "follow_through",
      label: "Regular completion patterns emerging",
      recordedAt: p2.lastSessionAt,
    });
  }

  return entries
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, 24);
}

export function buildThenNowComparisons(now = new Date()): ThenNowComparison[] {
  const origin = buildOriginSnapshot(now);
  const p2 = getPhase2DiscoveryState();
  const p5 = getPhase5EcosystemState();
  const profile = getBusinessProfile();
  const comparisons: ThenNowComparison[] = [];

  const visibilityPattern = p2.adhdPatterns.find((p) => p.id === "visibility_resistance");
  const visibilityGrowth = p5.growthSignals.visibility_growth ?? 0;
  if (visibilityPattern || visibilityGrowth >= 2 || /visibility/i.test(origin.primaryChallenge ?? "")) {
    comparisons.push({
      dimension: "visibility",
      label: "Visibility",
      then: visibilityPattern ? "Avoided posting or being seen" : "Visibility felt hard",
      now:
        visibilityGrowth >= 3
          ? "Consistently sharing expertise"
          : visibilityGrowth >= 2
            ? "Showing up more often"
            : "Still building visibility — with more awareness",
      evidence: evidenceFromCount(visibilityGrowth + (visibilityPattern?.count ?? 0)),
    });
  }

  const confidenceGrowth = p5.growthSignals.confidence_increasing ?? 0;
  const wins = getRecentConfidenceWins(10).length;
  if (
    confidenceGrowth >= 2 ||
    wins >= 2 ||
    /confidence|doubt|second.?guess/i.test(origin.primaryChallenge ?? "")
  ) {
    comparisons.push({
      dimension: "confidence",
      label: "Confidence",
      then: "Second-guessed decisions",
      now:
        confidenceGrowth >= 3 || wins >= 4
          ? "Makes decisions with greater clarity"
          : "Growing confidence with evidence",
      evidence: evidenceFromCount(confidenceGrowth + wins),
    });
  }

  const offers = [
    profile?.sells,
    p2.business.primaryOffer,
    ...getProjects().map((p) => p.name),
  ].filter(Boolean) as string[];
  const uniqueOffers = [...new Set(offers)];
  if (uniqueOffers.length >= 1) {
    comparisons.push({
      dimension: "business",
      label: "Business",
      then: origin.businessStage ? `Early stage: ${origin.businessStage}` : "One unclear offer",
      now:
        uniqueOffers.length >= 3
          ? "Multiple validated offers and projects in motion"
          : uniqueOffers.length >= 2
            ? "Clearer offer with momentum building"
            : "Offer taking shape with more focus",
      evidence: evidenceFromCount(uniqueOffers.length + (p5.businessStage === "growth" ? 2 : 0)),
    });
  }

  const followThrough = p5.growthSignals.follow_through_improving ?? 0;
  const unfinished = p2.adhdPatterns.find((p) => p.id === "follow_through_challenges");
  if (followThrough >= 2 || unfinished) {
    comparisons.push({
      dimension: "follow_through",
      label: "Follow-Through",
      then: "Many unfinished projects",
      now:
        followThrough >= 3
          ? "Regular completion patterns"
          : "More finishes than before — momentum building",
      evidence: evidenceFromCount(followThrough),
    });
  }

  const decisionSpeed = p5.growthSignals.decision_speed_improving ?? 0;
  if (decisionSpeed >= 2) {
    comparisons.push({
      dimension: "decision_quality",
      label: "Decision Quality",
      then: "Decisions felt heavy and slow",
      now: "Clearer decisions with less second-guessing",
      evidence: evidenceFromCount(decisionSpeed),
    });
  }

  const leadership = p5.growthSignals.leadership_increasing ?? 0;
  if (leadership >= 2) {
    comparisons.push({
      dimension: "leadership",
      label: "Leadership",
      then: "Leading felt uncertain",
      now: "Stepping into leadership with more ease",
      evidence: evidenceFromCount(leadership),
    });
  }

  if (origin.struggles.some((s) => /overwhelm/i.test(s)) && daysSinceRelationshipStart(now) >= 60) {
    comparisons.push({
      dimension: "identity",
      label: "Identity",
      then: "I'm overwhelmed",
      now: "I'm capable — still human, but more resilient",
      evidence: evidenceFromCount(p2.sessionCount >= 25 ? 4 : 2),
    });
  }

  return comparisons;
}

export function buildPatternEvolution(now = new Date()): PatternEvolution[] {
  const p2 = getPhase2DiscoveryState();
  const p5 = getPhase5EcosystemState();
  const evolved: PatternEvolution[] = [];

  for (const pattern of p2.adhdPatterns) {
    const label = PATTERN_LABELS[pattern.id] ?? pattern.id.replace(/_/g, " ");
    const improving =
      (pattern.id === "visibility_resistance" && (p5.growthSignals.visibility_growth ?? 0) >= 2) ||
      (pattern.id === "follow_through_challenges" &&
        (p5.growthSignals.follow_through_improving ?? 0) >= 2);

    if (pattern.count >= 2) {
      evolved.push({
        id: pattern.id,
        label,
        narrative: improving
          ? `${label} still shows up sometimes — but you've improved, not eliminated it.`
          : `${label} is a pattern we're still learning to work with — without judgment.`,
        evidence: improving ? "growing" : evidenceFromCount(pattern.count),
      });
    }
  }

  for (const pattern of p2.challenges.filter((c) => c.count >= 3).slice(0, 4)) {
    if (evolved.some((e) => e.label.toLowerCase() === pattern.label.toLowerCase())) continue;
    evolved.push({
      id: `challenge-${pattern.label}`,
      label: pattern.label,
      narrative: `You've named "${pattern.label}" repeatedly — awareness is the first step toward change.`,
      evidence: evidenceFromCount(pattern.count),
    });
  }

  return evolved;
}

export function buildEmergingStrengths(now = new Date()): EmergingStrength[] {
  const p2 = getPhase2DiscoveryState();
  const p5 = getPhase5EcosystemState();
  const manual = buildPersonalOperatingManual();
  const strengths: EmergingStrength[] = [];

  for (const s of p2.strengths ?? []) {
    strengths.push({
      id: `strength-${s}`,
      label: s,
      narrative: `${s} keeps showing up as a real strength — not just a nice idea.`,
      evidence: "growing",
    });
  }

  if ((p5.growthSignals.leadership_increasing ?? 0) >= 2) {
    strengths.push({
      id: "leadership",
      label: "Leadership",
      narrative: "You're stepping into leadership more often — delegate, hire, or lead conversations.",
      evidence: evidenceFromCount(p5.growthSignals.leadership_increasing ?? 0),
    });
  }

  if (manual.whatCreatesMomentum.some((m) => /teach|workshop/i.test(m))) {
    strengths.push({
      id: "teaching",
      label: "Teaching",
      narrative: "Teaching builds trust and momentum for you — a real business strength.",
      evidence: "growing",
    });
  }

  if ((p5.growthSignals.decision_speed_improving ?? 0) >= 2) {
    strengths.push({
      id: "decision-making",
      label: "Decision-making",
      narrative: "Decisions are getting clearer and faster — that's capability, not luck.",
      evidence: evidenceFromCount(p5.growthSignals.decision_speed_improving ?? 0),
    });
  }

  if ((p5.growthSignals.visibility_growth ?? 0) >= 2) {
    strengths.push({
      id: "communication",
      label: "Communication",
      narrative: "You're sharing your expertise more — visibility is becoming a strength.",
      evidence: evidenceFromCount(p5.growthSignals.visibility_growth ?? 0),
    });
  }

  return strengths.slice(0, 8);
}

export function buildConfidenceLegacy(now = new Date()): ConfidenceLegacyItem[] {
  const wins = getRecentConfidenceWins(12);
  const manual = buildPersonalOperatingManual();
  const items: ConfidenceLegacyItem[] = wins.slice(0, 6).map((w) => ({
    source: w.kind,
    narrative: w.label,
  }));

  for (const source of manual.howIBuildConfidence.slice(0, 4)) {
    if (!items.some((i) => i.narrative === source)) {
      items.push({ source: "Pattern", narrative: source });
    }
  }

  return items;
}

export function buildBusinessLegacy(now = new Date()): BusinessLegacyItem[] {
  const profile = getBusinessProfile();
  const p2 = getPhase2DiscoveryState();
  const projects = getProjects();
  const saved = getSavedWork();
  const items: BusinessLegacyItem[] = [];

  if (profile?.sells || p2.business.primaryOffer) {
    items.push({
      kind: "offer",
      label: profile?.sells ?? p2.business.primaryOffer ?? "Primary offer",
      narrative: "A defined offer in the ecosystem.",
    });
  }

  for (const p of projects.filter((p) => p.status !== "completed").slice(0, 4)) {
    items.push({
      kind: "project",
      label: p.name,
      narrative: p.goal || "Project in your business legacy.",
    });
  }

  for (const s of saved.slice(0, 4)) {
    items.push({
      kind: "content",
      label: s.title,
      narrative: `${s.artifactType ?? "Asset"} in My Work.`,
    });
  }

  return items;
}

export function buildIdentityEvolution(now = new Date()): IdentityShift[] {
  const origin = buildOriginSnapshot(now);
  const p5 = getPhase5EcosystemState();
  const shifts: IdentityShift[] = [];

  if (origin.struggles.some((s) => /overwhelm/i.test(s))) {
    shifts.push({
      then: "I'm overwhelmed",
      now: "I'm capable",
      evidence: (p5.growthSignals.confidence_increasing ?? 0) >= 2 ? "growing" : "early",
    });
  }

  if (origin.businessStage?.match(/new|starting/i)) {
    shifts.push({
      then: "I'm not good at business",
      now: "I'm building a real business",
      evidence: getProjects().length >= 2 ? "growing" : "early",
    });
  }

  if (origin.confidenceThemes.length > 0) {
    shifts.push({
      then: "I don't trust myself",
      now: "I can make decisions",
      evidence: (p5.growthSignals.decision_speed_improving ?? 0) >= 2 ? "growing" : "early",
    });
  }

  return shifts;
}

export function buildAnnualTransformationReview(
  now = new Date(),
  parts?: Pick<
    TransformationIntelligenceSnapshot,
    "patternEvolution" | "strengths" | "confidenceLegacy" | "businessLegacy"
  >,
): AnnualTransformationReview | null {
  const days = daysSinceRelationshipStart(now);
  const yearMark: 1 | 2 | 3 | 5 | null =
    days >= 1825 ? 5 : days >= 1095 ? 3 : days >= 730 ? 2 : days >= 180 ? 1 : null;
  if (!yearMark) return null;

  const legacy = buildLegacyIntelligence(now);
  const patternEvolution = parts?.patternEvolution ?? buildPatternEvolution(now);
  const strengths = parts?.strengths ?? buildEmergingStrengths(now);
  const confidenceLegacy = parts?.confidenceLegacy ?? buildConfidenceLegacy(now);
  const businessLegacy = parts?.businessLegacy ?? buildBusinessLegacy(now);

  return {
    yearMark,
    title: "What We Built Together This Year",
    highlights: [
      `${legacy.sessionsTogether} sessions together`,
      `${businessLegacy.length} business assets in your legacy`,
      patternEvolution[0]?.narrative,
      strengths[0]?.narrative,
      confidenceLegacy[0]?.narrative,
      legacy.narrative,
    ].filter(Boolean) as string[],
  };
}

export function buildTransformationIntelligenceSnapshot(
  now = new Date(),
): TransformationIntelligenceSnapshot {
  const thenNow = buildThenNowComparisons(now);
  const patternEvolution = buildPatternEvolution(now);
  const strengths = buildEmergingStrengths(now);
  const confidenceLegacy = buildConfidenceLegacy(now);
  const businessLegacy = buildBusinessLegacy(now);

  const transformationNarrative =
    thenNow.length >= 2
      ? `You've changed more than you may realize — especially in ${thenNow
          .slice(0, 2)
          .map((t) => t.label.toLowerCase())
          .join(" and ")}.`
      : "Your transformation story is still being written — every session adds evidence.";

  return {
    origin: buildOriginSnapshot(now),
    timeline: buildTransformationTimeline(now),
    thenNow,
    patternEvolution,
    strengths,
    confidenceLegacy,
    businessLegacy,
    identity: buildIdentityEvolution(now),
    annualReview: buildAnnualTransformationReview(now, {
      patternEvolution,
      strengths,
      confidenceLegacy,
      businessLegacy,
    }),
    transformationNarrative,
    updatedAt: now.toISOString(),
  };
}

export function isPhase10TransformationIntelligenceActive(now = new Date()): boolean {
  if (!isPhase7BusinessIntelligenceEcosystemActive(now)) return false;
  if (daysSinceRelationshipStart(now) < MIN_TRANSFORMATION_DAYS) return false;

  const snap = buildTransformationIntelligenceSnapshot(now);
  const evidencedThenNow = snap.thenNow.filter((t) => t.evidence !== "early").length;
  return (
    snap.origin.goals.length >= 1 &&
    snap.thenNow.length >= MIN_THEN_NOW &&
    evidencedThenNow >= 2 &&
    snap.patternEvolution.length >= 1 &&
    snap.strengths.length >= 1 &&
    snap.businessLegacy.length >= 1
  );
}

function cooldownClear(lastAt: string | undefined, now: Date): boolean {
  if (!lastAt) return true;
  return now.getTime() - new Date(lastAt).getTime() >= REFLECTION_COOLDOWN_MS;
}

export function maybeTransformationReflection(input: {
  userText: string;
  now?: Date;
}): string | null {
  if (!isPhase10TransformationIntelligenceActive(input.now)) return null;

  const now = input.now ?? new Date();
  const cur = readState();
  if (!cooldownClear(cur.lastReflectionOfferAt, now)) return null;

  const text = input.userText;
  const snap = buildTransformationIntelligenceSnapshot(now);

  if (/\b(progress|changed|growth|look back|proud|how far)\b/i.test(text)) {
    const comparison = snap.thenNow.find((t) => t.evidence !== "early") ?? snap.thenNow[0];
    if (comparison) {
      return `Looking back: ${comparison.label} — then: ${comparison.then}. Now: ${comparison.now}. (Only if that fits — correct me if not.)`;
    }
  }

  if (/\bvisibility|posting|marketing\b/i.test(text)) {
    const v = snap.thenNow.find((t) => t.dimension === "visibility");
    if (v) {
      return `You've come a long way since we first started talking about visibility. ${v.now}`;
    }
  }

  if (/\bpricing|confidence|decision\b/i.test(text)) {
    const c = snap.thenNow.find((t) => t.dimension === "confidence");
    if (c) {
      return `When we first met, ${c.label.toLowerCase()} created uncertainty. ${c.now} — does that resonate?`;
    }
  }

  const strength = snap.strengths.find((s) => s.evidence !== "early");
  if (strength && /\bstuck|doubt|can't\b/i.test(text)) {
    return `${strength.label} is emerging as a real strength: ${strength.narrative}`;
  }

  return null;
}

export function recordTransformationReflectionShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastReflectionOfferAt: now.toISOString(),
    reflectionsOffered: cur.reflectionsOffered + 1,
  });
}

export function observeTransformationIntelligenceTurn(input: {
  userText: string;
  now?: Date;
}): TransformationIntelligenceState {
  if (!isPhase10TransformationIntelligenceActive(input.now)) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const cur = readState();
  const timeline = buildTransformationTimeline(input.now).length;
  const next = {
    ...cur,
    timelineCaptured: Math.max(cur.timelineCaptured, timeline),
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  writeState(next);
  return next;
}

export function formatTransformationIntelligenceForPanel(
  snapshot = buildTransformationIntelligenceSnapshot(),
): string {
  return [
    "## Legacy & Transformation Intelligence",
    "",
    "_Who you were → who you're becoming — evidence, not flattery._",
    "",
    "### Origin Snapshot",
    snapshot.origin.primaryChallenge
      ? `Started with: ${snapshot.origin.primaryChallenge}`
      : "Starting point captured from our early conversations.",
    snapshot.origin.dreamOutcomes[0]
      ? `Dream outcome: ${snapshot.origin.dreamOutcomes[0]}`
      : null,
    "",
    "### Then → Now",
    ...snapshot.thenNow.map((t) => `**${t.label}** — Then: ${t.then}. Now: ${t.now}.`),
    "",
    "### Patterns Overcome (Improved)",
    ...snapshot.patternEvolution.map((p) => `• ${p.narrative}`),
    "",
    "### Emerging Strengths",
    ...snapshot.strengths.map((s) => `• ${s.label}: ${s.narrative}`),
    "",
    "### Confidence Legacy",
    ...snapshot.confidenceLegacy.slice(0, 5).map((c) => `• ${c.narrative}`),
    "",
    "### Business Legacy",
    ...snapshot.businessLegacy.slice(0, 6).map((b) => `• ${b.label} — ${b.narrative}`),
    "",
    snapshot.annualReview
      ? `### ${snapshot.annualReview.title}\n${snapshot.annualReview.highlights.map((h) => `• ${h}`).join("\n")}`
      : null,
    "",
    snapshot.transformationNarrative,
  ]
    .filter(Boolean)
    .join("\n");
}

export function phase10TransformationIntelligenceHintForChat(input?: {
  userText?: string;
  reflection?: string | null;
}): string | null {
  if (!isPhase10TransformationIntelligenceActive()) return null;

  const snapshot = buildTransformationIntelligenceSnapshot();
  const reflection =
    input?.reflection ??
    (input?.userText ? maybeTransformationReflection({ userText: input.userText }) : null);

  const parts = [
    "PHASE 10 LEGACY & TRANSFORMATION INTELLIGENCE (understand what changed):",
    "Goal: answer who they were, who they're becoming, what they built, overcame, and learned.",
    "Transformation not productivity. Evidence-based reflection — no flattery, no exaggeration.",
    `Origin challenge: ${snapshot.origin.primaryChallenge ?? "emerging"}`,
    `Then/Now comparisons: ${snapshot.thenNow.length}. Patterns evolved: ${snapshot.patternEvolution.length}.`,
    `Emerging strengths: ${snapshot.strengths.map((s) => s.label).join(", ") || "still emerging"}.`,
    `Business legacy items: ${snapshot.businessLegacy.length}. Confidence evidence: ${snapshot.confidenceLegacy.length}.`,
    "User should feel seen, remembered, proud — 'I've changed more than I realized.'",
  ];

  if (reflection) {
    parts.push("TRANSFORMATION REFLECTION (permission-based — optional):", `"${reflection}"`);
  }

  if (snapshot.thenNow[0]) {
    parts.push(
      `Then/Now: ${snapshot.thenNow[0].label} — ${snapshot.thenNow[0].then} → ${snapshot.thenNow[0].now}`,
    );
  }

  return parts.join("\n");
}

export function resetTransformationIntelligenceForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Validation exports
export function validateVisibilityGrowth(now = new Date()): boolean {
  return buildThenNowComparisons(now).some((t) => t.dimension === "visibility");
}

export function validateConfidenceEvolution(now = new Date()): boolean {
  return buildThenNowComparisons(now).some((t) => t.dimension === "confidence");
}

export function validateBusinessMaturity(now = new Date()): boolean {
  return buildThenNowComparisons(now).some((t) => t.dimension === "business");
}

export function validatePatternImprovement(now = new Date()): boolean {
  return buildPatternEvolution(now).length >= 1;
}

export function validateStrengthEmergence(now = new Date()): boolean {
  return buildEmergingStrengths(now).length >= 1;
}

export function validateLegacyAccuracy(now = new Date()): boolean {
  const snap = buildTransformationIntelligenceSnapshot(now);
  return snap.thenNow.every(
    (t) => t.evidence === "early" || t.evidence === "growing" || t.evidence === "strong",
  );
}
