/**
 * Companion Needs Intelligence™
 *
 * The brain layer that asks — before any room is prepared:
 * "What does this ADHD entrepreneur need right now?"
 *
 * Flow position:
 * User → Current Context → Needs Intelligence™ → Room Selection →
 * Hospitality Preparation → Atmosphere → Presence → Conversation → Workspace
 *
 * Decision philosophy: docs/COMPANION_DECISION_INTELLIGENCE.md (Decision Ladder™)
 *
 * We optimize for executive function — not productivity.
 */

import type { EmotionalState, UserIntent } from "@/lib/companionEmotions";
import { placeForSection } from "@/lib/companionUniverse/companionLayoutSystem";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import {
  COMPANION_NEEDS_CATALOG,
  needDefinition,
  primaryPlaceForNeed,
} from "./needsCatalog";
import type {
  AdhdDesignFilterEvaluation,
  CompanionNeedId,
  CompanionNeedsInput,
  CompanionNeedsIntelligence,
  EnergyBand,
  ExecutiveFunctionAssessment,
  ExecutiveFunctionBand,
  NeedScore,
  OverwhelmBand,
} from "./types";

const ALL_NEEDS: CompanionNeedId[] = [
  "relief",
  "clarity",
  "focus",
  "creativity",
  "strategy",
  "reflection",
  "learning",
  "restoration",
];

const NEED_SIGNALS: Record<CompanionNeedId, RegExp[]> = {
  relief: [
    /\b(?:overwhelm(?:ed|ing)?|too much|carrying too much|can'?t carry|unload|let (?:it|this) out|clear my mind|brain (?:is )?spinning|frazzled|wound up|on edge|racing thoughts|everything (?:feels )?like too much|need permission|just need to vent|talk it through|heavy right now|mentally exhausted)\b/i,
  ],
  clarity: [
    /\b(?:too many thoughts|can'?t priorit(?:y|ize)|what (?:should|do) i do first|where (?:do i|to) start|one next step|plan my day|today'?s reality|sort (?:this|my thoughts)|untangle|figure out what matters|decision fatigue|can'?t decide|stuck between)\b/i,
  ],
  focus: [
    /\b(?:focus(?: buddy)?|body doubl(?:e|ing)|protect(?: my)? attention|pomodoro|timer|can'?t start|procrastinat|need to (?:start|begin|finish)|get (?:this|it) done|deep work|stay on task|visual focus)\b/i,
  ],
  creativity: [
    /\b(?:brainstorm|creative|write(?: a)?|draft(?:ing)?|content|blog|newsletter|marketing copy|social post|ideas? for|sketch|design|make something|play with)\b/i,
  ],
  strategy: [
    /\b(?:revenue|offer(?:s)?|pricing|clients?|business (?:plan|strategy)|ideal client|sales|launch|funnel|positioning|growth|profit|money goal)\b/i,
  ],
  reflection: [
    /\b(?:gratitude|grateful|wins?|celebrate|look back|perspective|evidence|what went well|proud of|reflect(?:ion)?|end of (?:the )?day|wind down)\b/i,
  ],
  learning: [
    /\b(?:learn(?:ing)?|research|how do i|how to|read about|look up|library|article|course|tutorial|reference|study)\b/i,
  ],
  restoration: [
    /\b(?:tired|exhausted|discouraged|hopeless|burn(?:ed)? out|depleted|low energy|can'?t today|gentle day|recovery|need hope|kindness|quiet day|rest(?:ore)?|garden|just sit)\b/i,
  ],
};

const EMOTION_NEED_WEIGHT: Partial<Record<EmotionalState, Partial<Record<CompanionNeedId, number>>>> = {
  overwhelmed: { relief: 4, clarity: 2, restoration: 2 },
  emotional: { relief: 4, restoration: 3 },
  stuck: { clarity: 3, focus: 2, restoration: 1 },
  unclear: { clarity: 4, learning: 1 },
  focused: { focus: 4, strategy: 1 },
  building: { creativity: 3, strategy: 2, focus: 2 },
};

const INTENT_NEED_WEIGHT: Partial<Record<UserIntent, Partial<Record<CompanionNeedId, number>>>> = {
  reset: { relief: 3, restoration: 2 },
  think: { clarity: 2, reflection: 2, relief: 1 },
  organize: { clarity: 3, strategy: 2 },
  create: { creativity: 4 },
  do: { focus: 3, clarity: 1 },
};

const LOAD_NEED_WEIGHT: Partial<
  Record<NonNullable<CompanionNeedsInput["cognitiveLoadLevel"]>, Partial<Record<CompanionNeedId, number>>>
> = {
  overloaded: { relief: 3, restoration: 2, clarity: 1 },
  heavy: { clarity: 2, relief: 2 },
  moderate: { clarity: 1, focus: 1 },
  light: { focus: 1, creativity: 1, strategy: 1 },
};

const SECTION_NEED_HINT: Partial<Record<NonNullable<CompanionNeedsInput["section"]>, CompanionNeedId>> = {
  home: "relief",
  "plan-my-day": "clarity",
  focus: "focus",
  "visual-focus": "focus",
  "content-generator": "creativity",
  "my-work": "strategy",
  "how-do-i": "learning",
  "brain-dump": "relief",
  games: "restoration",
};

function emptyScores(): Record<CompanionNeedId, NeedScore> {
  const scores = {} as Record<CompanionNeedId, NeedScore>;
  for (const needId of ALL_NEEDS) {
    scores[needId] = { needId, score: 0, reasons: [] };
  }
  return scores;
}

function addScore(
  scores: Record<CompanionNeedId, NeedScore>,
  needId: CompanionNeedId,
  points: number,
  reason: string,
): void {
  const entry = scores[needId]!;
  entry.score += points;
  if (reason && !entry.reasons.includes(reason)) {
    entry.reasons.push(reason);
  }
}

function scoreFromText(
  scores: Record<CompanionNeedId, NeedScore>,
  text: string,
): void {
  const trimmed = text.trim();
  if (!trimmed) return;

  for (const needId of ALL_NEEDS) {
    for (const pattern of NEED_SIGNALS[needId]) {
      if (pattern.test(trimmed)) {
        addScore(scores, needId, 3, "message signal");
        break;
      }
    }
  }
}

function scoreFromEmotion(
  scores: Record<CompanionNeedId, NeedScore>,
  emotionalState: EmotionalState,
): void {
  const weights = EMOTION_NEED_WEIGHT[emotionalState];
  if (!weights) return;
  for (const [needId, points] of Object.entries(weights) as [CompanionNeedId, number][]) {
    addScore(scores, needId, points, `emotional state: ${emotionalState}`);
  }
}

function scoreFromIntent(
  scores: Record<CompanionNeedId, NeedScore>,
  intent: UserIntent,
): void {
  const weights = INTENT_NEED_WEIGHT[intent];
  if (!weights) return;
  for (const [needId, points] of Object.entries(weights) as [CompanionNeedId, number][]) {
    addScore(scores, needId, points, `intent: ${intent}`);
  }
}

function scoreFromLoad(
  scores: Record<CompanionNeedId, NeedScore>,
  level: NonNullable<CompanionNeedsInput["cognitiveLoadLevel"]>,
): void {
  const weights = LOAD_NEED_WEIGHT[level];
  if (!weights) return;
  for (const [needId, points] of Object.entries(weights) as [CompanionNeedId, number][]) {
    addScore(scores, needId, points, `cognitive load: ${level}`);
  }
}

function scoreFromContextFlags(
  scores: Record<CompanionNeedId, NeedScore>,
  input: CompanionNeedsInput,
): void {
  if (input.lowEnergy) {
    addScore(scores, "restoration", 3, "low energy");
    addScore(scores, "relief", 1, "low energy");
  }
  if (input.recoveryGentle) {
    addScore(scores, "restoration", 4, "gentle recovery");
    addScore(scores, "relief", 2, "gentle recovery");
  }
  if (input.section) {
    const hinted = SECTION_NEED_HINT[input.section];
    if (hinted) {
      addScore(scores, hinted, 1, `section: ${input.section}`);
    }
  }
}

function rankScores(scores: Record<CompanionNeedId, NeedScore>): NeedScore[] {
  return ALL_NEEDS.map((id) => scores[id]!).sort((a, b) => b.score - a.score);
}

function resolveConfidence(
  ranked: NeedScore[],
): CompanionNeedsIntelligence["confidence"] {
  if (ranked.length < 2 || ranked[0]!.score === 0) return "low";
  const top = ranked[0]!.score;
  const second = ranked[1]!.score;
  if (top >= 4 && top - second >= 2) return "high";
  if (top >= 2 && top - second >= 1) return "medium";
  return "low";
}

function assessExecutiveFunction(
  input: CompanionNeedsInput,
  primaryNeed: CompanionNeedId,
  ranked: NeedScore[],
): ExecutiveFunctionAssessment {
  const topScore = ranked[0]?.score ?? 0;
  const overwhelmed =
    input.emotionalState === "overwhelmed" ||
    input.emotionalState === "emotional" ||
    input.cognitiveLoadLevel === "overloaded" ||
    primaryNeed === "relief";

  const overwhelm: OverwhelmBand = overwhelmed
    ? input.cognitiveLoadLevel === "overloaded" || primaryNeed === "relief"
      ? "flooded"
      : "high"
    : input.cognitiveLoadLevel === "heavy"
      ? "building"
      : "calm";

  const energy: EnergyBand = input.lowEnergy || input.recoveryGentle
    ? "depleted"
    : primaryNeed === "restoration"
      ? "low"
      : primaryNeed === "focus" || input.emotionalState === "focused"
        ? "rising"
        : "steady";

  const ef: ExecutiveFunctionBand =
    input.lowEnergy || input.recoveryGentle || primaryNeed === "restoration"
      ? "depleted"
      : overwhelm === "flooded" || overwhelm === "high"
        ? "low"
        : topScore >= 3
          ? "moderate"
          : "available";

  return {
    availableExecutiveFunction: ef,
    overwhelm,
    energy,
    needsMomentum:
      primaryNeed === "focus" ||
      input.emotionalState === "stuck" ||
      input.userIntent === "do",
    needsPermission:
      primaryNeed === "relief" ||
      primaryNeed === "restoration" ||
      overwhelm !== "calm",
    needsEncouragement:
      primaryNeed === "restoration" ||
      input.emotionalState === "stuck" ||
      input.emotionalState === "emotional",
    needsFewerDecisions:
      primaryNeed === "clarity" ||
      primaryNeed === "relief" ||
      overwhelm !== "calm",
    needsBodyDoubling: primaryNeed === "focus",
    needsBeauty: Boolean(
      primaryNeed === "restoration" ||
        input.recoveryGentle ||
        input.lowEnergy,
    ),
  };
}

/**
 * ADHD Design Filter™ — before a room renders, does the experience help?
 */
export function evaluateAdhdDesignFilter(input: {
  needId: CompanionNeedId;
  placeId: CompanionPlaceId;
  executiveFunction: ExecutiveFunctionAssessment;
}): AdhdDesignFilterEvaluation {
  const def = needDefinition(input.needId);
  const { executiveFunction: ef } = input;

  const checks: AdhdDesignFilterEvaluation["checks"] = [
    {
      id: "reduces-cognitive-load",
      question: "Does this reduce cognitive load?",
      passed:
        (ef.needsFewerDecisions ||
          input.needId === "relief" ||
          input.needId === "restoration") &&
        !(input.needId === "strategy" && ef.overwhelm === "flooded"),
      note:
        ef.overwhelm === "flooded"
          ? "Flooded overwhelm — keep surfaces minimal"
          : undefined,
    },
    {
      id: "reduces-executive-demand",
      question: "Does this reduce executive function demand?",
      passed:
        ef.availableExecutiveFunction !== "available" ||
        ef.needsPermission ||
        ef.needsFewerDecisions,
      note:
        ef.availableExecutiveFunction === "depleted"
          ? "Depleted EF — one invitation only"
          : undefined,
    },
    {
      id: "creates-calm",
      question: "Does this create calm?",
      passed:
        input.needId !== "strategy" ||
        ef.overwhelm !== "flooded",
      note:
        input.needId === "strategy" && ef.overwhelm === "high"
          ? "Strategy under high overwhelm — soften office entry"
          : undefined,
    },
    {
      id: "orients-user",
      question: "Does it orient the user?",
      passed: true,
      note: `${def.name} → ${def.likelyPlaceIds[0]?.replace(/-/g, " ")}`,
    },
    {
      id: "reduces-shame",
      question: "Does it reduce shame?",
      passed:
        input.needId !== "strategy" ||
        (ef.needsEncouragement && ef.overwhelm !== "flooded"),
      note: "Business rooms must never imply falling behind",
    },
    {
      id: "simplifies-choices",
      question: "Does it simplify choices?",
      passed: ef.needsFewerDecisions || def.likelyPlaceIds.length <= 2,
    },
    {
      id: "improves-state",
      question: "Does it improve the user's state?",
      passed: Boolean(def.restorationOutcome),
      note: `Restoration Promise™: ${def.restorationOutcome}`,
    },
  ];

  const passed = checks.every((check) => check.passed);
  const failedCount = checks.filter((check) => !check.passed).length;

  return {
    checks,
    passed,
    reconsider: failedCount >= 2,
  };
}

function resolvePlaceId(
  needId: CompanionNeedId,
  input: CompanionNeedsInput,
): { placeId: CompanionPlaceId; likelyPlaceIds: CompanionPlaceId[] } {
  if (input.lockedPlaceId) {
    return {
      placeId: input.lockedPlaceId,
      likelyPlaceIds: [...needDefinition(needId).likelyPlaceIds],
    };
  }

  if (input.section) {
    const navPlace = placeForSection(input.section);
    const likely = needDefinition(needId).likelyPlaceIds;
    if (likely.includes(navPlace)) {
      return { placeId: navPlace, likelyPlaceIds: [...likely] };
    }
  }

  return {
    placeId: primaryPlaceForNeed(needId),
    likelyPlaceIds: [...needDefinition(needId).likelyPlaceIds],
  };
}

function buildSummary(
  needId: CompanionNeedId,
  placeId: CompanionPlaceId,
  confidence: CompanionNeedsIntelligence["confidence"],
  ef: ExecutiveFunctionAssessment,
): string {
  const def = needDefinition(needId);
  return [
    `${def.name} (${confidence} confidence)`,
    `Room: ${placeId.replace(/-/g, " ")}`,
    `EF: ${ef.availableExecutiveFunction}, overwhelm: ${ef.overwhelm}, energy: ${ef.energy}`,
    def.restorationPromise,
  ].join(" · ");
}

/**
 * Companion Needs Intelligence™ — identify need before preparing any room.
 */
export function evaluateCompanionNeedsIntelligence(
  input: CompanionNeedsInput = {},
): CompanionNeedsIntelligence {
  if (input.explicitNeed) {
    const def = needDefinition(input.explicitNeed);
    const { placeId, likelyPlaceIds } = resolvePlaceId(input.explicitNeed, input);
    const ranked = rankScores(emptyScores());
    ranked[0] = {
      needId: input.explicitNeed,
      score: 10,
      reasons: ["explicit need"],
    };
    const executiveFunction = assessExecutiveFunction(
      input,
      input.explicitNeed,
      ranked,
    );
    const adhdDesignFilter = evaluateAdhdDesignFilter({
      needId: input.explicitNeed,
      placeId,
      executiveFunction,
    });

    return {
      primaryNeed: input.explicitNeed,
      secondaryNeed: null,
      confidence: "high",
      scores: ranked,
      executiveFunction,
      recommendedPlaceId: placeId,
      likelyPlaceIds,
      restorationPromise: def.restorationPromise,
      restorationOutcome: def.restorationOutcome,
      rewardFraming: def.rewardFraming,
      preparationGuidance: [...def.preparationMoves],
      adhdDesignFilter,
      summary: buildSummary(input.explicitNeed, placeId, "high", executiveFunction),
    };
  }

  const scores = emptyScores();

  if (input.text) scoreFromText(scores, input.text);
  if (input.emotionalState) scoreFromEmotion(scores, input.emotionalState);
  if (input.userIntent) scoreFromIntent(scores, input.userIntent);
  if (input.cognitiveLoadLevel) scoreFromLoad(scores, input.cognitiveLoadLevel);
  scoreFromContextFlags(scores, input);

  const ranked = rankScores(scores);
  let primaryNeed = ranked[0]!.needId;
  if (ranked[0]!.score === 0) {
    primaryNeed = input.lowEnergy || input.recoveryGentle ? "restoration" : "clarity";
    addScore(scores, primaryNeed, 1, "default when signals are quiet");
  }

  const confidence = resolveConfidence(rankScores(scores));
  const secondaryNeed =
    ranked[1] && ranked[1].score > 0 && ranked[0]!.score - ranked[1].score <= 1
      ? ranked[1].needId
      : null;

  const def = needDefinition(primaryNeed);
  const executiveFunction = assessExecutiveFunction(input, primaryNeed, ranked);
  const { placeId, likelyPlaceIds } = resolvePlaceId(primaryNeed, input);
  const adhdDesignFilter = evaluateAdhdDesignFilter({
    needId: primaryNeed,
    placeId,
    executiveFunction,
  });

  return {
    primaryNeed,
    secondaryNeed,
    confidence,
    scores: rankScores(scores),
    executiveFunction,
    recommendedPlaceId: placeId,
    likelyPlaceIds,
    restorationPromise: def.restorationPromise,
    restorationOutcome: def.restorationOutcome,
    rewardFraming: def.rewardFraming,
    preparationGuidance: [...def.preparationMoves],
    adhdDesignFilter,
    summary: buildSummary(primaryNeed, placeId, confidence, executiveFunction),
  };
}

/** Map a need to its catalog entry — for UI and orchestration layers. */
export function companionNeedById(id: CompanionNeedId) {
  return COMPANION_NEEDS_CATALOG[id];
}

export const COMPANION_NEEDS_FLOW = [
  "User",
  "Current Context",
  "Needs Intelligence™",
  "Room Selection",
  "Hospitality Preparation",
  "Atmosphere Engine™",
  "Presence Engine™",
  "Conversation",
  "Workspace",
] as const;

/** Final principle questions — every experience should answer these before rendering. */
export const COMPANION_EXPERIENCE_PRINCIPLES = [
  "Who is here?",
  "How are they arriving?",
  "What do they need most right now?",
  "How would Shari naturally prepare this room for today's guest?",
  "What one thing should be better when they leave?",
] as const;
