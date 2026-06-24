/**
 * P0.4 — Relationship memory confidence pipeline.
 * Audits inputs, logs diagnostics, and resolves confidence without blocking
 * established companions on legacy phase-1 gate alone.
 */

import { getRelationshipMemory } from "./companionAdaptiveUserEngine";
import {
  getCurrentRelationshipPhase,
  isEstablishedRelationshipForChat,
} from "./companionRelationshipPhases";
import {
  getPhase1OnboardingState,
  isPhase1OnboardingComplete,
  type Phase1RelationshipProfile,
} from "./phase1Onboarding";
import {
  buildWhatIveLearnedProfile,
  getPhase2DiscoveryState,
} from "./phase2ProgressiveDiscovery";
import {
  daysSinceRelationshipStart,
  getPhase3RelationshipState,
} from "./phase3AdaptiveRelationship";
import { buildRelationshipObservations } from "./relationshipObservationEngine";
import { buildTransformationIntelligenceSnapshot } from "./transformationIntelligence";
import { buildWisdomIntelligenceSummary } from "./wisdomIntelligence";

export type RelationshipMemoryConfidence = "none" | "forming" | "sufficient";

const DEV_ENABLED =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export type RelationshipConfidenceSignalBreakdown = {
  patternsGte2: number;
  patternsRaw: number;
  predictiveGte2: number;
  profileStrengths: number;
  profileChallenges: number;
  p2ChallengesGte1: number;
  goals: number;
  businessType: number;
  phase1ProfileFields: number;
  wisdomItems: number;
  transformationMarkers: number;
  relationshipMemoryGoals: number;
  helpfulResources: number;
};

export type RelationshipConfidenceAudit = {
  relationshipPhase: number;
  relationshipPhaseName: string;
  phase1Complete: boolean;
  establishedRelationship: boolean;
  patternsCount: number;
  patternsRawCount: number;
  observationsCount: number;
  strengthsCount: number;
  challengesCount: number;
  wisdomCount: number;
  transformationCount: number;
  businessHistoryCount: number;
  relationshipAgeDays: number;
  sessionCount: number;
  graphNodes: number | null;
  signalCount: number;
  signalBreakdown: RelationshipConfidenceSignalBreakdown;
  legacyResult: RelationshipMemoryConfidence;
  legacyReason: string;
  result: RelationshipMemoryConfidence;
  resultReason: string;
  wouldHaveBeenNone: boolean;
  noneReason?: string;
};

export type RelationshipObservationsAudit = {
  observationCount: number;
  topObservations: { id: string; text: string; confidence: string; score: number }[];
  memoryConfidence: RelationshipMemoryConfidence;
  mismatch: boolean;
  mismatchReason: string | null;
};

let lastConfidenceAudit: RelationshipConfidenceAudit | null = null;

export function getLastRelationshipConfidenceAudit(): RelationshipConfidenceAudit | null {
  return lastConfidenceAudit;
}

function countPhase1ProfileFields(profile: Phase1RelationshipProfile): number {
  return [
    profile.winDefinition,
    profile.businessType,
    profile.audience,
    profile.primaryChallenge,
    profile.immediateGoal,
  ].filter(Boolean).length;
}

function computeSignalBreakdown(now = new Date()): {
  breakdown: RelationshipConfidenceSignalBreakdown;
  signalCount: number;
} {
  const p2 = getPhase2DiscoveryState();
  const p3 = getPhase3RelationshipState();
  const profile = buildWhatIveLearnedProfile();
  const p1 = getPhase1OnboardingState();
  const memory = getRelationshipMemory();
  const wisdom = buildWisdomIntelligenceSummary();
  const transformation = buildTransformationIntelligenceSnapshot(now);

  const patternsGte2 = p2.adhdPatterns.filter((p) => p.count >= 2).length;
  const predictiveGte2 = p3.predictivePatterns.filter((p) => p.count >= 2).length;
  const p2ChallengesGte1 = p2.challenges.filter((c) => c.count >= 1).length;
  const goals =
    p2.goals.length + (profile.business.currentGoal ? 1 : 0) + (memory.goals?.length ?? 0);
  const businessType = profile.business.type ? 1 : 0;
  const phase1ProfileFields = countPhase1ProfileFields(p1.profile);
  const wisdomItems = wisdom.items.length;
  const transformationMarkers =
    transformation.thenNow.length + transformation.patternEvolution.length;
  const helpfulResources = profile.helpfulResources.length;

  const breakdown: RelationshipConfidenceSignalBreakdown = {
    patternsGte2,
    patternsRaw: p2.adhdPatterns.length,
    predictiveGte2,
    profileStrengths: profile.strengths.length,
    profileChallenges: profile.challenges.length,
    p2ChallengesGte1,
    goals,
    businessType,
    phase1ProfileFields,
    wisdomItems,
    transformationMarkers,
    relationshipMemoryGoals: memory.goals?.length ?? 0,
    helpfulResources,
  };

  const signalCount =
    patternsGte2 +
    predictiveGte2 +
    profile.strengths.length +
    profile.challenges.length +
    p2ChallengesGte1 +
    (goals > 0 ? 1 : 0) +
    businessType +
    phase1ProfileFields +
    (wisdomItems > 0 ? 1 : 0) +
    (transformationMarkers > 0 ? 1 : 0) +
    helpfulResources;

  return { breakdown, signalCount };
}

function hasMeaningfulRelationshipHistory(input: {
  signalCount: number;
  sessionCount: number;
  relationshipAgeDays: number;
  observationsCount: number;
  strengthsCount: number;
  challengesCount: number;
  patternsRawCount: number;
  phase1ProfileFields: number;
}): boolean {
  return (
    input.observationsCount > 0 ||
    input.signalCount >= 1 ||
    input.sessionCount >= 3 ||
    input.relationshipAgeDays >= 14 ||
    input.strengthsCount > 0 ||
    input.challengesCount > 0 ||
    input.patternsRawCount > 0 ||
    input.phase1ProfileFields > 0
  );
}

function computeLegacyConfidence(input: {
  phase1Complete: boolean;
  relationshipPhase: number;
  sessionCount: number;
  signalCount: number;
}): { result: RelationshipMemoryConfidence; reason: string } {
  if (!input.phase1Complete) {
    return { result: "none", reason: "legacy: phase1 onboarding incomplete" };
  }
  if (input.relationshipPhase >= 4) {
    return {
      result: input.signalCount >= 2 ? "sufficient" : "forming",
      reason: `legacy: phase ${input.relationshipPhase} with signalCount ${input.signalCount}`,
    };
  }
  if (input.sessionCount >= 3 && input.signalCount >= 1) {
    return {
      result: input.signalCount >= 2 ? "sufficient" : "forming",
      reason: `legacy: sessions=${input.sessionCount}, signals=${input.signalCount}`,
    };
  }
  return {
    result: "none",
    reason: `legacy: phase ${input.relationshipPhase}, sessions=${input.sessionCount}, signals=${input.signalCount}`,
  };
}

function resolveConfidence(input: {
  phase1Complete: boolean;
  relationshipPhase: number;
  sessionCount: number;
  signalCount: number;
  observationsCount: number;
  relationshipAgeDays: number;
  strengthsCount: number;
  challengesCount: number;
  patternsRawCount: number;
  phase1ProfileFields: number;
  legacyResult: RelationshipMemoryConfidence;
}): { result: RelationshipMemoryConfidence; resultReason: string; noneReason?: string } {
  const meaningful = hasMeaningfulRelationshipHistory({
    signalCount: input.signalCount,
    sessionCount: input.sessionCount,
    relationshipAgeDays: input.relationshipAgeDays,
    observationsCount: input.observationsCount,
    strengthsCount: input.strengthsCount,
    challengesCount: input.challengesCount,
    patternsRawCount: input.patternsRawCount,
    phase1ProfileFields: input.phase1ProfileFields,
  });

  if (input.observationsCount > 0) {
    return {
      result: input.signalCount >= 2 ? "sufficient" : "forming",
      resultReason: `observations exist (${input.observationsCount})`,
    };
  }

  if (input.relationshipPhase >= 4) {
    return {
      result: input.signalCount >= 2 ? "sufficient" : "forming",
      resultReason: `phase >= 4 floor (phase=${input.relationshipPhase}, signals=${input.signalCount})`,
    };
  }

  if (!input.phase1Complete) {
    if (meaningful) {
      return {
        result: input.signalCount >= 2 ? "sufficient" : "forming",
        resultReason: "phase1 incomplete but meaningful relationship history exists",
        noneReason: "legacy blocked on phase1 incomplete despite stored history",
      };
    }
    if (input.relationshipPhase <= 2) {
      return {
        result: "none",
        resultReason: "phase1 incomplete, phase <= 2, no meaningful history",
        noneReason: "phase1 incomplete with no stored relationship signals",
      };
    }
    return {
      result: "forming",
      resultReason: `phase1 incomplete but phase ${input.relationshipPhase} active`,
      noneReason: "legacy blocked on phase1 incomplete",
    };
  }

  if (input.sessionCount >= 3 && input.signalCount >= 1) {
    return {
      result: input.signalCount >= 2 ? "sufficient" : "forming",
      resultReason: `sessions=${input.sessionCount} and signals=${input.signalCount}`,
    };
  }

  if (input.relationshipPhase <= 2 && !meaningful) {
    return {
      result: "none",
      resultReason: "phase <= 2 with no meaningful relationship history",
      noneReason: "early phase with no patterns, sessions, or profile signals",
    };
  }

  if (input.relationshipPhase >= 3) {
    return {
      result: "forming",
      resultReason: `phase ${input.relationshipPhase} floor without none`,
      noneReason: "legacy required more sessions/signals for phase 3",
    };
  }

  return {
    result: "none",
    resultReason: `insufficient history (sessions=${input.sessionCount}, signals=${input.signalCount})`,
    noneReason: "sessions < 3 or signalCount < 1 in early relationship",
  };
}

export function auditRelationshipConfidenceInputs(
  now = new Date(),
): RelationshipConfidenceAudit {
  const current = getCurrentRelationshipPhase();
  const p2 = getPhase2DiscoveryState();
  const profile = buildWhatIveLearnedProfile();
  const p1 = getPhase1OnboardingState();
  const wisdom = buildWisdomIntelligenceSummary();
  const transformation = buildTransformationIntelligenceSnapshot(now);
  const observations = buildRelationshipObservations(now, { limit: 7 });
  const { breakdown, signalCount } = computeSignalBreakdown(now);

  const legacy = computeLegacyConfidence({
    phase1Complete: isPhase1OnboardingComplete(),
    relationshipPhase: current.number,
    sessionCount: p2.sessionCount,
    signalCount,
  });

  const resolved = resolveConfidence({
    phase1Complete: isPhase1OnboardingComplete(),
    relationshipPhase: current.number,
    sessionCount: p2.sessionCount,
    signalCount,
    observationsCount: observations.length,
    relationshipAgeDays: daysSinceRelationshipStart(now),
    strengthsCount: profile.strengths.length,
    challengesCount: profile.challenges.length,
    patternsRawCount: breakdown.patternsRaw,
    phase1ProfileFields: breakdown.phase1ProfileFields,
    legacyResult: legacy.result,
  });

  return {
    relationshipPhase: current.number,
    relationshipPhaseName: current.name,
    phase1Complete: isPhase1OnboardingComplete(),
    establishedRelationship: isEstablishedRelationshipForChat(),
    patternsCount: breakdown.patternsGte2,
    patternsRawCount: breakdown.patternsRaw,
    observationsCount: observations.length,
    strengthsCount: profile.strengths.length,
    challengesCount: profile.challenges.length,
    wisdomCount: wisdom.items.length,
    transformationCount:
      transformation.thenNow.length + transformation.patternEvolution.length,
    businessHistoryCount:
      breakdown.goals + breakdown.businessType + breakdown.phase1ProfileFields,
    relationshipAgeDays: daysSinceRelationshipStart(now),
    sessionCount: p2.sessionCount,
    graphNodes: null,
    signalCount,
    signalBreakdown: breakdown,
    legacyResult: legacy.result,
    legacyReason: legacy.reason,
    result: resolved.result,
    resultReason: resolved.resultReason,
    wouldHaveBeenNone: legacy.result === "none" && resolved.result !== "none",
    noneReason:
      resolved.result === "none"
        ? resolved.noneReason ?? resolved.resultReason
        : legacy.result === "none"
          ? resolved.noneReason ?? legacy.reason
          : undefined,
  };
}

export function auditRelationshipObservations(
  now = new Date(),
  options?: { userText?: string },
): RelationshipObservationsAudit {
  const observations = buildRelationshipObservations(now, {
    userText: options?.userText,
    limit: 7,
  });
  const audit = auditRelationshipConfidenceInputs(now);
  const mismatch =
    observations.length > 0 && audit.result === "none";
  return {
    observationCount: observations.length,
    topObservations: observations.slice(0, 3).map((o) => ({
      id: o.id,
      text: o.text,
      confidence: o.confidence,
      score: o.score,
    })),
    memoryConfidence: audit.result,
    mismatch,
    mismatchReason: mismatch
      ? "observations exist but memoryConfidence resolved to none"
      : observations.length === 0 && audit.result !== "none"
        ? "memoryConfidence active but observation engine returned zero observations"
        : null,
  };
}

export function logRelationshipConfidenceAudit(
  audit: RelationshipConfidenceAudit = auditRelationshipConfidenceInputs(),
): void {
  if (!DEV_ENABLED) return;

  const payload = {
    phase: audit.relationshipPhase,
    phaseName: audit.relationshipPhaseName,
    phase1Complete: audit.phase1Complete,
    establishedRelationship: audit.establishedRelationship,
    patterns: audit.patternsCount,
    patternsRaw: audit.patternsRawCount,
    observations: audit.observationsCount,
    strengths: audit.strengthsCount,
    challenges: audit.challengesCount,
    wisdom: audit.wisdomCount,
    transformation: audit.transformationCount,
    businessHistory: audit.businessHistoryCount,
    ageDays: audit.relationshipAgeDays,
    sessions: audit.sessionCount,
    graphNodes: audit.graphNodes,
    signalCount: audit.signalCount,
    signalBreakdown: audit.signalBreakdown,
    legacyResult: audit.legacyResult,
    legacyReason: audit.legacyReason,
    result: audit.result,
    resultReason: audit.resultReason,
    wouldHaveBeenNone: audit.wouldHaveBeenNone,
    noneReason: audit.noneReason ?? null,
  };

  if (audit.result === "none") {
    console.warn("[relationship-confidence]", payload);
  } else if (audit.wouldHaveBeenNone) {
    console.warn("[relationship-confidence] floor applied", payload);
  } else {
    console.debug("[relationship-confidence]", payload);
  }
}

export function logRelationshipObservationsAudit(
  options?: { userText?: string; now?: Date },
): RelationshipObservationsAudit {
  const obsAudit = auditRelationshipObservations(options?.now, {
    userText: options?.userText,
  });
  if (!DEV_ENABLED) return obsAudit;

  const logFn = obsAudit.mismatch ? console.warn : console.debug;
  logFn("[relationship-observations]", {
    observationCount: obsAudit.observationCount,
    topObservations: obsAudit.topObservations,
    memoryConfidence: obsAudit.memoryConfidence,
    mismatch: obsAudit.mismatch,
    mismatchReason: obsAudit.mismatchReason,
  });
  return obsAudit;
}

export function assessRelationshipMemoryConfidence(
  now = new Date(),
): RelationshipMemoryConfidence {
  const audit = auditRelationshipConfidenceInputs(now);
  lastConfidenceAudit = audit;
  return audit.result;
}
