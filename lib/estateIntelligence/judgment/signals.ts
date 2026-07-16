/**
 * Context signal extraction — weighted interpretation, not single keyword match.
 */

import { matchCanonicalPlaceInText } from "@/lib/estate/canonicalEstateRegistry";
import { isSubstantiveConversationHelpRequest } from "@/lib/estate/substantiveConversationHelp";
import { isExplicitProjectsCommandIntent } from "@/lib/createExperience/createExperienceRouting";
import { getPlaceByAlias } from "@/lib/estateKnowledge";
import type {
  EstateActivityMode,
  EstateContextSignals,
  EstateEmotionalSignal,
  EstateIntentFamily,
} from "./types";

type SignalWeights = {
  emotional: Partial<Record<EstateEmotionalSignal, number>>;
  intentFamilies: Partial<Record<EstateIntentFamily, number>>;
  activityMode: Partial<Record<EstateActivityMode, number>>;
  wantsReading: number;
  wantsWater: number;
  wantsFocus: number;
  wantsThink: number;
  wantsRecover: number;
  wantsCatalog: number;
  wantsRoomStory: number;
  overwhelm: number;
};

function emptyWeights(): SignalWeights {
  return {
    emotional: {},
    intentFamilies: {},
    activityMode: {},
    wantsReading: 0,
    wantsWater: 0,
    wantsFocus: 0,
    wantsThink: 0,
    wantsRecover: 0,
    wantsCatalog: 0,
    wantsRoomStory: 0,
    overwhelm: 0,
  };
}

function bump(
  weights: SignalWeights,
  field: keyof Omit<SignalWeights, "emotional" | "intentFamilies" | "activityMode">,
  amount = 1,
): void {
  weights[field] += amount;
}

function bumpEmotion(
  weights: SignalWeights,
  emotion: EstateEmotionalSignal,
  amount = 1,
): void {
  weights.emotional[emotion] = (weights.emotional[emotion] ?? 0) + amount;
}

function bumpFamily(
  weights: SignalWeights,
  family: EstateIntentFamily,
  amount = 1,
): void {
  weights.intentFamilies[family] = (weights.intentFamilies[family] ?? 0) + amount;
}

function bumpMode(
  weights: SignalWeights,
  mode: EstateActivityMode,
  amount = 1,
): void {
  weights.activityMode[mode] = (weights.activityMode[mode] ?? 0) + amount;
}

const SIGNAL_RULES: ReadonlyArray<{
  pattern: RegExp;
  apply: (w: SignalWeights) => void;
}> = [
  {
    pattern:
      /\b(?:overwhelm(?:ed|ing)?|too much|can't think|brain (?:is )?full|mental clutter|scattered|jumbled)\b/i,
    apply: (w) => {
      bumpEmotion(w, "overwhelmed", 3);
      bumpFamily(w, "recover", 3);
      bumpFamily(w, "organize", 2);
      bump(w, "wantsRecover", 3);
      bump(w, "overwhelm", 3);
      bumpMode(w, "reflection", 2);
    },
  },
  {
    pattern: /\b(?:burnout|burned out|exhausted|depleted|fried)\b/i,
    apply: (w) => {
      bumpEmotion(w, "burnout", 3);
      bumpFamily(w, "recover", 3);
      bump(w, "wantsRecover", 3);
      bump(w, "overwhelm", 2);
    },
  },
  {
    pattern: /\b(?:stressed|stress|tense|on edge)\b/i,
    apply: (w) => {
      bumpEmotion(w, "stressed", 2);
      bumpFamily(w, "recover", 2);
      bump(w, "wantsRecover", 2);
      bump(w, "overwhelm", 1);
    },
  },
  {
    pattern: /\b(?:anxious|anxiety|worried|nervous)\b/i,
    apply: (w) => {
      bumpEmotion(w, "anxious", 2);
      bumpFamily(w, "recover", 2);
      bumpFamily(w, "focus", 1);
      bump(w, "wantsRecover", 1);
    },
  },
  {
    pattern:
      /\b(?:somewhere to read|place to read|want to read|need to read|curl up|quiet read|read a book)\b/i,
    apply: (w) => {
      bump(w, "wantsReading", 4);
      bumpFamily(w, "learn", 2);
      bumpFamily(w, "focus", 1);
      bumpMode(w, "reflection", 2);
    },
  },
  {
    pattern:
      /\b(?:need to think|want to think|figure out|sort out|big decision|weighing|stuck on)\b/i,
    apply: (w) => {
      bump(w, "wantsThink", 4);
      bumpFamily(w, "think", 3);
      bumpMode(w, "reflection", 2);
    },
  },
  {
    pattern:
      /\b(?:need to focus|want to focus|can't focus|stay focused|deep work|concentrate)\b/i,
    apply: (w) => {
      bump(w, "wantsFocus", 4);
      bumpFamily(w, "focus", 3);
      bumpMode(w, "creation", 1);
    },
  },
  {
    pattern:
      /\b(?:near water|by the water|water'?s edge|lakeside|pond|ocean conservatory)\b/i,
    apply: (w) => {
      bump(w, "wantsWater", 4);
      bumpFamily(w, "recover", 2);
      bumpMode(w, "reflection", 2);
    },
  },
  {
    // Writing/making an artifact — not bare "email" / "create" in how-to questions.
    pattern:
      /\b(?:write|draft|compose)\b.{0,40}\b(?:email|newsletter|proposal|presentation|sop|document|letter|post)\b|\b(?:create|build|make)\s+(?:a|an|the|my)\s+\w+|\b(?:newsletter|proposal|presentation|sop)\b/i,
    apply: (w) => {
      bumpFamily(w, "create", 3);
      bumpMode(w, "creation", 3);
    },
  },
  {
    pattern:
      /\b(?:organize|plan my day|projects|parking lot|brain dump|clear my mind)\b/i,
    apply: (w) => {
      bumpFamily(w, "organize", 3);
      bumpMode(w, "mixed", 2);
    },
  },
  {
    pattern: /\b(?:learn|study|course|research|great thinkers)\b/i,
    apply: (w) => {
      bumpFamily(w, "learn", 3);
      bumpMode(w, "reflection", 1);
    },
  },
  {
    pattern: /\b(?:celebrate|win|accomplish|evidence|gallery|proud)\b/i,
    apply: (w) => {
      bumpEmotion(w, "celebratory", 2);
      bumpFamily(w, "celebrate", 3);
    },
  },
  {
    pattern: /\b(?:what rooms|what places|show me the estate|explore the estate)\b/i,
    apply: (w) => {
      bump(w, "wantsCatalog", 5);
      bumpFamily(w, "explore", 2);
    },
  },
  {
    pattern:
      /\b(?:tell me about|what is|what's|history of|what(?:'s| is) special about)\s+(?:the\s+)?/i,
    apply: (w) => {
      bump(w, "wantsRoomStory", 3);
      bumpFamily(w, "explore", 1);
    },
  },
];

function pickTopEmotion(
  weights: Partial<Record<EstateEmotionalSignal, number>>,
): EstateEmotionalSignal {
  let best: EstateEmotionalSignal = "neutral";
  let bestScore = 0;
  for (const [key, score] of Object.entries(weights)) {
    if ((score ?? 0) > bestScore) {
      best = key as EstateEmotionalSignal;
      bestScore = score ?? 0;
    }
  }
  return best;
}

function pickIntentFamilies(
  weights: Partial<Record<EstateIntentFamily, number>>,
): EstateIntentFamily[] {
  return (Object.entries(weights) as [EstateIntentFamily, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([family]) => family);
}

function pickActivityMode(
  weights: Partial<Record<EstateActivityMode, number>>,
): EstateActivityMode {
  let best: EstateActivityMode = "unknown";
  let bestScore = 0;
  for (const [key, score] of Object.entries(weights)) {
    if ((score ?? 0) > bestScore) {
      best = key as EstateActivityMode;
      bestScore = score ?? 0;
    }
  }
  return best;
}

export function extractEstateContextSignals(
  userText: string,
): EstateContextSignals {
  const text = userText.trim();
  const weights = emptyWeights();

  for (const rule of SIGNAL_RULES) {
    if (rule.pattern.test(text)) {
      rule.apply(weights);
    }
  }

  const canonical = matchCanonicalPlaceInText(text);
  const aliasPlace = getPlaceByAlias(text);
  const namedPlaceId = canonical?.id ?? aliasPlace?.id ?? null;

  if (namedPlaceId && weights.wantsRoomStory > 0) {
    bumpFamily(weights, "explore", 1);
  }

  const intentFamilies = pickIntentFamilies(weights.intentFamilies);
  if (intentFamilies.length === 0 && namedPlaceId) {
    intentFamilies.push("explore");
  }

  const emotional = pickTopEmotion(weights.emotional);
  const overwhelmLevel = Math.min(1, weights.overwhelm / 4);
  const confidence = Math.min(
    1,
    (Math.max(...Object.values(weights.intentFamilies), 0) +
      (namedPlaceId ? 2 : 0)) /
      6,
  );

  return {
    emotional,
    overwhelmLevel,
    intentFamilies,
    activityMode: pickActivityMode(weights.activityMode),
    wantsReading: weights.wantsReading >= 2,
    wantsWater: weights.wantsWater >= 2,
    wantsFocus: weights.wantsFocus >= 2,
    wantsThink: weights.wantsThink >= 2,
    wantsRecover:
      weights.wantsRecover >= 2 || emotional === "overwhelmed" || emotional === "burnout",
    wantsCatalog: weights.wantsCatalog >= 3,
    wantsRoomStory: weights.wantsRoomStory >= 2 && Boolean(namedPlaceId),
    namedPlaceId,
    confidence,
  };
}

/** Explicit place/mood seeking — required before work intents become room offers. */
const PLACE_SEEKING_RE =
  /\b(?:somewhere|some place|a place to|quiet place|peaceful place|which room|what room|visit|take me|go to|head to|bring me|where (?:should|can|do|would) i|room for|space (?:to|for)|settle into|wander|show me the estate|estate map)\b/i;

/**
 * True only when the member is asking about places / atmosphere —
 * never for ordinary how-to, automation, or business help.
 */
export function isEstateJudgmentQuery(userText: string): boolean {
  const text = userText.trim();
  if (!text) return false;

  // Substantive help stays in conversation (Spec 108 — uncertain → stay).
  if (isSubstantiveConversationHelpRequest(text)) {
    return false;
  }

  // Explicit Projects commands — navigate/create directly, never soft multi-place menus.
  if (isExplicitProjectsCommandIntent(text)) {
    return false;
  }

  // Direct task requests (write an email…) are Create — not Estate navigation.
  if (
    /^(?:write|draft|create|send|make|build)\b/i.test(text) &&
    !PLACE_SEEKING_RE.test(text) &&
    !/\b(?:room|place|estate|conservatory|library|gazebo)\b/i.test(text)
  ) {
    return false;
  }

  const signals = extractEstateContextSignals(text);
  if (signals.wantsCatalog || signals.wantsRoomStory) return true;
  // Reading / water / focus / think / overwhelm → places only when place-seeking.
  // Bare emotion keywords must never open scenic multi-place menus.
  if (
    (signals.wantsReading || signals.wantsWater) &&
    PLACE_SEEKING_RE.test(text)
  ) {
    return true;
  }
  if (
    (signals.wantsFocus || signals.wantsThink) &&
    PLACE_SEEKING_RE.test(text)
  ) {
    return true;
  }
  if (
    (signals.emotional === "overwhelmed" || signals.emotional === "burnout") &&
    PLACE_SEEKING_RE.test(text)
  ) {
    return true;
  }
  if (signals.wantsRecover && PLACE_SEEKING_RE.test(text)) return true;

  // Work intents (create / organize / learn) alone must not open room menus.
  // Only when the member is clearly seeking a place.
  if (signals.intentFamilies.length > 0 && signals.confidence >= 0.35) {
    const workOnly = signals.intentFamilies.every((f) =>
      f === "create" || f === "organize" || f === "learn" || f === "celebrate",
    );
    if (workOnly && !PLACE_SEEKING_RE.test(text) && !signals.namedPlaceId) {
      return false;
    }
    if (PLACE_SEEKING_RE.test(text) || signals.namedPlaceId) {
      return true;
    }
  }
  return false;
}
