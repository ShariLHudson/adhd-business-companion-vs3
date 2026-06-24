/**
 * Phase 3 — Adaptive Relationship Intelligence™
 * From understanding to anticipation. Pattern-aware, trust-safe, never surveillance.
 */

import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import { isPhase1OnboardingComplete } from "./phase1Onboarding";
import {
  buildWhatIveLearnedProfile,
  getPhase2DiscoveryState,
  type AdhdPatternId,
  type Phase2ProgressiveDiscoveryState,
} from "./phase2ProgressiveDiscovery";

export type Phase3MilestoneId =
  | "understand_patterns"
  | "help_before_ask";

export type PredictivePatternId =
  | "launch_overwhelm"
  | "visibility_avoidance"
  | "pricing_confidence_drop"
  | "monday_friction"
  | "decision_overload_after_ideas"
  | "cognitive_overload"
  | "launch_avoidance"
  | "disengagement";

export type PatternObservation = {
  id: PredictivePatternId;
  label: string;
  count: number;
  confidence: "early" | "growing" | "strong";
  lastSeen: string;
};

export type UserOperatingManual = {
  businessProfile: {
    type?: string;
    primaryGoal?: string;
    idealClient?: string;
    currentFocus?: string;
  };
  strengths: string[];
  challenges: string[];
  bestResources: string[];
  supportStyles: string[];
  bestTimeToWork?: { window: string; confidence: string };
  frictionPatterns: string[];
  updatedAt: string;
};

export type Phase3AdaptiveRelationshipState = {
  predictivePatterns: PatternObservation[];
  awarenessMomentsShown: number;
  lastAwarenessMomentAt?: string;
  anticipatoryOffersShown: number;
  lastAnticipatoryOfferAt?: string;
  checkpointsShown: Record<"30" | "60" | "90", boolean>;
  founderMetrics: {
    observationsOffered: number;
    observationsCorrected: number;
    proactiveAccepted: number;
    proactiveDeclined: number;
  };
  milestones: Record<Phase3MilestoneId, boolean>;
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase3-adaptive-relationship-v1";
const MIN_PHASE3_SESSIONS = 5;
const MIN_PHASE3_DAYS = 14;
const AWARENESS_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000;
const ANTICIPATORY_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const PATTERN_SIGNALS: { re: RegExp; id: PredictivePatternId; label: string }[] = [
  { re: /\b(?:launch|ship).*(?:overwhelm|too much)\b/i, id: "launch_overwhelm", label: "Launch creates overwhelm" },
  { re: /\bvisibility.*(?:avoid|hard|scared)\b/i, id: "visibility_avoidance", label: "Visibility triggers avoidance" },
  { re: /\bpric.*(?:uncertain|anxious|guilt|unsure)\b/i, id: "pricing_confidence_drop", label: "Pricing reduces confidence" },
  { re: /\b(?:too many ideas|another idea).*(?:decide|stuck|overwhelm)\b/i, id: "decision_overload_after_ideas", label: "Decision overload after idea generation" },
  { re: /\b(?:launch|ship|publish).*(?:avoid|can't|stuck)\b/i, id: "launch_avoidance", label: "Launch avoidance" },
  { re: /\b(?:overwhelm|cognitive load|too much in my head)\b/i, id: "cognitive_overload", label: "Cognitive overload" },
];

const ADHD_TO_PREDICTIVE: Partial<Record<AdhdPatternId, PredictivePatternId>> = {
  launch_avoidance: "launch_avoidance",
  visibility_resistance: "visibility_avoidance",
  pricing_anxiety: "pricing_confidence_drop",
  overwhelm_cycles: "cognitive_overload",
  shiny_object_syndrome: "decision_overload_after_ideas",
};

function defaultState(): Phase3AdaptiveRelationshipState {
  const now = new Date().toISOString();
  return {
    predictivePatterns: [],
    awarenessMomentsShown: 0,
    anticipatoryOffersShown: 0,
    checkpointsShown: { "30": false, "60": false, "90": false },
    founderMetrics: {
      observationsOffered: 0,
      observationsCorrected: 0,
      proactiveAccepted: 0,
      proactiveDeclined: 0,
    },
    milestones: {
      understand_patterns: false,
      help_before_ask: false,
    },
    updatedAt: now,
  };
}

function readState(): Phase3AdaptiveRelationshipState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function writeState(state: Phase3AdaptiveRelationshipState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase3-relationship-updated"));
}

export function getPhase3RelationshipState(): Phase3AdaptiveRelationshipState {
  return readState();
}

export function daysSinceRelationshipStart(now = new Date()): number {
  const start = new Date(getPhase2DiscoveryState().firstSessionAt).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((now.getTime() - start) / 86_400_000));
}

export function isPhase3AdaptiveRelationshipActive(now = new Date()): boolean {
  if (!isPhase1OnboardingComplete()) return false;
  const p2 = getPhase2DiscoveryState();
  const days = daysSinceRelationshipStart(now);
  const strongPatterns =
    p2.adhdPatterns.filter((p) => p.count >= 2).length >= 1 ||
    readState().predictivePatterns.filter((p) => p.count >= 2).length >= 1;
  return (
    (p2.sessionCount >= MIN_PHASE3_SESSIONS || days >= MIN_PHASE3_DAYS) &&
    (strongPatterns || p2.learningStyle.confidence >= 0.4)
  );
}

function bumpPattern(
  list: PatternObservation[],
  id: PredictivePatternId,
  label: string,
): PatternObservation[] {
  const now = new Date().toISOString();
  const existing = list.find((p) => p.id === id);
  if (existing) {
    const count = existing.count + 1;
    return list.map((p) =>
      p.id === id
        ? {
            ...p,
            count,
            lastSeen: now,
            confidence: count >= 4 ? "strong" : count >= 2 ? "growing" : "early",
          }
        : p,
    );
  }
  return [...list, { id, label, count: 1, confidence: "early", lastSeen: now }];
}

function evaluateMilestones(
  state: Phase3AdaptiveRelationshipState,
  p2: Phase2ProgressiveDiscoveryState,
): Record<Phase3MilestoneId, boolean> {
  const patterns =
    state.predictivePatterns.filter((p) => p.count >= 2).length >= 2 ||
    p2.adhdPatterns.filter((p) => p.count >= 2).length >= 1;
  const topResource = p2.resources.find((r) => r.helpfulScore >= 60);
  return {
    understand_patterns: patterns,
    help_before_ask:
      patterns &&
      Boolean(topResource) &&
      p2.sessionCount >= 8 &&
      p2.learningStyle.confidence >= 0.45,
  };
}

export function observePhase3Turn(input: {
  userText: string;
  now?: Date;
}): Phase3AdaptiveRelationshipState {
  if (!isPhase3AdaptiveRelationshipActive(input.now)) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const p2 = getPhase2DiscoveryState();
  const cur = readState();
  let patterns = [...cur.predictivePatterns];

  for (const { re, id, label } of PATTERN_SIGNALS) {
    if (re.test(t)) patterns = bumpPattern(patterns, id, label);
  }

  for (const adhd of p2.adhdPatterns) {
    const mapped = ADHD_TO_PREDICTIVE[adhd.id];
    if (mapped && adhd.count >= 1) {
      const label = PATTERN_SIGNALS.find((s) => s.id === mapped)?.label ?? adhd.id;
      patterns = bumpPattern(patterns, mapped, label);
    }
  }

  const day = (input.now ?? new Date()).getDay();
  if (day === 1 && /\b(?:stuck|hard|friction|slow)\b/i.test(t)) {
    patterns = bumpPattern(patterns, "monday_friction", "Monday mornings create friction");
  }

  const next: Phase3AdaptiveRelationshipState = {
    ...cur,
    predictivePatterns: patterns.sort((a, b) => b.count - a.count).slice(0, 10),
    updatedAt: (input.now ?? new Date()).toISOString(),
  };
  next.milestones = evaluateMilestones(next, p2);
  writeState(next);
  return next;
}

export function buildUserOperatingManual(): UserOperatingManual {
  const p2 = getPhase2DiscoveryState();
  const profile = buildWhatIveLearnedProfile(p2);
  const p3 = readState();
  const effectiveness = getUserInterventionEffectiveness()
    .filter((e) => e.rates.adaptiveWeight >= 50)
    .slice(0, 4)
    .map((e) => e.label);

  const friction = [
    ...p3.predictivePatterns.filter((p) => p.count >= 2).map((p) => p.label),
    ...p2.challenges.sort((a, b) => b.count - a.count).slice(0, 3).map((c) => c.label),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const peak = p2.energy.peakWindow;
  return {
    businessProfile: {
      type: profile.business.type,
      primaryGoal: profile.business.currentGoal,
      idealClient: profile.business.idealClient,
      currentFocus: p2.goals[0]?.text,
    },
    strengths: profile.strengths,
    challenges: profile.challenges,
    bestResources: profile.helpfulResources.length
      ? profile.helpfulResources
      : effectiveness,
    supportStyles: [profile.workStyle].filter(Boolean),
    bestTimeToWork: peak
      ? {
          window: peak.charAt(0).toUpperCase() + peak.slice(1),
          confidence: profile.workStyleConfidence,
        }
      : undefined,
    frictionPatterns: friction.slice(0, 6),
    updatedAt: new Date().toISOString(),
  };
}

export function maybeCompanionAwarenessMoment(now = new Date()): string | null {
  if (!isPhase3AdaptiveRelationshipActive(now)) return null;
  const cur = readState();
  if (cur.lastAwarenessMomentAt) {
    const elapsed = now.getTime() - new Date(cur.lastAwarenessMomentAt).getTime();
    if (elapsed < AWARENESS_COOLDOWN_MS) return null;
  }

  const p2 = getPhase2DiscoveryState();
  const top = cur.predictivePatterns[0];
  if (top?.id === "visibility_avoidance" && top.count >= 2) {
    return "It seems like visibility conversations often create uncertainty for you.";
  }
  if (p2.learningStyle.primary === "visual" || p2.learningStyle.primary === "hybrid") {
    const compass = p2.resources.find((r) => r.id === "decision_compass" && r.helpfulScore >= 50);
    if (compass) {
      return "I've noticed decisions seem easier when we map them visually.";
    }
  }
  const clearMind = p2.resources.find((r) => r.id === "clear_my_mind" && r.helpfulScore >= 55);
  if (clearMind) {
    return "You usually gain momentum after a Clear My Mind session.";
  }
  if (top?.count >= 2) {
    return `I'm noticing a pattern: ${top.label.toLowerCase()}. I may be wrong — tell me if that doesn't fit.`;
  }
  return null;
}

export function maybeAnticipatorySupport(input?: {
  userText?: string;
  now?: Date;
}): string | null {
  if (!isPhase3AdaptiveRelationshipActive(input?.now)) return null;
  const cur = readState();
  const now = input?.now ?? new Date();
  if (cur.lastAnticipatoryOfferAt) {
    const elapsed = now.getTime() - new Date(cur.lastAnticipatoryOfferAt).getTime();
    if (elapsed < ANTICIPATORY_COOLDOWN_MS) return null;
  }

  const p2 = getPhase2DiscoveryState();
  const daysSinceSession = Math.floor(
    (now.getTime() - new Date(p2.lastSessionAt).getTime()) / 86_400_000,
  );
  if (daysSinceSession >= 5) {
    return "It's been a few days — would a small re-entry step help, without pressure?";
  }
  if (/\boverwhelm|too much|juggling\b/i.test(input?.userText ?? "")) {
    return "You've been juggling several priorities — would it help to simplify things for a few minutes?";
  }
  return null;
}

export function recordAwarenessMomentShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastAwarenessMomentAt: now.toISOString(),
    awarenessMomentsShown: cur.awarenessMomentsShown + 1,
    founderMetrics: {
      ...cur.founderMetrics,
      observationsOffered: cur.founderMetrics.observationsOffered + 1,
    },
  });
}

export function recordAnticipatoryOfferShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    lastAnticipatoryOfferAt: now.toISOString(),
    anticipatoryOffersShown: cur.anticipatoryOffersShown + 1,
  });
}

export type RelationshipCheckpoint = {
  dayMark: 30 | 60 | 90;
  title: string;
  sections: { heading: string; bullets: string[] }[];
};

export function getRelationshipCheckpoint(now = new Date()): RelationshipCheckpoint | null {
  if (!isPhase3AdaptiveRelationshipActive(now)) return null;
  const days = daysSinceRelationshipStart(now);
  const mark: 30 | 60 | 90 | null =
    days >= 90 ? 90 : days >= 60 ? 60 : days >= 30 ? 30 : null;
  if (!mark) return null;

  const cur = readState();
  if (cur.checkpointsShown[String(mark) as "30" | "60" | "90"]) return null;

  const manual = buildUserOperatingManual();
  const p2 = getPhase2DiscoveryState();
  return {
    dayMark: mark,
    title: "What We've Learned Together",
    sections: [
      {
        heading: "What helps most",
        bullets: manual.bestResources.length
          ? manual.bestResources
          : ["Still learning — every session teaches us more."],
      },
      {
        heading: "What creates friction",
        bullets: manual.frictionPatterns.length
          ? manual.frictionPatterns
          : ["No strong friction patterns yet."],
      },
      {
        heading: "How you work best",
        bullets: [
          manual.supportStyles[0] ?? "Conversational support",
          manual.bestTimeToWork
            ? `Often ${manual.bestTimeToWork.window} (${manual.bestTimeToWork.confidence} confidence)`
            : "Still observing energy patterns",
        ],
      },
      {
        heading: "Sessions together",
        bullets: [`${p2.sessionCount} sessions over ${days} days`],
      },
    ],
  };
}

export function markCheckpointShown(mark: 30 | 60 | 90): void {
  const cur = readState();
  writeState({
    ...cur,
    checkpointsShown: { ...cur.checkpointsShown, [String(mark)]: true },
  });
}

export function buildCompanionLearningObservations(): string[] {
  const p3 = readState();
  const p2 = getPhase2DiscoveryState();
  const observations: string[] = [];

  for (const pattern of p3.predictivePatterns.filter((p) => p.count >= 2).slice(0, 3)) {
    observations.push(`You often gain momentum after ${pattern.label.toLowerCase()}.`);
  }
  if (p2.learningStyle.primary === "visual" || p2.learningStyle.secondary === "visual") {
    observations.push("You tend to make faster decisions when using visual tools.");
  }
  const compass = p2.resources.find((r) => r.id === "decision_compass" && r.helpfulScore >= 50);
  if (compass) {
    observations.push("Decision mapping seems to reduce overwhelm for you.");
  }
  if (p2.challenges.some((c) => /visibility/i.test(c.label))) {
    observations.push("Visibility feels easier when connected to helping others.");
  }

  return [...new Set(observations)].slice(0, 4);
}

export function formatMyOperatingManualForPanel(
  manual = buildUserOperatingManual(),
): string {
  const momentum = manual.bestResources.length
    ? manual.bestResources
    : manual.supportStyles;
  const lines = [
    "## My Operating Manual™",
    "",
    "_The companion already knows you — this is your living guide._",
    "",
    "### How I Work Best",
    manual.supportStyles[0] ?? "Still learning — every conversation adds detail.",
    "",
    "### What Creates Momentum",
    ...momentum.map((item) => `• ${item}`),
    "",
    "### What Creates Friction",
    ...(manual.frictionPatterns.length
      ? manual.frictionPatterns.map((f) => `• ${f}`)
      : ["• Still emerging from our work together"]),
    "",
    "### Best Resources For Me",
    ...(manual.bestResources.length
      ? manual.bestResources.map((r) => `• ${r}`)
      : ["• Still learning which tools help most"]),
    "",
    "### What The Companion Is Learning",
    ...buildCompanionLearningObservations().map((o) => `• ${o}`),
  ];
  return lines.join("\n");
}

export function formatUserOperatingManualForDisplay(
  manual = buildUserOperatingManual(),
): string {
  const lines = ["## My Operating Manual™", "", "_Continuously evolving — not a form you filled out._"];
  if (manual.businessProfile.type || manual.businessProfile.primaryGoal) {
    lines.push("", "### Business Profile");
    if (manual.businessProfile.type) lines.push(`Business Type: ${manual.businessProfile.type}`);
    if (manual.businessProfile.primaryGoal) {
      lines.push(`Primary Goal: ${manual.businessProfile.primaryGoal}`);
    }
    if (manual.businessProfile.currentFocus) {
      lines.push(`Current Focus: ${manual.businessProfile.currentFocus}`);
    }
  }
  if (manual.strengths.length) {
    lines.push("", "### Strengths", ...manual.strengths.map((s) => `• ${s}`));
  }
  if (manual.challenges.length) {
    lines.push("", "### Challenges", ...manual.challenges.map((c) => `• ${c}`));
  }
  if (manual.bestResources.length) {
    lines.push("", "### Best Resources", ...manual.bestResources.map((r) => `• ${r}`));
  }
  if (manual.supportStyles.length) {
    lines.push("", "### Most Effective Support Style", ...manual.supportStyles);
  }
  if (manual.bestTimeToWork) {
    lines.push("", "### Best Time To Work", manual.bestTimeToWork.window);
  }
  if (manual.frictionPatterns.length) {
    lines.push(
      "",
      "### Most Common Friction Patterns",
      ...manual.frictionPatterns.map((f) => `• ${f}`),
    );
  }
  return lines.join("\n");
}

export function phase3AdaptiveRelationshipHintForChat(input?: {
  awarenessMoment?: string | null;
  anticipatorySupport?: string | null;
}): string | null {
  if (!isPhase3AdaptiveRelationshipActive()) return null;

  const manual = buildUserOperatingManual();
  const awareness = input?.awarenessMoment ?? maybeCompanionAwarenessMoment();
  const anticipatory = input?.anticipatorySupport ?? maybeAnticipatorySupport();

  const parts = [
    "PHASE 3 ADAPTIVE RELATIONSHIP INTELLIGENCE™ (invisible — never surveillance):",
    "Goal: anticipate needs before the user names them. Prevention over prediction.",
    "User should feel: aware, helpful, attentive — NOT watched, tracked, or analyzed.",
    "Trust language only: 'It seems like…', 'I'm noticing…', 'I may be wrong, but…'",
    "Never diagnose. Never claim certainty. Always allow correction.",
  ];

  if (manual.frictionPatterns[0]) {
    parts.push(`Recurring pattern: ${manual.frictionPatterns[0]}.`);
  }
  if (manual.bestResources[0]) {
    parts.push(`What actually helps: ${manual.bestResources[0]}.`);
  }

  if (awareness) {
    parts.push("COMPANION AWARENESS (optional — weave naturally once):", `"${awareness}"`);
  }
  if (anticipatory) {
    parts.push("ANTICIPATORY SUPPORT (permission first — optional):", `"${anticipatory}"`);
  }

  parts.push(
    "Early intervention: notice overload/avoidance signs and offer support earlier — never auto-act.",
    "User should feel increasingly: 'This companion understands what gets in my way.'",
  );

  return parts.join("\n");
}

export function resetPhase3RelationshipForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
