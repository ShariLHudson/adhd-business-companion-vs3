/**
 * Closed Loop Learning™ — real behavior capture & intervention attribution.
 *
 * Recommendation → Action → Outcome → Learning → Better Recommendation
 * Privacy: patterns only — never labels or shame.
 */

import type { LearningStyleId } from "./companionAdaptiveUserEngine";
import type { CompanionCapabilityId } from "./companionCapabilityRegistry";
import {
  recordInterventionLifecycle,
  getUserInterventionEffectiveness,
  rankInterventionsForContext,
  type InterventionLifecycleStage,
} from "./companionInterventionLearning";
import { getMistakeRecoveryDashboardSlice } from "./companionMistakeRecovery";
import {
  recordLearningStyleOffer,
  recordUserOutcome,
  computeLearningStyleEffectiveness,
  type BusinessOutcomeType,
  type OutcomeCategory,
  type LearningStyleEffectiveness,
} from "./companionEffectiveness";
import type { AppSection } from "./companionUi";
import type { ToolSuggestionKind } from "./companionToolSuggestions";

export type BehaviorEventType =
  | "offer_shown"
  | "offer_accepted"
  | "offer_dismissed"
  | "workspace_opened"
  | "workspace_used"
  | "workspace_completed"
  | "workspace_returned"
  | "workspace_abandoned"
  | "outcome_recorded";

export type UserBehaviorEvent = {
  id: string;
  userId: "local";
  timestamp: string;
  capability: string;
  eventType: BehaviorEventType;
  actualNeed?: string | null;
  userState?: string | null;
  activePattern?: string | null;
  outcomeThread?: string | null;
  confidence?: number;
  timeToAcceptMs?: number;
  routingReason?: string;
  learningStyle?: LearningStyleId;
  metadata?: Record<string, string | number | boolean>;
};

export type InterventionAttribution = {
  interventionId: string;
  outcomeEventId: string;
  contributionScore: number;
  signals: string[];
  recordedAt: string;
};

export type ClosedLoopCaptureContext = {
  actualNeed?: string | null;
  userState?: string | null;
  activePattern?: string | null;
  outcomeThread?: string | null;
  confidence?: number;
  routingReason?: string;
  conversationSnippet?: string;
  learningStyle?: LearningStyleId;
};

const EVENTS_KEY = "companion-behavior-events-v1";
const ATTRIBUTIONS_KEY = "companion-intervention-attributions-v1";
const LAST_OFFER_KEY = "companion-closed-loop-last-offer-v1";
const OPEN_WORKSPACE_KEY = "companion-closed-loop-open-workspace-v1";
const MAX_EVENTS = 500;

type LastOfferContext = {
  capability: string;
  shownAt: string;
  actualNeed?: string | null;
  userState?: string | null;
  routingReason?: string;
};

type OpenWorkspaceContext = {
  capability: string;
  openedAt: string;
  sourceRecommendation?: string;
};

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

export const SECTION_TO_CAPABILITY: Partial<Record<AppSection, CompanionCapabilityId>> = {
  "brain-dump": "clear_my_mind",
  "decision-compass": "decision_compass",
  "plan-my-day": "plan_my_day",
  today: "adapt_my_day",
  energy: "adapt_my_day",
  "content-generator": "create_workspace",
  projects: "projects",
  "focus-audio": "focus_audio",
  "email-generator": "email",
  "google-workspace": "calendar",
  snippets: "snippets",
  "templates-library": "templates",
  playbook: "strategies",
};

export const TOOL_KIND_TO_CAPABILITY: Partial<
  Record<ToolSuggestionKind, CompanionCapabilityId | "conversation_coaching">
> = {
  "clear-mind": "clear_my_mind",
  breathe: "conversation_coaching",
  "get-unstuck": "conversation_coaching",
  "focus-session": "focus_audio",
  "spin-wheel": "conversation_coaching",
};

function lifecycleFromEventType(
  eventType: BehaviorEventType,
): InterventionLifecycleStage | null {
  const map: Partial<Record<BehaviorEventType, InterventionLifecycleStage>> = {
    offer_shown: "recommended",
    offer_accepted: "accepted",
    offer_dismissed: "dismissed",
    workspace_opened: "opened",
    workspace_used: "used",
    workspace_completed: "completed",
    workspace_returned: "returned_to",
    workspace_abandoned: "dismissed",
  };
  return map[eventType] ?? null;
}

export function resolveCapabilityId(section: AppSection): string {
  return SECTION_TO_CAPABILITY[section] ?? section;
}

function appendBehaviorEvent(event: UserBehaviorEvent): void {
  const events = readJson<UserBehaviorEvent[]>(EVENTS_KEY, []);
  events.unshift(event);
  writeJson(EVENTS_KEY, events.slice(0, MAX_EVENTS));
}

function storeLastOffer(ctx: LastOfferContext): void {
  writeJson(LAST_OFFER_KEY, ctx);
}

function getLastOffer(): LastOfferContext | null {
  return readJson<LastOfferContext | null>(LAST_OFFER_KEY, null);
}

function storeOpenWorkspace(ctx: OpenWorkspaceContext): void {
  writeJson(OPEN_WORKSPACE_KEY, ctx);
}

function getOpenWorkspace(): OpenWorkspaceContext | null {
  return readJson<OpenWorkspaceContext | null>(OPEN_WORKSPACE_KEY, null);
}

export function getBehaviorEvents(): UserBehaviorEvent[] {
  return readJson<UserBehaviorEvent[]>(EVENTS_KEY, []);
}

export function getInterventionAttributions(): InterventionAttribution[] {
  return readJson<InterventionAttribution[]>(ATTRIBUTIONS_KEY, []);
}

/** Core capture — persists event and updates learning engines. */
export function captureBehaviorEvent(input: {
  capability: string;
  eventType: BehaviorEventType;
  context?: ClosedLoopCaptureContext;
  metadata?: Record<string, string | number | boolean>;
}): UserBehaviorEvent {
  const timestamp = new Date().toISOString();
  const ctx = input.context ?? {};

  let timeToAcceptMs: number | undefined;
  if (input.eventType === "offer_accepted") {
    const last = getLastOffer();
    if (last?.capability === input.capability && last.shownAt) {
      timeToAcceptMs = Date.now() - new Date(last.shownAt).getTime();
    }
  }

  const event: UserBehaviorEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: "local",
    timestamp,
    capability: input.capability,
    eventType: input.eventType,
    actualNeed: ctx.actualNeed,
    userState: ctx.userState,
    activePattern: ctx.activePattern,
    outcomeThread: ctx.outcomeThread,
    confidence: ctx.confidence,
    timeToAcceptMs,
    routingReason: ctx.routingReason,
    learningStyle: ctx.learningStyle,
    metadata: input.metadata,
  };

  appendBehaviorEvent(event);

  const lifecycle = lifecycleFromEventType(input.eventType);
  if (lifecycle) {
    recordInterventionLifecycle({
      interventionId: input.capability,
      stage: lifecycle,
      emotionalState: ctx.userState ?? undefined,
    });
  }

  if (input.eventType === "offer_shown") {
    storeLastOffer({
      capability: input.capability,
      shownAt: timestamp,
      actualNeed: ctx.actualNeed,
      userState: ctx.userState,
      routingReason: ctx.routingReason,
    });
  }

  if (input.eventType === "workspace_opened") {
    storeOpenWorkspace({
      capability: input.capability,
      openedAt: timestamp,
      sourceRecommendation: ctx.routingReason,
    });
  }

  if (input.eventType === "workspace_completed" && ctx.learningStyle) {
    recordLearningStyleOffer({
      style: ctx.learningStyle,
      accepted: true,
      completed: true,
    });
  }

  if (input.eventType === "offer_dismissed" && ctx.learningStyle) {
    recordLearningStyleOffer({
      style: ctx.learningStyle,
      accepted: false,
      completed: false,
    });
  }

  return event;
}

export function attributeOutcomeToIntervention(input: {
  outcomeEventId: string;
  outcomeCategory: OutcomeCategory;
  capabilityHint?: string;
  momentumImproved?: boolean;
  confidenceImproved?: boolean;
}): InterventionAttribution | null {
  const lastOffer = getLastOffer();
  const openWs = getOpenWorkspace();
  const interventionId =
    input.capabilityHint ?? openWs?.capability ?? lastOffer?.capability;
  if (!interventionId) return null;

  const signals: string[] = [input.outcomeCategory];
  let contributionScore = 55;
  if (lastOffer?.capability === interventionId) contributionScore += 20;
  if (openWs?.capability === interventionId) contributionScore += 15;
  if (input.momentumImproved) contributionScore += 5;
  if (input.confidenceImproved) contributionScore += 5;

  const attribution: InterventionAttribution = {
    interventionId,
    outcomeEventId: input.outcomeEventId,
    contributionScore: Math.min(100, contributionScore),
    signals,
    recordedAt: new Date().toISOString(),
  };

  const list = getInterventionAttributions();
  list.unshift(attribution);
  writeJson(ATTRIBUTIONS_KEY, list.slice(0, 200));

  if (input.momentumImproved) {
    recordInterventionLifecycle({
      interventionId,
      stage: "momentum_improved",
    });
  }
  if (input.confidenceImproved) {
    recordInterventionLifecycle({
      interventionId,
      stage: "confidence_improved",
    });
  }

  return attribution;
}

export function recordBusinessOutcome(input: {
  businessType: BusinessOutcomeType;
  label: string;
  category?: OutcomeCategory;
  capabilityHint?: string;
  momentumImproved?: boolean;
  confidenceImproved?: boolean;
  context?: ClosedLoopCaptureContext;
}): void {
  const category =
    input.category ??
    (input.businessType.includes("decision") ? "decisions" : "actions");

  const outcome = recordUserOutcome({
    category,
    label: input.label,
    businessType: input.businessType,
    interventionId: input.capabilityHint,
    learningStyle: input.context?.learningStyle,
  });

  captureBehaviorEvent({
    capability: input.capabilityHint ?? "conversation_coaching",
    eventType: "outcome_recorded",
    context: input.context,
    metadata: { businessType: input.businessType, outcomeId: outcome.id },
  });

  attributeOutcomeToIntervention({
    outcomeEventId: outcome.id,
    outcomeCategory: category,
    capabilityHint: input.capabilityHint,
    momentumImproved: input.momentumImproved,
    confidenceImproved: input.confidenceImproved,
  });
}

export type CompanionEffectivenessDashboard = {
  evaluatedAt: string;
  totalEvents: number;
  topInterventions: { id: string; acceptanceRate: number; completionRate: number; weight: number }[];
  weakestInterventions: { id: string; acceptanceRate: number; dismissedRate: number }[];
  acceptanceRates: Record<string, number>;
  completionRates: Record<string, number>;
  confidenceImpact: Record<string, number>;
  momentumImpact: Record<string, number>;
  attributions: InterventionAttribution[];
  learningStyleByAction: LearningStyleEffectiveness[];
  mistakeRecovery: ReturnType<typeof getMistakeRecoveryDashboardSlice>;
  recentEvents: UserBehaviorEvent[];
};

export function buildCompanionEffectivenessDashboard(): CompanionEffectivenessDashboard {
  const entries = getUserInterventionEffectiveness();
  const events = getBehaviorEvents();

  const topInterventions = entries.slice(0, 5).map((e) => ({
    id: String(e.id),
    acceptanceRate: e.rates.acceptanceRate,
    completionRate: e.rates.completionRate,
    weight: e.rates.adaptiveWeight,
  }));

  const weakest = [...entries]
    .filter((e) => e.counts.recommended >= 3)
    .sort((a, b) => a.rates.adaptiveWeight - b.rates.adaptiveWeight)
    .slice(0, 5)
    .map((e) => ({
      id: String(e.id),
      acceptanceRate: e.rates.acceptanceRate,
      dismissedRate: e.counts.recommended
        ? Math.round((e.counts.dismissed / e.counts.recommended) * 100)
        : 0,
    }));

  const acceptanceRates: Record<string, number> = {};
  const completionRates: Record<string, number> = {};
  const confidenceImpact: Record<string, number> = {};
  const momentumImpact: Record<string, number> = {};
  for (const e of entries) {
    const id = String(e.id);
    acceptanceRates[id] = e.rates.acceptanceRate;
    completionRates[id] = e.rates.completionRate;
    confidenceImpact[id] = e.rates.confidenceImpact;
    momentumImpact[id] = e.rates.momentumImpact;
  }

  return {
    evaluatedAt: new Date().toISOString(),
    totalEvents: events.length,
    topInterventions,
    weakestInterventions: weakest,
    acceptanceRates,
    completionRates,
    confidenceImpact,
    momentumImpact,
    attributions: getInterventionAttributions().slice(0, 20),
    learningStyleByAction: computeLearningStyleEffectiveness(),
    mistakeRecovery: getMistakeRecoveryDashboardSlice(),
    recentEvents: events.slice(0, 25),
  };
}

export function getAdaptiveRecommendationWeights(): Record<string, number> {
  const ranked = rankInterventionsForContext();
  const weights: Record<string, number> = {};
  for (const r of ranked) {
    weights[String(r.id)] = r.rates.adaptiveWeight;
  }
  return weights;
}

export function resetClosedLoopLearningForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EVENTS_KEY);
  localStorage.removeItem(ATTRIBUTIONS_KEY);
  localStorage.removeItem(LAST_OFFER_KEY);
  localStorage.removeItem(OPEN_WORKSPACE_KEY);
}
