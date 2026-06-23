/**
 * Companion Capability Readiness™ — 12/10 scoring per capability.
 */

import {
  validateCapabilityDesign,
  runVision2029Test,
} from "./futureCapabilityArchitecture";
import { validateFutureFeature } from "./adaptiveCompanionArchitecture";
import type { CapabilityStatus } from "./companionCapabilityRegistry";
import {
  COMPANION_CAPABILITY_REGISTRY,
  type CompanionCapabilityEntry,
  type CompanionCapabilityId,
  getCapabilityById,
} from "./companionCapabilityRegistry";

export type ReadinessDimension =
  | "discoverability"
  | "routingQuality"
  | "contextCarryover"
  | "learningFeedback"
  | "outcomeTracking"
  | "trustImpact"
  | "confidenceImpact"
  | "momentumProtection"
  | "futureScalability";

export type CompanionReadinessScore = {
  capabilityId: CompanionCapabilityId;
  name: string;
  status: CapabilityStatus;
  overall: number;
  threshold: number;
  passed: boolean;
  dimensions: Record<ReadinessDimension, number>;
  designGatePassed: boolean;
  vision2029Passed: boolean;
  futureFeaturePassed: boolean;
  gaps: string[];
};

const READINESS_THRESHOLDS: Record<CapabilityStatus, number> = {
  production: 90,
  partial: 75,
  future: 40,
};

function scoreDiscoverability(cap: CompanionCapabilityEntry): number {
  if (cap.routingType === "intelligence" && cap.intelligenceHint) return 95;
  if (cap.routingRules.intentPatterns.length > 0) return 100;
  if (cap.appFeatureId) return 70;
  if (cap.status === "future") return 50;
  return 30;
}

function scoreRoutingQuality(cap: CompanionCapabilityEntry): number {
  let score = 40;
  if (cap.routingRules.intentPatterns.length > 0) score += 25;
  if (cap.routingRules.whenToOffer) score += 10;
  if (cap.routingRules.whenNotToOffer.length > 0) score += 10;
  if (cap.routingRules.contraindications.length > 0) score += 10;
  if (cap.routingRules.permissionLanguage) score += 10;
  if (cap.firstStepHint) score += 5;
  if (cap.status === "future" && cap.routingType === "future") score = Math.max(score, 55);
  return Math.min(100, score);
}

function scoreContextCarryover(cap: CompanionCapabilityEntry): number {
  const fields = Object.values(cap.contextContract);
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function scoreLearningFeedback(cap: CompanionCapabilityEntry): number {
  const required: (typeof cap.learningSignals)[number][] = [
    "offer_shown",
    "offer_accepted",
    "offer_dismissed",
    "feature_opened",
    "action_completed",
  ];
  const has = required.every((s) => cap.learningSignals.includes(s));
  return has ? 100 : 60;
}

function scoreOutcomeTracking(cap: CompanionCapabilityEntry): number {
  const key: (typeof cap.outcomeSignals)[number][] = [
    "reduce_overwhelm",
    "start_action",
    "build_confidence",
    "preserve_momentum",
  ];
  const has = key.every((s) => cap.outcomeSignals.includes(s));
  return has ? 100 : 65;
}

function scoreTrustImpact(cap: CompanionCapabilityEntry): number {
  let score = 50;
  if (cap.interventionBucket) score += 25;
  if (cap.routingRules.permissionLanguage.includes("stay")) score += 15;
  if (cap.routingType === "intelligence") score += 10;
  return Math.min(100, score);
}

function scoreConfidenceImpact(cap: CompanionCapabilityEntry): number {
  if (cap.outcomeSignals.includes("build_confidence")) return 95;
  if (cap.needMapping.actualNeeds.includes("build_confidence")) return 90;
  return 75;
}

function scoreMomentumProtection(cap: CompanionCapabilityEntry): number {
  let score = 60;
  if (cap.outcomeSignals.includes("preserve_momentum")) score += 20;
  if (cap.routingRules.contraindications.length > 0) score += 15;
  if (cap.routingRules.whenNotToOffer.some((w) => /momentum|hyperfocus/i.test(w))) score += 5;
  return Math.min(100, score);
}

function scoreFutureScalability(cap: CompanionCapabilityEntry): number {
  let score = 70;
  if (cap.ownerModule.startsWith("lib/companionCapabilityRegistry")) score -= 10;
  if (cap.routingType !== "future" && cap.routingRules.intentPatterns.length > 0) score += 20;
  if (cap.interventionBucket || cap.routingType === "intelligence") score += 10;
  return Math.min(100, Math.max(0, score));
}

function passesFutureMinimum(cap: CompanionCapabilityEntry): boolean {
  return (
    Boolean(cap.id && cap.name) &&
    cap.needMapping.actualNeeds.length > 0 &&
    Object.values(cap.contextContract).some(Boolean) &&
    cap.status === "future"
  );
}

export function buildCompanionReadinessScore(
  capabilityId: CompanionCapabilityId,
): CompanionReadinessScore | null {
  const cap = getCapabilityById(capabilityId);
  if (!cap) return null;

  const dimensions: Record<ReadinessDimension, number> = {
    discoverability: scoreDiscoverability(cap),
    routingQuality: scoreRoutingQuality(cap),
    contextCarryover: scoreContextCarryover(cap),
    learningFeedback: scoreLearningFeedback(cap),
    outcomeTracking: scoreOutcomeTracking(cap),
    trustImpact: scoreTrustImpact(cap),
    confidenceImpact: scoreConfidenceImpact(cap),
    momentumProtection: scoreMomentumProtection(cap),
    futureScalability: scoreFutureScalability(cap),
  };

  const values = Object.values(dimensions);
  const overall = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  const threshold = READINESS_THRESHOLDS[cap.status];

  const design = validateCapabilityDesign({
    observable: cap.learningSignals.length >= 5,
    learnable: cap.learningSignals.includes("offer_accepted"),
    personalizable: cap.contextContract.learningStyle || cap.contextContract.userGoal,
    predictable: cap.needMapping.adhdPatterns.length > 0,
    companionConnected: cap.routingType !== "future" || cap.status === "future",
  });

  const vision = runVision2029Test({
    scalesTenX: cap.routingRules.intentPatterns.length > 0 || cap.status === "future",
    usesRegistrationNotHardcoding: true,
    companionRemainsCenter: cap.routingRules.permissionLanguage.length > 10,
  });

  const futureFeature = validateFutureFeature({
    improvesUserOutcomes: cap.outcomeSignals.length >= 3,
    improvesTrust: cap.learningSignals.includes("offer_accepted"),
    improvesConfidence: cap.outcomeSignals.includes("build_confidence"),
    reducesFriction: cap.outcomeSignals.includes("reduce_overwhelm"),
    improvesMomentum: cap.outcomeSignals.includes("preserve_momentum"),
    fitsOneCompanionPhilosophy: true,
    evolvesWithoutArchitecturalDebt: true,
  });

  const gaps: string[] = [];
  for (const [dim, score] of Object.entries(dimensions) as [ReadinessDimension, number][]) {
    if (score < 80) gaps.push(`${dim}: ${score}`);
  }
  if (!design.passesArchitectureRule) gaps.push(...design.blockers);
  if (!vision.approved) gaps.push(...vision.blockers);
  if (!futureFeature.approved) gaps.push(...futureFeature.blockers);

  const passed =
    cap.status === "future"
      ? passesFutureMinimum(cap) && design.passesArchitectureRule
      : overall >= threshold && design.passesArchitectureRule && vision.approved;

  return {
    capabilityId: cap.id,
    name: cap.name,
    status: cap.status,
    overall,
    threshold,
    passed,
    dimensions,
    designGatePassed: design.passesArchitectureRule,
    vision2029Passed: vision.approved,
    futureFeaturePassed: futureFeature.approved,
    gaps,
  };
}

export function buildAllCompanionReadinessScores(): CompanionReadinessScore[] {
  return COMPANION_CAPABILITY_REGISTRY.map((c) => buildCompanionReadinessScore(c.id)!);
}

export function evaluateReadinessPortfolio(): {
  evaluatedAt: string;
  total: number;
  passing: number;
  failing: number;
  productionPassing: number;
  productionTotal: number;
  partialPassing: number;
  partialTotal: number;
  futureRegistered: number;
  futureTotal: number;
  scores: CompanionReadinessScore[];
} {
  const scores = buildAllCompanionReadinessScores();
  const production = scores.filter((s) => s.status === "production");
  const partial = scores.filter((s) => s.status === "partial");
  const future = scores.filter((s) => s.status === "future");

  return {
    evaluatedAt: new Date().toISOString(),
    total: scores.length,
    passing: scores.filter((s) => s.passed).length,
    failing: scores.filter((s) => !s.passed).length,
    productionPassing: production.filter((s) => s.passed).length,
    productionTotal: production.length,
    partialPassing: partial.filter((s) => s.passed).length,
    partialTotal: partial.length,
    futureRegistered: future.filter((s) => s.passed).length,
    futureTotal: future.length,
    scores,
  };
}

export function formatReadinessPortfolioText(): string {
  const p = evaluateReadinessPortfolio();
  const lines = p.scores
    .sort((a, b) => a.overall - b.overall)
    .map(
      (s) =>
        `  ${s.name} (${s.status}): ${s.overall}/${s.threshold} ${s.passed ? "PASS" : "FAIL"}`,
    );
  return [
    "Companion Capability Readiness — 12/10 Portfolio",
    `Evaluated: ${p.evaluatedAt}`,
    `Total: ${p.total} | Passing: ${p.passing} | Failing: ${p.failing}`,
    `Production: ${p.productionPassing}/${p.productionTotal} (target 90+)`,
    `Partial: ${p.partialPassing}/${p.partialTotal} (target 75+)`,
    `Future hooks: ${p.futureRegistered}/${p.futureTotal}`,
    ...lines,
  ].join("\n");
}
