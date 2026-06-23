/**
 * Intervention Learning Engine™ — learn what actually helps per user and ecosystem-wide.
 *
 * Tracks full intervention lifecycle and adaptive recommendation weighting.
 * Privacy: patterns only — never labels or shames users.
 */

import type { CompanionCapabilityId } from "./companionCapabilityRegistry";
import type { LearningStyleId } from "./companionAdaptiveUserEngine";
import { getMistakePenaltyForIntervention, shouldSuppressIntervention } from "./companionMistakeRecovery";

export type InterventionLearningId =
  | CompanionCapabilityId
  | "conversation_coaching"
  | "decision_compass"
  | "clear_my_mind"
  | "plan_my_day"
  | "adapt_my_day"
  | "create_workspace"
  | "projects"
  | "focus_audio"
  | "sales_call_support"
  | "visibility_support";

export type InterventionLifecycleStage =
  | "recommended"
  | "accepted"
  | "dismissed"
  | "opened"
  | "used"
  | "completed"
  | "returned_to"
  | "reported_helpful"
  | "momentum_improved"
  | "confidence_improved"
  | "misread"
  | "rejected";

export type InterventionLifecycleCounts = {
  recommended: number;
  accepted: number;
  dismissed: number;
  opened: number;
  used: number;
  completed: number;
  returnedTo: number;
  reportedHelpful: number;
  momentumImproved: number;
  confidenceImproved: number;
  misread: number;
  rejected: number;
};

export type InterventionRateMetrics = {
  acceptanceRate: number;
  completionRate: number;
  returnRate: number;
  reportedUsefulness: number;
  momentumImpact: number;
  confidenceImpact: number;
  adaptiveWeight: number;
};

export type InterventionEffectivenessEntry = {
  id: InterventionLearningId;
  label: string;
  counts: InterventionLifecycleCounts;
  rates: InterventionRateMetrics;
};

export type InterventionEffectivenessProfile = {
  userId: "local";
  interventions: Record<string, InterventionLifecycleCounts>;
  updatedAt: string;
};

export type EcosystemInterventionLearning = {
  interventions: Record<string, InterventionLifecycleCounts>;
  updatedAt: string;
};

export type RankedIntervention = InterventionEffectivenessEntry & {
  rank: number;
};

const USER_STORE_KEY = "companion-intervention-learning-user-v1";
const ECOSYSTEM_STORE_KEY = "companion-intervention-learning-ecosystem-v1";

const TRACKED_INTERVENTIONS: InterventionLearningId[] = [
  "clear_my_mind",
  "decision_compass",
  "plan_my_day",
  "adapt_my_day",
  "create_workspace",
  "content_tools",
  "templates",
  "strategies",
  "snippets",
  "projects",
  "focus_audio",
  "email",
  "calendar",
  "sales_call_support",
  "visibility_support",
  "conversation_coaching",
];

const INTERVENTION_LABELS: Record<string, string> = {
  clear_my_mind: "Clear My Mind",
  decision_compass: "Decision Compass",
  plan_my_day: "Plan My Day",
  adapt_my_day: "Adapt My Day",
  create_workspace: "Create",
  content_tools: "Content Tools",
  templates: "Templates",
  strategies: "Strategies",
  snippets: "Snippets",
  email: "Email",
  calendar: "Calendar",
  projects: "Projects",
  focus_audio: "Focus Audio",
  sales_call_support: "Sales Support",
  visibility_support: "Visibility Support",
  conversation_coaching: "Conversation-only coaching",
};

function emptyCounts(): InterventionLifecycleCounts {
  return {
    recommended: 0,
    accepted: 0,
    dismissed: 0,
    opened: 0,
    used: 0,
    completed: 0,
    returnedTo: 0,
    reportedHelpful: 0,
    momentumImproved: 0,
    confidenceImproved: 0,
    misread: 0,
    rejected: 0,
  };
}

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

function normalizeInterventionId(id: string): InterventionLearningId {
  if (id === "brain_dump" || id === "clear_mind") return "clear_my_mind";
  if (id === "create") return "create_workspace";
  return id as InterventionLearningId;
}

function stageField(stage: InterventionLifecycleStage): keyof InterventionLifecycleCounts | null {
  switch (stage) {
    case "recommended":
      return "recommended";
    case "accepted":
      return "accepted";
    case "dismissed":
      return "dismissed";
    case "opened":
      return "opened";
    case "used":
      return "used";
    case "completed":
      return "completed";
    case "returned_to":
      return "returnedTo";
    case "reported_helpful":
      return "reportedHelpful";
    case "momentum_improved":
      return "momentumImproved";
    case "confidence_improved":
      return "confidenceImproved";
    case "misread":
      return "misread";
    case "rejected":
      return "rejected";
    default:
      return null;
  }
}

function incrementCounts(
  counts: InterventionLifecycleCounts,
  stage: InterventionLifecycleStage,
): InterventionLifecycleCounts {
  const field = stageField(stage);
  if (!field) return counts;
  return { ...counts, [field]: counts[field] + 1 };
}

export function getInterventionEffectivenessProfile(): InterventionEffectivenessProfile {
  return readJson<InterventionEffectivenessProfile>(USER_STORE_KEY, {
    userId: "local",
    interventions: {},
    updatedAt: new Date().toISOString(),
  });
}

export function getEcosystemInterventionLearning(): EcosystemInterventionLearning {
  return readJson<EcosystemInterventionLearning>(ECOSYSTEM_STORE_KEY, {
    interventions: {},
    updatedAt: new Date().toISOString(),
  });
}

export function saveInterventionEffectivenessProfile(
  profile: InterventionEffectivenessProfile,
): void {
  writeJson(USER_STORE_KEY, profile);
}

export function saveEcosystemInterventionLearning(data: EcosystemInterventionLearning): void {
  writeJson(ECOSYSTEM_STORE_KEY, data);
}

/** Record a lifecycle event for user + ecosystem learning (patterns only). */
export function recordInterventionLifecycle(input: {
  interventionId: string;
  stage: InterventionLifecycleStage;
  learningStyle?: LearningStyleId;
  emotionalState?: string;
}): void {
  const id = normalizeInterventionId(input.interventionId);
  const key = String(id);

  const userProfile = getInterventionEffectivenessProfile();
  const userCounts = userProfile.interventions[key] ?? emptyCounts();
  userProfile.interventions[key] = incrementCounts(userCounts, input.stage);
  userProfile.updatedAt = new Date().toISOString();
  saveInterventionEffectivenessProfile(userProfile);

  const eco = getEcosystemInterventionLearning();
  const ecoCounts = eco.interventions[key] ?? emptyCounts();
  eco.interventions[key] = incrementCounts(ecoCounts, input.stage);
  eco.updatedAt = new Date().toISOString();
  saveEcosystemInterventionLearning(eco);
}

export function computeInterventionRates(
  counts: InterventionLifecycleCounts,
): InterventionRateMetrics {
  const acceptanceRate = counts.recommended
    ? Math.round((counts.accepted / counts.recommended) * 100)
    : 0;
  const completionRate = counts.accepted
    ? Math.round((counts.completed / counts.accepted) * 100)
    : 0;
  const returnRate = counts.completed
    ? Math.round((counts.returnedTo / counts.completed) * 100)
    : 0;
  const reportedUsefulness = counts.completed
    ? Math.round((counts.reportedHelpful / counts.completed) * 100)
    : 0;
  const momentumImpact = counts.completed
    ? Math.round((counts.momentumImproved / counts.completed) * 100)
    : 0;
  const confidenceImpact = counts.completed
    ? Math.round((counts.confidenceImproved / counts.completed) * 100)
    : 0;

  const negativeSignals = counts.dismissed + counts.misread + counts.rejected;
  const failureRate = counts.recommended
    ? negativeSignals / counts.recommended
    : 0;

  let adaptiveWeight = Math.round(
    acceptanceRate * 0.25 +
      completionRate * 0.3 +
      reportedUsefulness * 0.15 +
      momentumImpact * 0.15 +
      confidenceImpact * 0.15,
  );
  adaptiveWeight = Math.round(adaptiveWeight * (1 - failureRate * 0.35));

  return {
    acceptanceRate,
    completionRate,
    returnRate,
    reportedUsefulness,
    momentumImpact,
    confidenceImpact,
    adaptiveWeight: Math.min(100, Math.max(0, adaptiveWeight)),
  };
}

export function buildInterventionEffectivenessEntry(
  id: InterventionLearningId,
  counts: InterventionLifecycleCounts,
): InterventionEffectivenessEntry {
  return {
    id,
    label: INTERVENTION_LABELS[id] ?? id.replace(/_/g, " "),
    counts,
    rates: computeInterventionRates(counts),
  };
}

export function getUserInterventionEffectiveness(): InterventionEffectivenessEntry[] {
  const profile = getInterventionEffectivenessProfile();
  return Object.entries(profile.interventions)
    .map(([id, counts]) =>
      buildInterventionEffectivenessEntry(id as InterventionLearningId, counts),
    )
    .filter((e) => e.counts.recommended > 0 || e.counts.accepted > 0)
    .sort((a, b) => b.rates.adaptiveWeight - a.rates.adaptiveWeight);
}

export function getEcosystemInterventionEffectiveness(): InterventionEffectivenessEntry[] {
  const eco = getEcosystemInterventionLearning();
  return Object.entries(eco.interventions)
    .map(([id, counts]) =>
      buildInterventionEffectivenessEntry(id as InterventionLearningId, counts),
    )
    .filter((e) => e.counts.recommended > 0)
    .sort((a, b) => b.rates.adaptiveWeight - a.rates.adaptiveWeight);
}

/**
 * Adaptive recommendation weighting — prefer interventions that historically work.
 */
export function getAdaptiveInterventionWeight(interventionId: string): number {
  const id = normalizeInterventionId(interventionId);
  const profile = getInterventionEffectivenessProfile();
  const counts = profile.interventions[String(id)];
  if (!counts || counts.recommended < 1) return 50;
  const base = computeInterventionRates(counts).adaptiveWeight;
  return getMistakePenaltyForIntervention(String(id), base);
}

export function rankInterventionsForContext(input?: {
  emotionalState?: string;
  preferConversation?: boolean;
}): RankedIntervention[] {
  const profile = getInterventionEffectivenessProfile();
  const candidates = new Set(TRACKED_INTERVENTIONS.map(String));

  const ranked = [...candidates]
    .map((id) => {
      const counts = profile.interventions[id] ?? emptyCounts();
      return buildInterventionEffectivenessEntry(id as InterventionLearningId, counts);
    })
    .sort((a, b) => {
      const aSuppressed = shouldSuppressIntervention(String(a.id));
      const bSuppressed = shouldSuppressIntervention(String(b.id));
      if (aSuppressed !== bSuppressed) return aSuppressed ? 1 : -1;
      if (input?.preferConversation) {
        if (a.id === "conversation_coaching") return -1;
        if (b.id === "conversation_coaching") return 1;
      }
      if (input?.emotionalState === "overwhelmed") {
        if (a.id === "clear_my_mind") return b.id === "clear_my_mind" ? 0 : -1;
        if (b.id === "clear_my_mind") return 1;
      }
      return b.rates.adaptiveWeight - a.rates.adaptiveWeight;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return ranked;
}

export function recommendInterventionForState(input: {
  emotionalState?: string;
  actualNeed?: string;
}): RankedIntervention | null {
  const ranked = rankInterventionsForContext({
    emotionalState: input.emotionalState,
    preferConversation: input.actualNeed === "build_confidence",
  });
  const withData = ranked.filter((r) => r.counts.recommended >= 2);
  const best = withData[0] ?? ranked[0];
  return best ?? null;
}

/** Map capability registry signals to lifecycle stages. */
export function recordCapabilityLifecycleFromRegistry(input: {
  capabilityId: string;
  action:
    | "offer_shown"
    | "offer_accepted"
    | "offer_dismissed"
    | "feature_opened"
    | "action_completed"
    | "user_abandoned"
    | "user_returned"
    | "reported_success"
    | "reported_frustration";
  momentumImproved?: boolean;
  confidenceImproved?: boolean;
}): void {
  const stageMap: Record<string, InterventionLifecycleStage | null> = {
    offer_shown: "recommended",
    offer_accepted: "accepted",
    offer_dismissed: "dismissed",
    feature_opened: "opened",
    action_completed: "completed",
    user_abandoned: "dismissed",
    user_returned: "returned_to",
    reported_success: "reported_helpful",
    reported_frustration: null,
  };

  const stage = stageMap[input.action];
  if (stage) {
    recordInterventionLifecycle({ interventionId: input.capabilityId, stage });
  }
  if (input.action === "action_completed" || input.action === "reported_success") {
    recordInterventionLifecycle({ interventionId: input.capabilityId, stage: "used" });
  }
  if (input.momentumImproved || input.action === "reported_success") {
    recordInterventionLifecycle({
      interventionId: input.capabilityId,
      stage: "momentum_improved",
    });
  }
  if (input.confidenceImproved || input.action === "reported_success") {
    recordInterventionLifecycle({
      interventionId: input.capabilityId,
      stage: "confidence_improved",
    });
  }
}

export function interventionLearningHintForChat(): string | null {
  const effective = getUserInterventionEffectiveness();
  if (effective.length === 0) return null;

  const top = effective.filter((e) => e.counts.recommended >= 2).slice(0, 3);
  if (top.length === 0) return null;

  const lines = top.map(
    (e) =>
      `${e.label}: acceptance ${e.rates.acceptanceRate}%, completion ${e.rates.completionRate}%, weight ${e.rates.adaptiveWeight}`,
  );

  return [
    "INTERVENTION LEARNING (private — use to prefer what works, never shame):",
    ...lines,
    "Prefer higher-weight interventions when similar friction appears. Conversation-only remains valid when weight is higher.",
  ].join("\n");
}

/** Seed example metrics for tests/demos — not used in production paths. */
export function seedInterventionLearningDemoData(): void {
  const demo: Record<string, InterventionLifecycleCounts> = {
    clear_my_mind: {
      recommended: 100,
      accepted: 82,
      dismissed: 18,
      opened: 75,
      used: 68,
      completed: 61,
      returnedTo: 12,
      reportedHelpful: 54,
      momentumImproved: 49,
      confidenceImproved: 42,
      misread: 3,
      rejected: 2,
    },
    decision_compass: {
      recommended: 50,
      accepted: 18,
      dismissed: 32,
      opened: 16,
      used: 10,
      completed: 6,
      returnedTo: 2,
      reportedHelpful: 5,
      momentumImproved: 3,
      confidenceImproved: 4,
      misread: 8,
      rejected: 5,
    },
    conversation_coaching: {
      recommended: 200,
      accepted: 180,
      dismissed: 20,
      opened: 0,
      used: 150,
      completed: 120,
      returnedTo: 80,
      reportedHelpful: 95,
      momentumImproved: 70,
      confidenceImproved: 65,
      misread: 4,
      rejected: 1,
    },
  };

  saveInterventionEffectivenessProfile({
    userId: "local",
    interventions: demo,
    updatedAt: new Date().toISOString(),
  });
}

export function resetInterventionLearningForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORE_KEY);
  localStorage.removeItem(ECOSYSTEM_STORE_KEY);
}
