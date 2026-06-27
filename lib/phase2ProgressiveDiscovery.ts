/**
 * Phase 2 Onboarding — Progressive Discovery
 *
 * Learn while helping. Observe, confirm, adapt — never interrogate.
 * Active after Phase 1 completes; invisible ongoing relationship building.
 */

import { getRelationshipMemory } from "./companionAdaptiveUserEngine";
import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import { isPhase1OnboardingComplete } from "./phase1Onboarding";
import { getPhase1OnboardingState } from "./phase1Onboarding";

export type Phase2LearningStyleId =
  | "conversational"
  | "visual"
  | "action_oriented"
  | "read_write"
  | "hybrid";

export type Phase2MilestoneId =
  | "understand_business"
  | "understand_goals"
  | "understand_challenges"
  | "understand_work_style"
  | "anticipate_help";

export type EnergyWindow = "morning" | "afternoon" | "evening";

export type AdhdPatternId =
  | "planning_addiction"
  | "perfectionism"
  | "shiny_object_syndrome"
  | "launch_avoidance"
  | "visibility_resistance"
  | "pricing_anxiety"
  | "follow_through_challenges"
  | "overwhelm_cycles";

export type ResourcePreferenceId =
  | "decision_compass"
  | "clear_my_mind"
  | "create"
  | "plan_my_day"
  | "strategy"
  | "conversation";

export type GoalEntry = {
  text: string;
  recordedAt: string;
};

export type ChallengeEntry = {
  label: string;
  count: number;
  lastSeen: string;
};

export type PatternEntry = {
  id: AdhdPatternId;
  count: number;
  lastSeen: string;
};

export type ResourceScore = {
  id: ResourcePreferenceId;
  label: string;
  helpfulScore: number;
  ignoredCount: number;
};

export type Phase2ProgressiveDiscoveryState = {
  sessionCount: number;
  firstSessionAt: string;
  lastSessionAt: string;
  business: {
    type?: string;
    primaryOffer?: string;
    idealClient?: string;
    revenueModel?: string;
  };
  goals: GoalEntry[];
  challenges: ChallengeEntry[];
  strengths: string[];
  learningStyle: {
    primary: Phase2LearningStyleId;
    secondary?: Phase2LearningStyleId;
    confidence: number;
    signals: Partial<Record<Phase2LearningStyleId, number>>;
  };
  energy: {
    completionsByWindow: Record<EnergyWindow, number>;
    overwhelmByWindow: Record<EnergyWindow, number>;
    peakWindow?: EnergyWindow;
    lowWindow?: EnergyWindow;
  };
  adhdPatterns: PatternEntry[];
  resources: ResourceScore[];
  milestones: Record<Phase2MilestoneId, boolean>;
  lastTrustMomentAt?: string;
  trustMomentsShown: number;
  updatedAt: string;
};

export type WhatIveLearnedProfile = {
  business: {
    type?: string;
    currentGoal?: string;
    idealClient?: string;
  };
  strengths: string[];
  challenges: string[];
  helpfulResources: string[];
  workStyle: string;
  workStyleConfidence: "early" | "growing" | "strong";
  milestonesReached: Phase2MilestoneId[];
};

const STORAGE_KEY = "companion-phase2-progressive-discovery-v1";
const MAX_PHASE2_SESSIONS = 10;
const FIRST_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TRUST_MOMENT_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000;

const MILESTONE_LABELS: Record<Phase2MilestoneId, string> = {
  understand_business: "I understand your business.",
  understand_goals: "I understand your goals.",
  understand_challenges: "I understand your challenges.",
  understand_work_style: "I understand how you work.",
  anticipate_help: "I can often anticipate what will help before you ask.",
};

const RESOURCE_LABELS: Record<ResourcePreferenceId, string> = {
  decision_compass: "Decision Compass",
  clear_my_mind: "Clear My Mind",
  create: "Create",
  plan_my_day: "Plan My Day",
  strategy: "Strategy",
  conversation: "Conversation",
};

const GOAL_SIGNALS: { re: RegExp; label: string }[] = [
  { re: /\b(?:more clients?|grow (?:my )?audience|attract)\b/i, label: "More clients" },
  { re: /\b(?:visibility|be seen|marketing)\b/i, label: "More visibility" },
  { re: /\b(?:systems?|sop|process)\b/i, label: "Better systems" },
  { re: /\b(?:revenue|income|money)\b/i, label: "More revenue" },
  { re: /\b(?:less overwhelm|overwhelm)\b/i, label: "Less overwhelm" },
  { re: /\b(?:follow[- ]?through|finish|complete)\b/i, label: "Better follow-through" },
];

const CHALLENGE_SIGNALS: { re: RegExp; label: string }[] = [
  { re: /\boverwhelm/i, label: "Overwhelm" },
  { re: /\bvisibility/i, label: "Visibility" },
  { re: /\bpric/i, label: "Pricing" },
  { re: /\bsales?\b/i, label: "Sales" },
  { re: /\bfollow[- ]?through/i, label: "Follow-through" },
  { re: /\b(?:can't decide|decision paralysis|stuck between)\b/i, label: "Decision paralysis" },
  { re: /\bperfection/i, label: "Perfectionism" },
  { re: /\b(?:launch|ship|publish).*(?:avoid|afraid|scared)\b/i, label: "Launch avoidance" },
];

const ADHD_PATTERN_SIGNALS: { re: RegExp; id: AdhdPatternId }[] = [
  { re: /\b(?:another plan|planning again|reorganiz)\b/i, id: "planning_addiction" },
  { re: /\b(?:perfect|redo|not ready|one more tweak)\b/i, id: "perfectionism" },
  { re: /\b(?:shiny object|new idea|squirrel|another project)\b/i, id: "shiny_object_syndrome" },
  { re: /\b(?:launch|ship|publish).*(?:avoid|can't|scared)\b/i, id: "launch_avoidance" },
  { re: /\b(?:visible|be seen|post|show up).*(?:hard|scared|afraid)\b/i, id: "visibility_resistance" },
  { re: /\b(?:price|charge|worth).*(?:anxious|afraid|guilt)\b/i, id: "pricing_anxiety" },
  { re: /\b(?:finish|follow through|complete).*(?:hard|struggle)\b/i, id: "follow_through_challenges" },
  { re: /\b(?:overwhelm|too much|drowning)\b/i, id: "overwhelm_cycles" },
];

const STRENGTH_SIGNALS: { re: RegExp; label: string }[] = [
  { re: /\b(?:creative|ideas? flow|brainstorm)\b/i, label: "Creative thinking" },
  { re: /\b(?:relationship|connect|empathy|care)\b/i, label: "Relationship building" },
  { re: /\b(?:teach|explain|coach|mentor)\b/i, label: "Teaching" },
];

function defaultState(): Phase2ProgressiveDiscoveryState {
  const now = new Date().toISOString();
  return {
    sessionCount: 0,
    firstSessionAt: now,
    lastSessionAt: now,
    business: {},
    goals: [],
    challenges: [],
    strengths: [],
    learningStyle: {
      primary: "conversational",
      confidence: 0.15,
      signals: { conversational: 1 },
    },
    energy: {
      completionsByWindow: { morning: 0, afternoon: 0, evening: 0 },
      overwhelmByWindow: { morning: 0, afternoon: 0, evening: 0 },
    },
    adhdPatterns: [],
    resources: [],
    milestones: {
      understand_business: false,
      understand_goals: false,
      understand_challenges: false,
      understand_work_style: false,
      anticipate_help: false,
    },
    trustMomentsShown: 0,
    updatedAt: now,
  };
}

function readState(): Phase2ProgressiveDiscoveryState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedFromPhase1(defaultState());
    const parsed = JSON.parse(raw) as Phase2ProgressiveDiscoveryState;
    return { ...defaultState(), ...parsed };
  } catch {
    return seedFromPhase1(defaultState());
  }
}

function writeState(state: Phase2ProgressiveDiscoveryState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("companion-phase2-discovery-updated"));
  } catch {
    /* noop */
  }
}

function seedFromPhase1(
  state: Phase2ProgressiveDiscoveryState,
): Phase2ProgressiveDiscoveryState {
  if (!isPhase1OnboardingComplete()) return state;
  const p1 = getPhase1OnboardingState().profile;
  const next = { ...state, business: { ...state.business } };
  if (p1.businessType) next.business.type = p1.businessType;
  if (p1.audience) next.business.idealClient = p1.audience;
  if (p1.immediateGoal || p1.desiredOutcome) {
    const goal = p1.immediateGoal ?? p1.desiredOutcome!;
    next.goals = [{ text: goal, recordedAt: new Date().toISOString() }];
  }
  if (p1.primaryChallenge) {
    next.challenges = [
      {
        label: p1.primaryChallenge,
        count: 1,
        lastSeen: new Date().toISOString(),
      },
    ];
  }
  return next;
}

export function getPhase2DiscoveryState(): Phase2ProgressiveDiscoveryState {
  return readState();
}

export function isPhase2DiscoveryActive(): boolean {
  return isPhase1OnboardingComplete();
}

export function patchPhase2DiscoveryState(
  patch: Partial<Phase2ProgressiveDiscoveryState>,
): Phase2ProgressiveDiscoveryState {
  const next = {
    ...readState(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeState(next);
  return next;
}

function energyWindow(now = new Date()): EnergyWindow {
  const hour = now.getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function bumpChallenge(
  list: ChallengeEntry[],
  label: string,
): ChallengeEntry[] {
  const now = new Date().toISOString();
  const existing = list.find((c) => c.label === label);
  if (existing) {
    return list.map((c) =>
      c.label === label
        ? { ...c, count: c.count + 1, lastSeen: now }
        : c,
    );
  }
  return [...list, { label, count: 1, lastSeen: now }].slice(0, 12);
}

function bumpPattern(
  list: PatternEntry[],
  id: AdhdPatternId,
): PatternEntry[] {
  const now = new Date().toISOString();
  const existing = list.find((p) => p.id === id);
  if (existing) {
    return list.map((p) =>
      p.id === id ? { ...p, count: p.count + 1, lastSeen: now } : p,
    );
  }
  return [...list, { id, count: 1, lastSeen: now }].slice(0, 10);
}

function bumpLearningSignal(
  signals: Partial<Record<Phase2LearningStyleId, number>>,
  id: Phase2LearningStyleId,
  amount = 1,
): Partial<Record<Phase2LearningStyleId, number>> {
  return { ...signals, [id]: (signals[id] ?? 0) + amount };
}

function resolveLearningStyle(
  signals: Partial<Record<Phase2LearningStyleId, number>>,
): {
  primary: Phase2LearningStyleId;
  secondary?: Phase2LearningStyleId;
  confidence: number;
} {
  const ranked = (
    Object.entries(signals) as [Phase2LearningStyleId, number][]
  ).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  const second = ranked[1];
  if (!top) {
    return { primary: "conversational", confidence: 0.15 };
  }
  const total = ranked.reduce((sum, [, v]) => sum + v, 0);
  const primary = top[0];
  const secondary =
    second && second[1] >= top[1] * 0.65 ? second[0] : undefined;
  const style: Phase2LearningStyleId =
    secondary && top[1] - second[1] < 2 ? "hybrid" : primary;
  const confidence = Math.min(0.95, 0.2 + total * 0.04);
  return { primary: style, secondary, confidence };
}

function updateEnergyPeaks(
  energy: Phase2ProgressiveDiscoveryState["energy"],
): Phase2ProgressiveDiscoveryState["energy"] {
  const windows = ["morning", "afternoon", "evening"] as EnergyWindow[];
  const peak = [...windows].sort(
    (a, b) => energy.completionsByWindow[b] - energy.completionsByWindow[a],
  )[0];
  const low = [...windows].sort(
    (a, b) => energy.overwhelmByWindow[b] - energy.overwhelmByWindow[a],
  )[0];
  return {
    ...energy,
    peakWindow:
      energy.completionsByWindow[peak] > 0 ? peak : energy.peakWindow,
    lowWindow:
      energy.overwhelmByWindow[low] > 0 ? low : energy.lowWindow,
  };
}

function syncResourcePreferences(
  resources: ResourceScore[],
): ResourceScore[] {
  const effectiveness = getUserInterventionEffectiveness();
  const merged = new Map(resources.map((r) => [r.id, r]));

  const interventionToResource: Partial<Record<string, ResourcePreferenceId>> = {
    decision_compass: "decision_compass",
    clear_my_mind: "clear_my_mind",
    create_workspace: "create",
    content_tools: "create",
    plan_my_day: "plan_my_day",
    strategies: "strategy",
    conversation_coaching: "conversation",
  };

  for (const entry of effectiveness) {
    const id = interventionToResource[entry.id];
    if (!id) continue;
    const cur = merged.get(id) ?? {
      id,
      label: RESOURCE_LABELS[id],
      helpfulScore: 0,
      ignoredCount: 0,
    };
    cur.helpfulScore = Math.max(
      cur.helpfulScore,
      Math.round(entry.rates.adaptiveWeight),
    );
    cur.ignoredCount = entry.counts.dismissed + entry.counts.rejected;
    merged.set(id, cur);
  }

  return [...merged.values()].sort((a, b) => b.helpfulScore - a.helpfulScore);
}

export function evaluateMilestones(
  state: Phase2ProgressiveDiscoveryState,
): Record<Phase2MilestoneId, boolean> {
  const business =
    Boolean(state.business.type) &&
    Boolean(state.business.primaryOffer || state.business.idealClient);
  const goals = state.goals.length >= 1;
  const challenges = state.challenges.filter((c) => c.count >= 2).length >= 1;
  const workStyle = state.learningStyle.confidence >= 0.45;
  const topResource = state.resources.find((r) => r.helpfulScore >= 65);
  const anticipate =
    workStyle &&
    Boolean(topResource) &&
    state.sessionCount >= 5;

  return {
    understand_business: business,
    understand_goals: goals,
    understand_challenges: challenges,
    understand_work_style: workStyle,
    anticipate_help: anticipate,
  };
}

/** Record a new companion session — first week / first 10 sessions window. */
export function recordPhase2SessionStart(now = new Date()): Phase2ProgressiveDiscoveryState {
  if (!isPhase2DiscoveryActive()) return readState();
  const cur = readState();
  const next: Phase2ProgressiveDiscoveryState = {
    ...cur,
    sessionCount: cur.sessionCount + 1,
    firstSessionAt: cur.sessionCount === 0 ? now.toISOString() : cur.firstSessionAt,
    lastSessionAt: now.toISOString(),
  };
  next.milestones = evaluateMilestones(next);
  writeState(next);
  return next;
}

export function observeFromConversationTurn(input: {
  userText: string;
  usedVoice?: boolean;
  completedWork?: boolean;
  now?: Date;
}): Phase2ProgressiveDiscoveryState {
  if (!isPhase2DiscoveryActive()) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const cur = readState();
  const now = input.now ?? new Date();
  const window = energyWindow(now);
  let { business, goals, challenges, strengths, learningStyle, energy, adhdPatterns } =
    cur;

  if (BUSINESS_TYPE_RE.test(t) && !business.type) {
    business = { ...business, type: t.slice(0, 100) };
  }
  if (/\b(?:offer|sell|package|program|service)\b/i.test(t) && !business.primaryOffer) {
    business = { ...business, primaryOffer: t.slice(0, 120) };
  }
  if (/\b(?:clients?|customers?|audience|help)\b/i.test(t) && !business.idealClient) {
    business = { ...business, idealClient: t.slice(0, 120) };
  }
  if (/\b(?:revenue|retainer|subscription|membership)\b/i.test(t) && !business.revenueModel) {
    business = { ...business, revenueModel: t.slice(0, 80) };
  }

  for (const { re, label } of GOAL_SIGNALS) {
    if (re.test(t) && !goals.some((g) => g.text === label)) {
      goals = [...goals, { text: label, recordedAt: now.toISOString() }].slice(0, 8);
    }
  }

  for (const { re, label } of CHALLENGE_SIGNALS) {
    if (re.test(t)) challenges = bumpChallenge(challenges, label);
  }

  for (const { re, label } of STRENGTH_SIGNALS) {
    if (re.test(t) && !strengths.includes(label)) {
      strengths = [...strengths, label].slice(0, 6);
    }
  }

  for (const { re, id } of ADHD_PATTERN_SIGNALS) {
    if (re.test(t)) adhdPatterns = bumpPattern(adhdPatterns, id);
  }

  let signals = { ...learningStyle.signals };
  signals = bumpLearningSignal(signals, "conversational", 0.5);
  if (input.usedVoice) signals = bumpLearningSignal(signals, "conversational", 1);
  if (/\b(?:map|visual|canvas|diagram|see it)\b/i.test(t)) {
    signals = bumpLearningSignal(signals, "visual", 1.5);
  }
  if (/\b(?:just do|ship it|let's go|action|execute)\b/i.test(t)) {
    signals = bumpLearningSignal(signals, "action_oriented", 1.5);
  }
  if (/\b(?:read|write|draft|document|outline)\b/i.test(t)) {
    signals = bumpLearningSignal(signals, "read_write", 1);
  }

  if (/\boverwhelm/i.test(t)) {
    energy = {
      ...energy,
      overwhelmByWindow: {
        ...energy.overwhelmByWindow,
        [window]: energy.overwhelmByWindow[window] + 1,
      },
    };
  }
  if (input.completedWork) {
    energy = {
      ...energy,
      completionsByWindow: {
        ...energy.completionsByWindow,
        [window]: energy.completionsByWindow[window] + 1,
      },
    };
  }
  energy = updateEnergyPeaks(energy);

  const styleResolved = resolveLearningStyle(signals);
  learningStyle = {
    signals,
    primary: styleResolved.primary,
    secondary: styleResolved.secondary,
    confidence: styleResolved.confidence,
  };

  const resources = syncResourcePreferences(cur.resources);
  const next: Phase2ProgressiveDiscoveryState = {
    ...cur,
    business,
    goals,
    challenges,
    strengths,
    learningStyle,
    energy,
    adhdPatterns,
    resources,
    updatedAt: now.toISOString(),
  };
  next.milestones = evaluateMilestones(next);
  writeState(next);
  return next;
}

const BUSINESS_TYPE_RE =
  /\b(?:coach|consultant|author|speaker|creator|ecommerce|service business|agency|freelanc)\b/i;

export function observeResourcePreference(input: {
  resource: ResourcePreferenceId;
  outcome: "opened" | "completed" | "dismissed" | "returned";
}): Phase2ProgressiveDiscoveryState {
  if (!isPhase2DiscoveryActive()) return readState();

  const cur = readState();
  const list = [...cur.resources];
  const idx = list.findIndex((r) => r.id === input.resource);
  const base = idx >= 0
    ? list[idx]!
    : {
        id: input.resource,
        label: RESOURCE_LABELS[input.resource],
        helpfulScore: 0,
        ignoredCount: 0,
      };

  if (input.outcome === "completed" || input.outcome === "returned") {
    base.helpfulScore = Math.min(100, base.helpfulScore + 12);
  } else if (input.outcome === "opened") {
    base.helpfulScore = Math.min(100, base.helpfulScore + 4);
  } else if (input.outcome === "dismissed") {
    base.ignoredCount += 1;
  }

  if (idx >= 0) list[idx] = base;
  else list.push(base);

  let signals = { ...cur.learningStyle.signals };
  if (input.resource === "decision_compass") {
    signals = bumpLearningSignal(signals, "visual", 1);
  }
  if (input.resource === "create") {
    signals = bumpLearningSignal(signals, "read_write", 1);
  }
  if (input.resource === "clear_my_mind" || input.resource === "plan_my_day") {
    signals = bumpLearningSignal(signals, "action_oriented", 0.5);
  }

  const styleResolved = resolveLearningStyle(signals);
  const next: Phase2ProgressiveDiscoveryState = {
    ...cur,
    resources: list.sort((a, b) => b.helpfulScore - a.helpfulScore),
    learningStyle: {
      signals,
      primary: styleResolved.primary,
      secondary: styleResolved.secondary,
      confidence: styleResolved.confidence,
    },
    updatedAt: new Date().toISOString(),
  };
  next.milestones = evaluateMilestones(next);
  writeState(next);
  return next;
}

export function isWithinPhase2Window(state = readState(), now = new Date()): boolean {
  if (state.sessionCount > MAX_PHASE2_SESSIONS) return false;
  const start = new Date(state.firstSessionAt).getTime();
  return now.getTime() - start <= FIRST_WEEK_MS;
}

export function shouldOfferProgressiveDiscoveryQuestion(
  state = readState(),
): boolean {
  if (!isPhase2DiscoveryActive()) return false;
  if (!isWithinPhase2Window(state)) return false;
  return state.sessionCount >= 2;
}

export function maybeTrustBuildingMoment(
  state = readState(),
  now = new Date(),
): string | null {
  if (!isPhase2DiscoveryActive()) return null;
  if (state.sessionCount < 3) return null;

  if (state.lastTrustMomentAt) {
    const elapsed = now.getTime() - new Date(state.lastTrustMomentAt).getTime();
    if (elapsed < TRUST_MOMENT_COOLDOWN_MS) return null;
  }

  const style = state.learningStyle.primary;
  if (style === "visual" && state.resources.some((r) => r.id === "decision_compass" && r.helpfulScore >= 50)) {
    return "I've noticed you tend to make progress when we map decisions visually.";
  }

  const visibilityChallenge = state.challenges.find((c) => /visibility/i.test(c.label));
  if (visibilityChallenge && visibilityChallenge.count >= 2) {
    return "It seems like visibility feels harder than creating content for you.";
  }

  const topPattern = [...state.adhdPatterns].sort((a, b) => b.count - a.count)[0];
  if (topPattern?.id === "planning_addiction" && topPattern.count >= 2) {
    return "I've noticed planning can feel productive — and sometimes it's where momentum pauses.";
  }

  if (state.energy.peakWindow === "morning" && state.energy.completionsByWindow.morning >= 2) {
    return "You seem to find your stride most often in the morning.";
  }

  return null;
}

export function recordTrustBuildingMomentShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastTrustMomentAt: now.toISOString(),
    trustMomentsShown: cur.trustMomentsShown + 1,
  });
}

export function buildWhatIveLearnedProfile(
  state = readState(),
): WhatIveLearnedProfile {
  const memory = getRelationshipMemory();
  const milestonesReached = (
    Object.entries(state.milestones) as [Phase2MilestoneId, boolean][]
  )
    .filter(([, reached]) => reached)
    .map(([id]) => id);

  const styleLabel =
    state.learningStyle.primary === "hybrid" && state.learningStyle.secondary
      ? `${capitalize(state.learningStyle.secondary.replace(/_/g, " "))} + ${capitalize(state.learningStyle.primary.replace(/_/g, " "))}`
      : capitalize(state.learningStyle.primary.replace(/_/g, " "));

  const confidence: WhatIveLearnedProfile["workStyleConfidence"] =
    state.learningStyle.confidence >= 0.65
      ? "strong"
      : state.learningStyle.confidence >= 0.35
        ? "growing"
        : "early";

  return {
    business: {
      type: state.business.type,
      currentGoal: state.goals[0]?.text ?? memory.goals[0],
      idealClient: state.business.idealClient,
    },
    strengths: state.strengths,
    challenges: state.challenges
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => c.label),
    helpfulResources: state.resources
      .filter((r) => r.helpfulScore >= 50)
      .slice(0, 4)
      .map((r) => r.label),
    workStyle: styleLabel,
    workStyleConfidence: confidence,
    milestonesReached,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatWhatIveLearnedForPanel(
  profile = buildWhatIveLearnedProfile(),
): string {
  const lines: string[] = ["### What I've Learned So Far"];
  if (profile.business.type) lines.push("", `**Business:** ${profile.business.type}`);
  if (profile.challenges[0]) lines.push(`**Current Challenge:** ${profile.challenges[0]}`);
  if (profile.business.currentGoal) lines.push(`**Current Goal:** ${profile.business.currentGoal}`);
  return lines.join("\n");
}

export function formatPhase2DiscoveryForPanel(
  profile = buildWhatIveLearnedProfile(),
  phaseLabel: string,
): string {
  const harder = profile.challenges.slice(1);
  return [
    "### Relationship Phase",
    phaseLabel,
    "",
    "### Goals",
    profile.business.currentGoal ? `• ${profile.business.currentGoal}` : "• Still emerging",
    "",
    "### Challenges",
    ...profile.challenges.map((c) => `• ${c}`),
    "",
    "### Resources Helping Most",
    ...(profile.helpfulResources.length
      ? profile.helpfulResources.map((r) => `• ${r}`)
      : ["• Still learning"]),
    "",
    "### Strengths I'm Noticing",
    ...(profile.strengths.length
      ? profile.strengths.map((s) => `• ${s}`)
      : ["• Still emerging"]),
    "",
    "### Things That Seem Harder",
    ...(harder.length ? harder.map((c) => `• ${c}`) : ["• Still emerging"]),
  ].join("\n");
}

export function formatWhatIveLearnedForDisplay(
  profile = buildWhatIveLearnedProfile(),
): string {
  const lines: string[] = ["## What I've Learned About You"];
  if (profile.business.type || profile.business.currentGoal) {
    lines.push("", "### Business");
    if (profile.business.type) lines.push(`Business Type: ${profile.business.type}`);
    if (profile.business.currentGoal) {
      lines.push(`Current Goal: ${profile.business.currentGoal}`);
    }
    if (profile.business.idealClient) {
      lines.push(`Ideal Client: ${profile.business.idealClient}`);
    }
  }
  if (profile.strengths.length) {
    lines.push("", "### Strengths", ...profile.strengths.map((s) => `• ${s}`));
  }
  if (profile.challenges.length) {
    lines.push("", "### Challenges", ...profile.challenges.map((c) => `• ${c}`));
  }
  if (profile.helpfulResources.length) {
    lines.push(
      "",
      "### Resources That Help Most",
      ...profile.helpfulResources.map((r) => `• ${r}`),
    );
  }
  lines.push("", "### Work Style", `${profile.workStyle}`);
  return lines.join("\n");
}

export function phase2ProgressiveDiscoveryHintForChat(input?: {
  trustMoment?: string | null;
}): string | null {
  if (!isPhase2DiscoveryActive()) return null;

  const state = readState();
  const profile = buildWhatIveLearnedProfile(state);
  const trustMoment = input?.trustMoment ?? maybeTrustBuildingMoment(state);

  const parts = [
    "PHASE 2 PROGRESSIVE DISCOVERY (invisible — never feel like onboarding):",
    "Learn while helping. Observe, confirm, adapt. Never interrogate.",
    "FORBIDDEN: questionnaires, assessments, forms, 'what is your learning style?'",
    "Every question must help the user OR help you help them — otherwise don't ask.",
    `Sessions observed: ${state.sessionCount} (first week / first ${MAX_PHASE2_SESSIONS} sessions).`,
  ];

  if (profile.business.type) {
    parts.push(`Business signal: ${profile.business.type}.`);
  }
  if (profile.challenges[0]) {
    parts.push(`Recurring challenge: ${profile.challenges[0]}.`);
  }
  if (profile.helpfulResources[0]) {
    parts.push(`Resource that helps: ${profile.helpfulResources[0]}.`);
  }

  const reached = (
    Object.entries(state.milestones) as [Phase2MilestoneId, boolean][]
  )
    .filter(([, v]) => v)
    .map(([id]) => MILESTONE_LABELS[id]);
  if (reached.length) {
    parts.push(`Relationship milestones: ${reached.join(" ")}`);
  }

  if (trustMoment) {
    parts.push(
      "TRUST BUILDING MOMENT (optional this turn — weave in naturally once):",
      `"${trustMoment}"`,
    );
  }

  parts.push(
    "Infer learning style from behavior — never ask directly.",
    `Work style signal: ${profile.workStyle} (${profile.workStyleConfidence} confidence).`,
    "User should feel: 'This app understands me more every day' — NOT 'I'm still onboarding.'",
  );

  return parts.join("\n");
}

export function resetPhase2DiscoveryForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function resourcePreferenceFromAppSection(
  section: string | null | undefined,
): ResourcePreferenceId | null {
  switch (section) {
    case "decision-compass":
      return "decision_compass";
    case "clear-my-mind":
      return "clear_my_mind";
    case "content-generator":
      return "create";
    case "plan-my-day":
      return "plan_my_day";
    case "strategies":
      return "strategy";
    default:
      return null;
  }
}

export { MILESTONE_LABELS };
