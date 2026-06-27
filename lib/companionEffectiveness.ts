/**
 * Companion Effectiveness System — measure whether the companion helps users move forward.
 *
 * Privacy: patterns for improvement only — never negative labels or shame.
 */

import type { LearningStyleId } from "./companionAdaptiveUserEngine";
import {
  getUserInterventionEffectiveness,
  type InterventionEffectivenessEntry,
} from "./companionInterventionLearning";

export type OutcomeCategory =
  | "decisions"
  | "actions"
  | "completions"
  | "confidence"
  | "momentum";

export type BusinessOutcomeType =
  | "sales_call_completed"
  | "follow_up_completed"
  | "proposal_sent"
  | "post_published"
  | "video_published"
  | "project_started"
  | "project_finished"
  | "webinar_delivered"
  | "speaking_accepted"
  | "decision_made"
  | "decision_avoided";

export type OutcomeRecord = {
  id: string;
  category: OutcomeCategory;
  businessType?: BusinessOutcomeType;
  label: string;
  interventionId?: string;
  learningStyle?: LearningStyleId;
  recordedAt: string;
};

export type LearningStyleEffectiveness = {
  style: LearningStyleId;
  offered: number;
  accepted: number;
  completed: number;
  acceptanceRate: number;
  completionRate: number;
  actionRate: number;
};

export type UserOutcomeProfile = {
  mostSuccessfulInterventions: string[];
  mostSuccessfulConversationStyles: LearningStyleId[];
  mostSuccessfulLearningMethods: LearningStyleEffectiveness[];
  mostSuccessfulRoutingPatterns: string[];
  mostSuccessfulRecoveryPatterns: string[];
  mostSuccessfulBusinessSupportPatterns: string[];
  outcomes: OutcomeRecord[];
  updatedAt: string;
};

export type EffectivenessDimension =
  | "progress"
  | "confidence"
  | "momentum"
  | "trust"
  | "completion"
  | "followThrough"
  | "interventionSuccess"
  | "businessMovement";

export type CompanionEffectivenessScore = {
  overall: number;
  passed: boolean;
  dimensions: Record<EffectivenessDimension, number>;
  updatedAt: string;
};

/** Future predictive hooks — storage framework only, no predictions yet. */
export type PredictiveRiskFramework = {
  burnoutRisk: { enabled: false; signalCount: number };
  launchAvoidanceRisk: { enabled: false; signalCount: number };
  visibilityAvoidanceRisk: { enabled: false; signalCount: number };
  followThroughRisk: { enabled: false; signalCount: number };
  confidenceCrashRisk: { enabled: false; signalCount: number };
  updatedAt: string;
};

const OUTCOME_STORE_KEY = "companion-user-outcome-profile-v1";
const STYLE_EFFECTIVENESS_KEY = "companion-learning-style-effectiveness-v1";
const PREDICTIVE_FRAMEWORK_KEY = "companion-predictive-risk-framework-v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

function emptyOutcomeProfile(): UserOutcomeProfile {
  return {
    mostSuccessfulInterventions: [],
    mostSuccessfulConversationStyles: [],
    mostSuccessfulLearningMethods: [],
    mostSuccessfulRoutingPatterns: [],
    mostSuccessfulRecoveryPatterns: [],
    mostSuccessfulBusinessSupportPatterns: [],
    outcomes: [],
    updatedAt: new Date().toISOString(),
  };
}

function emptyStyleEffectiveness(): Record<LearningStyleId, { offered: number; accepted: number; completed: number }> {
  return {
    visual: { offered: 0, accepted: 0, completed: 0 },
    audio: { offered: 0, accepted: 0, completed: 0 },
    kinesthetic: { offered: 0, accepted: 0, completed: 0 },
    read_write: { offered: 0, accepted: 0, completed: 0 },
    conversational: { offered: 0, accepted: 0, completed: 0 },
  };
}

export function getUserOutcomeProfile(): UserOutcomeProfile {
  return readJson(OUTCOME_STORE_KEY, emptyOutcomeProfile());
}

export function saveUserOutcomeProfile(profile: UserOutcomeProfile): void {
  writeJson(OUTCOME_STORE_KEY, profile);
}

export function recordUserOutcome(input: {
  category: OutcomeCategory;
  label: string;
  businessType?: BusinessOutcomeType;
  interventionId?: string;
  learningStyle?: LearningStyleId;
}): OutcomeRecord {
  const profile = getUserOutcomeProfile();
  const record: OutcomeRecord = {
    id: `outcome-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: input.category,
    businessType: input.businessType,
    label: input.label.slice(0, 200),
    interventionId: input.interventionId,
    learningStyle: input.learningStyle,
    recordedAt: new Date().toISOString(),
  };
  profile.outcomes = [record, ...profile.outcomes].slice(0, 200);
  profile.updatedAt = new Date().toISOString();
  recomputeOutcomeProfileSummaries(profile);
  saveUserOutcomeProfile(profile);
  return record;
}

function recomputeOutcomeProfileSummaries(profile: UserOutcomeProfile): void {
  const interventionWins = new Map<string, number>();
  const routingWins = new Map<string, number>();
  const recoveryWins = new Map<string, number>();
  const businessWins = new Map<string, number>();
  const styleWins = new Map<LearningStyleId, number>();

  for (const o of profile.outcomes) {
    if (o.interventionId) {
      interventionWins.set(o.interventionId, (interventionWins.get(o.interventionId) ?? 0) + 1);
    }
    if (o.category === "momentum") {
      recoveryWins.set(o.label, (recoveryWins.get(o.label) ?? 0) + 1);
    }
    if (o.businessType) {
      businessWins.set(o.businessType, (businessWins.get(o.businessType) ?? 0) + 1);
    }
    if (o.learningStyle) {
      styleWins.set(o.learningStyle, (styleWins.get(o.learningStyle) ?? 0) + 1);
    }
    if (o.category === "decisions" || o.category === "actions") {
      routingWins.set(o.category, (routingWins.get(o.category) ?? 0) + 1);
    }
  }

  const topN = (m: Map<string, number>, n = 5) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);

  profile.mostSuccessfulInterventions = topN(interventionWins);
  profile.mostSuccessfulRoutingPatterns = topN(routingWins);
  profile.mostSuccessfulRecoveryPatterns = topN(recoveryWins);
  profile.mostSuccessfulBusinessSupportPatterns = topN(businessWins);
  profile.mostSuccessfulConversationStyles = [...styleWins.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);
  profile.mostSuccessfulLearningMethods = computeLearningStyleEffectiveness();
}

export function recordLearningStyleOffer(input: {
  style: LearningStyleId;
  accepted: boolean;
  completed?: boolean;
}): void {
  const store = readJson(STYLE_EFFECTIVENESS_KEY, emptyStyleEffectiveness());
  const cur = store[input.style] ?? { offered: 0, accepted: 0, completed: 0 };
  cur.offered += 1;
  if (input.accepted) cur.accepted += 1;
  if (input.completed) cur.completed += 1;
  store[input.style] = cur;
  writeJson(STYLE_EFFECTIVENESS_KEY, store);

  const profile = getUserOutcomeProfile();
  profile.mostSuccessfulLearningMethods = computeLearningStyleEffectiveness();
  profile.updatedAt = new Date().toISOString();
  saveUserOutcomeProfile(profile);
}

/** Measure which learning styles produce action — not preference alone. */
export function computeLearningStyleEffectiveness(): LearningStyleEffectiveness[] {
  const store = readJson(STYLE_EFFECTIVENESS_KEY, emptyStyleEffectiveness());
  return (Object.keys(store) as LearningStyleId[]).map((style) => {
    const { offered, accepted, completed } = store[style];
    const acceptanceRate = offered ? Math.round((accepted / offered) * 100) : 0;
    const completionRate = accepted ? Math.round((completed / accepted) * 100) : 0;
    const actionRate = offered ? Math.round((completed / offered) * 100) : 0;
    return { style, offered, accepted, completed, acceptanceRate, completionRate, actionRate };
  }).sort((a, b) => b.actionRate - a.actionRate);
}

export function getPredictiveRiskFramework(): PredictiveRiskFramework {
  return readJson<PredictiveRiskFramework>(PREDICTIVE_FRAMEWORK_KEY, {
    burnoutRisk: { enabled: false, signalCount: 0 },
    launchAvoidanceRisk: { enabled: false, signalCount: 0 },
    visibilityAvoidanceRisk: { enabled: false, signalCount: 0 },
    followThroughRisk: { enabled: false, signalCount: 0 },
    confidenceCrashRisk: { enabled: false, signalCount: 0 },
    updatedAt: new Date().toISOString(),
  });
}

/** Store signal counts for future predictive models — advisory only when enabled. */
export function recordPredictiveRiskSignal(
  risk: keyof Omit<PredictiveRiskFramework, "updatedAt">,
): void {
  const framework = getPredictiveRiskFramework();
  const entry = framework[risk];
  if (entry && !entry.enabled) {
    framework[risk] = { ...entry, signalCount: entry.signalCount + 1 };
  }
  framework.updatedAt = new Date().toISOString();
  writeJson(PREDICTIVE_FRAMEWORK_KEY, framework);
}

function scoreFromOutcomes(
  outcomes: OutcomeRecord[],
  category: OutcomeCategory,
): number {
  const count = outcomes.filter((o) => o.category === category).length;
  return Math.min(100, 40 + count * 8);
}

function scoreInterventionSuccess(entries: InterventionEffectivenessEntry[]): number {
  if (entries.length === 0) return 50;
  const avg =
    entries.reduce((sum, e) => sum + e.rates.adaptiveWeight, 0) / entries.length;
  return Math.round(avg);
}

export function buildCompanionEffectivenessScore(): CompanionEffectivenessScore {
  const profile = getUserOutcomeProfile();
  const interventions = getUserInterventionEffectiveness();
  const styles = computeLearningStyleEffectiveness();
  const topStyle = styles[0];

  const dimensions: Record<EffectivenessDimension, number> = {
    progress: scoreFromOutcomes(profile.outcomes, "actions"),
    confidence: scoreFromOutcomes(profile.outcomes, "confidence"),
    momentum: scoreFromOutcomes(profile.outcomes, "momentum"),
    trust: Math.min(100, 55 + profile.outcomes.length * 2),
    completion: scoreFromOutcomes(profile.outcomes, "completions"),
    followThrough: Math.min(
      100,
      50 +
        profile.mostSuccessfulRecoveryPatterns.length * 10 +
        profile.outcomes.filter((o) => o.category === "momentum").length * 5,
    ),
    interventionSuccess: scoreInterventionSuccess(interventions),
    businessMovement: Math.min(
      100,
      45 + profile.mostSuccessfulBusinessSupportPatterns.length * 12,
    ),
  };

  if (topStyle && topStyle.offered >= 3) {
    dimensions.progress = Math.round((dimensions.progress + topStyle.actionRate) / 2);
  }

  const values = Object.values(dimensions);
  const overall = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;

  return {
    overall,
    passed: overall >= 50,
    dimensions,
    updatedAt: new Date().toISOString(),
  };
}

export function effectivenessHintForChat(): string | null {
  const score = buildCompanionEffectivenessScore();
  const profile = getUserOutcomeProfile();
  const styles = computeLearningStyleEffectiveness().filter((s) => s.offered >= 2);
  if (profile.outcomes.length === 0 && styles.length === 0) return null;

  const parts = [
    "COMPANION EFFECTIVENESS (private — optimize for forward movement, not clever analysis):",
  ];

  if (profile.mostSuccessfulInterventions.length) {
    parts.push(
      `Interventions that moved this user forward: ${profile.mostSuccessfulInterventions.slice(0, 3).join(", ")}.`,
    );
  }

  const bestStyle = styles[0];
  if (bestStyle && bestStyle.actionRate > 0) {
    parts.push(
      `Learning by action: ${bestStyle.style} completion ${bestStyle.completionRate}% — prefer what produces action.`,
    );
  }

  parts.push(
    `Optimize for progress (${score.dimensions.progress}), confidence (${score.dimensions.confidence}), momentum (${score.dimensions.momentum}).`,
  );

  return parts.join("\n");
}

export function resetEffectivenessForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OUTCOME_STORE_KEY);
  localStorage.removeItem(STYLE_EFFECTIVENESS_KEY);
  localStorage.removeItem(PREDICTIVE_FRAMEWORK_KEY);
}
