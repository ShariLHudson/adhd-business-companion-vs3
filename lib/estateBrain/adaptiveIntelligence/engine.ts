/**
 * Estate Adaptive Intelligence™ — learn preferences that change future behavior.
 *
 * @see docs/estate/ESTATE_ADAPTIVE_INTELLIGENCE.md
 */

import { getIntelligenceProfile } from "@/lib/intelligence-layer/profileStore";
import type { TraitScore } from "@/lib/intelligence-layer/types";
import type { DiscoveryTopic } from "../discoveryTypes";
import { questionsForTopic } from "../discoveryRegistry";
import type { EstateCoachingPrescription } from "../estateCoachingTypes";
import {
  ANTICIPATION_CHAINS,
  ADAPTIVE_PREFERENCE_REGISTRY,
  isWorthRemembering,
} from "./preferenceRegistry";
import {
  loadAdaptiveEstateStore,
  saveAdaptiveEstateStore,
  upsertPreferenceState,
} from "./store";
import type {
  AdaptiveBehaviorImpact,
  AdaptiveConfidenceTier,
  AdaptivePreferenceId,
  AdaptivePreferenceState,
  AdaptiveSignal,
  AnticipationEvent,
  AnticipationSuggestion,
} from "./types";

const LEARNING_RATE = 0.18;
const CONFIDENCE_STEP = 0.2;
const MAX_CONFIDENCE = 0.92;

const HIGH_CONFIDENCE = 0.65;
const MEDIUM_CONFIDENCE = 0.38;
const MIN_OBSERVATIONS_HIGH = 4;
const MIN_OBSERVATIONS_MEDIUM = 2;

const PREFERENCE_CHECK_INTERVAL_MS = 1000 * 60 * 60 * 24 * 45;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function nowIso(): string {
  return new Date().toISOString();
}

export function confidenceTier(
  state: AdaptivePreferenceState | null | undefined,
): AdaptiveConfidenceTier {
  if (!state || state.memberDeclined) return "low";
  const observations = state.observations;
  const confidence = state.memberConfirmed
    ? Math.max(state.confidence, HIGH_CONFIDENCE)
    : state.confidence;
  if (confidence >= HIGH_CONFIDENCE && observations >= MIN_OBSERVATIONS_HIGH) {
    return "high";
  }
  if (confidence >= MEDIUM_CONFIDENCE && observations >= MIN_OBSERVATIONS_MEDIUM) {
    return "medium";
  }
  return "low";
}

export function getAdaptivePreference(
  id: AdaptivePreferenceId,
): AdaptivePreferenceState | null {
  const store = loadAdaptiveEstateStore();
  return store.preferences[id] ?? null;
}

export function getStrongPreferences(
  impact?: AdaptiveBehaviorImpact,
): AdaptivePreferenceState[] {
  const store = loadAdaptiveEstateStore();
  return Object.values(store.preferences)
    .filter((p): p is AdaptivePreferenceState => Boolean(p))
    .filter((p) => {
      if (!impact) return confidenceTier(p) !== "low";
      const def = ADAPTIVE_PREFERENCE_REGISTRY[p.id];
      return def.impacts.includes(impact) && confidenceTier(p) !== "low";
    })
    .sort((a, b) => b.confidence - a.confidence);
}

function defaultState(id: AdaptivePreferenceId): AdaptivePreferenceState {
  return {
    id,
    score: 50,
    confidence: 0,
    observations: 0,
    lastUpdated: nowIso(),
  };
}

function applySignalToState(
  state: AdaptivePreferenceState,
  signal: AdaptiveSignal,
): AdaptivePreferenceState {
  const weight = signal.weight ?? 12;
  const target =
    signal.valence === "positive" ? 50 + weight : 50 - weight * 0.6;
  const score = clamp(
    state.score * (1 - LEARNING_RATE) + target * LEARNING_RATE,
    0,
    100,
  );
  const observations = state.observations + 1;
  const confidence = clamp(
    state.confidence + CONFIDENCE_STEP * (1 - state.confidence),
    0,
    MAX_CONFIDENCE,
  );
  return {
    ...state,
    score: Math.round(score * 10) / 10,
    confidence: Math.round(confidence * 1000) / 1000,
    observations,
    lastUpdated: signal.at,
  };
}

/** Record only preferences that change future Spark decisions. */
export function recordAdaptiveSignal(signal: AdaptiveSignal): void {
  if (!isWorthRemembering(signal.preferenceId)) return;
  const current =
    getAdaptivePreference(signal.preferenceId) ??
    defaultState(signal.preferenceId);
  upsertPreferenceState(applySignalToState(current, signal));
}

export function recordAdaptiveSignals(signals: AdaptiveSignal[]): void {
  for (const signal of signals) {
    recordAdaptiveSignal(signal);
  }
}

function traitFromProfile(path: string): TraitScore | null {
  const parts = path.split(".");
  if (parts.length !== 3) return null;
  const [section, subsection, trait] = parts;
  const profile = getIntelligenceProfile();
  const block = profile[section as keyof typeof profile] as
    | Record<string, Record<string, TraitScore>>
    | undefined;
  return block?.[subsection]?.[trait] ?? null;
}

/** Pull existing intelligence profile traits into estate preferences (read-only sync). */
export function syncAdaptiveFromIntelligenceProfile(): void {
  const store = loadAdaptiveEstateStore();
  let changed = false;

  for (const def of Object.values(ADAPTIVE_PREFERENCE_REGISTRY)) {
    if (!def.profileTraitPath) continue;
    const trait = traitFromProfile(def.profileTraitPath);
    if (!trait || trait.confidence < 0.2) continue;

    const existing = store.preferences[def.id] ?? defaultState(def.id);
    if (existing.observations > trait.observations) continue;

    store.preferences[def.id] = {
      id: def.id,
      score: trait.score,
      confidence: trait.confidence,
      observations: trait.observations,
      lastUpdated: trait.lastUpdated,
    };
    changed = true;
  }

  if (changed) saveAdaptiveEstateStore(store);
}

const COACHING_PREFERENCE_MAP: Record<string, AdaptivePreferenceId[]> = {
  "focus-clear-mind": ["clear_mind_for_thoughts", "conversation_over_forms"],
  "focus-breathing": ["step_by_step_guidance"],
  "focus-music": ["learn_by_doing"],
  "focus-body-double": ["learn_by_doing"],
  "focus-time-block": ["morning_focus", "step_by_step_guidance"],
  "focus-peaceful-place": ["visual_thinking"],
  "focus-studio": ["learn_by_doing"],
  "overwhelm-clear-mind": ["clear_mind_for_thoughts", "conversation_over_forms"],
  "overwhelm-plan-day": ["step_by_step_guidance", "detailed_plans"],
  "creative-brainstorm": ["brainstorm_before_writing"],
  "creative-visual": ["visual_thinking"],
  "decision-compare": ["compare_options"],
  "decision-recommend": ["wants_recommendations"],
};

export function recordSignalsFromCoachingChoice(
  prescription: EstateCoachingPrescription,
): void {
  const at = nowIso();
  const ids = COACHING_PREFERENCE_MAP[prescription.id] ?? [];
  recordAdaptiveSignals(
    ids.map((preferenceId) => ({
      kind: "coaching_choice",
      at,
      preferenceId,
      valence: "positive",
      source: prescription.id,
    })),
  );

  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    recordAdaptiveSignal({
      kind: "coaching_choice",
      at,
      preferenceId: "morning_focus",
      valence: "positive",
      weight: 8,
      source: prescription.id,
    });
  }
}

const DISCOVERY_ANSWER_SIGNALS: {
  questionId: string;
  pattern: RegExp;
  preferences: AdaptivePreferenceId[];
}[] = [
  {
    questionId: "sop-starting-point",
    pattern: /\b(?:already have|written down|existing|documented)\b/i,
    preferences: ["templates_first"],
  },
  {
    questionId: "sop-starting-point",
    pattern: /\b(?:scratch|fresh|blank)\b/i,
    preferences: ["blank_page_first"],
  },
  {
    questionId: "sop-audience-size",
    pattern: /\b(?:va|team|multiple|staff)\b/i,
    preferences: ["talk_through_creation", "sop_to_checklist"],
  },
  {
    questionId: "focus-obstacle",
    pattern: /\b(?:too many thoughts|scattered|crowded)\b/i,
    preferences: ["clear_mind_for_thoughts"],
  },
  {
    questionId: "research-depth",
    pattern: /\b(?:deep|report)\b/i,
    preferences: ["detailed_plans", "research_to_library"],
  },
  {
    questionId: "research-depth",
    pattern: /\b(?:quick|comparison)\b/i,
    preferences: ["quick_summaries"],
  },
];

export function recordSignalsFromDiscoveryAnswer(
  questionId: string,
  answer: string,
): void {
  const at = nowIso();
  for (const row of DISCOVERY_ANSWER_SIGNALS) {
    if (row.questionId !== questionId) continue;
    if (!row.pattern.test(answer)) continue;
    recordAdaptiveSignals(
      row.preferences.map((preferenceId) => ({
        kind: "discovery_answer",
        at,
        preferenceId,
        valence: "positive",
        source: questionId,
      })),
    );
  }
}

export function recordSignalsFromCreateCompletion(
  artifactKind: string,
): void {
  const at = nowIso();
  if (/\bsop\b/i.test(artifactKind)) {
    recordAdaptiveSignal({
      kind: "create_completion",
      at,
      preferenceId: "sop_to_checklist",
      valence: "positive",
      weight: 10,
    });
    recordAdaptiveSignal({
      kind: "create_completion",
      at,
      preferenceId: "templates_first",
      valence: "positive",
      weight: 6,
    });
  }
  if (/\bnewsletter|email sequence\b/i.test(artifactKind)) {
    recordAdaptiveSignal({
      kind: "create_completion",
      at,
      preferenceId: "newsletter_to_social",
      valence: "positive",
    });
  }
}

export function recordSignalsFromResearchCompletion(): void {
  recordAdaptiveSignal({
    kind: "create_completion",
    at: nowIso(),
    preferenceId: "research_to_library",
    valence: "positive",
  });
}

const DISCOVERY_MEMORY_ANSWERS: {
  questionId: string;
  preferenceId: AdaptivePreferenceId;
  minTier: AdaptiveConfidenceTier;
  answer: string;
  minScore?: number;
}[] = [
  {
    questionId: "sop-starting-point",
    preferenceId: "templates_first",
    minTier: "medium",
    minScore: 55,
    answer: "I already have a process written down somewhere",
  },
  {
    questionId: "sop-starting-point",
    preferenceId: "blank_page_first",
    minTier: "high",
    minScore: 55,
    answer: "Starting from scratch",
  },
  {
    questionId: "sop-audience-size",
    preferenceId: "talk_through_creation",
    minTier: "medium",
    minScore: 58,
    answer: "Multiple people on my team will follow it",
  },
];

function tierRank(tier: AdaptiveConfidenceTier): number {
  return tier === "high" ? 3 : tier === "medium" ? 2 : 1;
}

/** Skip discovery questions Spark already knows — never ask just to complete a form. */
export function prefillDiscoveryFromAdaptiveMemory(
  topic: DiscoveryTopic,
): Record<string, string> {
  syncAdaptiveFromIntelligenceProfile();
  const answers: Record<string, string> = {};
  const questionIds = new Set(questionsForTopic(topic).map((q) => q.id));

  for (const row of DISCOVERY_MEMORY_ANSWERS) {
    if (!questionIds.has(row.questionId)) continue;
    const pref = getAdaptivePreference(row.preferenceId);
    const tier = confidenceTier(pref);
    if (tierRank(tier) < tierRank(row.minTier)) continue;
    if (row.minScore && (pref?.score ?? 0) < row.minScore) continue;
    answers[row.questionId] = row.answer;
  }

  return answers;
}

export function adaptivePreparationExtras(
  topic: DiscoveryTopic,
): string | null {
  syncAdaptiveFromIntelligenceProfile();
  const parts: string[] = [];

  if (topic === "create_sop") {
    const talk = getAdaptivePreference("talk_through_creation");
    if (confidenceTier(talk) !== "low") {
      parts.push(
        tierLine(
          talk,
          "You've been talking SOPs through lately — we can do that again.",
          "You sometimes talk SOPs through rather than typing — want to do that?",
        ),
      );
    }
    const checklist = getAdaptivePreference("sop_to_checklist");
    if (confidenceTier(checklist) === "high") {
      parts.push("I'll include a printable checklist like your last few SOPs.");
    }
  }

  if (topic === "focus") {
    const clearMind = getAdaptivePreference("clear_mind_for_thoughts");
    if (confidenceTier(clearMind) === "high") {
      parts.push(
        "When your head is crowded, clearing it first has been working well for you.",
      );
    }
  }

  if (topic === "research" && confidenceTier(getAdaptivePreference("research_to_library")) !== "low") {
    parts.push("I'll be ready to save this into your library when we're done.");
  }

  return parts.length ? parts.join(" ") : null;
}

function tierLine(
  pref: AdaptivePreferenceState | null,
  high: string,
  medium: string,
): string {
  return confidenceTier(pref) === "high" ? high : medium;
}

export function adaptiveCoachingOpener(
  situation: string,
): string | null {
  syncAdaptiveFromIntelligenceProfile();
  const learnByDoing = getAdaptivePreference("learn_by_doing");
  const brainstorm = getAdaptivePreference("brainstorm_before_writing");
  const stepByStep = getAdaptivePreference("step_by_step_guidance");

  if (situation === "focus" && confidenceTier(learnByDoing) === "high") {
    return "I know you prefer learning by doing — let's pick something we can start right away.";
  }
  if (situation === "creative_block" && confidenceTier(brainstorm) !== "low") {
    return tierLine(
      brainstorm,
      "I've noticed you usually brainstorm before writing. Want a few minutes to explore ideas first?",
      "It seems like brainstorming before writing helps you — want to start there?",
    );
  }
  if (confidenceTier(stepByStep) === "high") {
    return "I'll keep this step-by-step — just tell me when you want the next piece.";
  }
  if (confidenceTier(stepByStep) === "low" && stepByStep && stepByStep.observations < 2) {
    return "Would you like me to explain each step, or jump in together?";
  }

  return null;
}

export function anticipateNextStep(
  event: AnticipationEvent,
): AnticipationSuggestion | null {
  syncAdaptiveFromIntelligenceProfile();
  const chain = ANTICIPATION_CHAINS.find((c) => c.event === event);
  if (!chain) return null;

  const pref = getAdaptivePreference(chain.preferenceId);
  const tier = confidenceTier(pref);
  if (tier === "low" || (pref?.observations ?? 0) < 2) return null;

  return {
    event,
    preferenceId: chain.preferenceId,
    tier,
    line: tier === "high" ? chain.highConfidenceLine : chain.lowConfidenceLine,
  };
}

export function shouldOfferPreferenceCheck(now = new Date()): boolean {
  const store = loadAdaptiveEstateStore();
  if (!store.lastPreferenceCheckAt) return false;
  const last = new Date(store.lastPreferenceCheckAt).getTime();
  return now.getTime() - last >= PREFERENCE_CHECK_INTERVAL_MS;
}

export function markPreferenceCheckOffered(now = new Date()): void {
  const store = loadAdaptiveEstateStore();
  store.lastPreferenceCheckAt = now.toISOString();
  saveAdaptiveEstateStore(store);
}

export function preferenceCheckLine(): string {
  return "I've noticed you're working a little differently lately. Should I adjust how I help?";
}

export function adaptiveEstateHintForChat(): string {
  syncAdaptiveFromIntelligenceProfile();
  const strong = getStrongPreferences();
  if (!strong.length) {
    return [
      "ESTATE ADAPTIVE INTELLIGENCE (invisible):",
      "Observe working, communication, decision, creative, and learning patterns.",
      "Only remember preferences that change the next decision.",
      "Low confidence → tentative language. High confidence → quiet preparation.",
      "Never become repetitive — become progressively more helpful.",
    ].join("\n");
  }

  const summary = strong
    .slice(0, 5)
    .map((p) => {
      const label = ADAPTIVE_PREFERENCE_REGISTRY[p.id].memberFacingLabel;
      return `${label} (${confidenceTier(p)}, internal)`;
    })
    .join("; ");

  return [
    "ESTATE ADAPTIVE INTELLIGENCE (invisible):",
    `Learned signals: ${summary}.`,
    "Match guidance to these patterns — never announce scores.",
    "High confidence → prepare environment quietly. Low → ask gently.",
    "Golden rule: progressively more helpful, never predictable or nagging.",
  ].join("\n");
}

export function memberFacingPreferenceLine(
  id: AdaptivePreferenceId,
): string | null {
  const pref = getAdaptivePreference(id);
  const tier = confidenceTier(pref);
  const label = ADAPTIVE_PREFERENCE_REGISTRY[id].memberFacingLabel;
  if (tier === "high") {
    return `I know you ${label}.`;
  }
  if (tier === "medium") {
    return `It seems like you may ${label}.`;
  }
  return null;
}
