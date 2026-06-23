/**
 * ADHD Native Companion Intelligence — cognitive operating system layer.
 * Thinks like lived ADHD entrepreneurship: friction-first, root-cause before advice.
 */

import type { DiscoveryPhase, ChatTurn } from "./companionIntelligence";
import type { AppSection } from "./companionUi";
import type { EmotionalObstacle, EmotionalState } from "./companionEmotions";
import {
  hasClearEmotionalSignal,
  isOrdinaryTaskLanguage,
} from "./messageClassification";
import {
  analyzeMultiTurnPatterns,
  mergeMultiTurnIntoSinglePattern,
  multiTurnHintForChat,
  shouldDeferRoutingForMultiTurn,
  type MultiTurnPatternAnalysis,
} from "./adhdMultiTurnPatterns";

export type FrictionType =
  | "unclear_goal"
  | "too_many_choices"
  | "missing_information"
  | "emotional_resistance"
  | "fear"
  | "overwhelm"
  | "complexity"
  | "energy_depletion"
  | "perfectionism"
  | "lack_of_confidence"
  | "decision_fatigue"
  | "task_too_large";

export type AdhdThinkingPattern =
  | "idea_explosion"
  | "planning_addiction"
  | "perfectionism_as_preparation"
  | "overwhelm_from_volume"
  | "avoidance_as_productivity";

export type CognitiveProtectionMode =
  | "momentum"
  | "overwhelm"
  | "emotional"
  | "neutral";

export type IntelligenceHierarchyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type AdhdNativeAnalysis = {
  frictions: FrictionType[];
  primaryFriction: FrictionType | null;
  thinkingPattern: AdhdThinkingPattern | null;
  protectionMode: CognitiveProtectionMode;
  statedProblem: string;
  possibleRootCauses: string[];
  hierarchyLevel: IntelligenceHierarchyLevel;
  earnedFeatureRouting: boolean;
  /** Sprint 3 — patterns emerging across recent turns. */
  multiTurn?: MultiTurnPatternAnalysis | null;
};

export type AnalyzeAdhdNativeInput = {
  text: string;
  messages?: ChatTurn[];
  emotionalState: EmotionalState;
  obstacle: EmotionalObstacle | null;
  discoveryPhase?: DiscoveryPhase;
  shouldDeferTools?: boolean;
  hasEcosystemFeatureMatch?: boolean;
};

const FRICTION_RULES: { type: FrictionType; re: RegExp }[] = [
  {
    type: "overwhelm",
    re: /\b(?:overwhelm|too much|so much|everything at once|can'?t handle|mental clutter|head is full|drowning)\b/i,
  },
  {
    type: "decision_fatigue",
    re: /\b(?:can'?t decide|decision fatigue|too many options|stuck between|which one should|don'?t know which)\b/i,
  },
  {
    type: "too_many_choices",
    re: /\b(?:too many (?:ideas|projects|tasks|priorities|things)|so many (?:ideas|options|projects))\b/i,
  },
  {
    type: "unclear_goal",
    re: /\b(?:don'?t know what i want|not sure what i'?m trying|unclear what|no clear goal|what am i even)\b/i,
  },
  {
    type: "missing_information",
    re: /\b(?:don'?t know how|not sure how|need to figure out|don'?t understand|what should i know)\b/i,
  },
  {
    type: "emotional_resistance",
    re: /\b(?:can'?t make myself|avoiding|putting off|don'?t want to|body won'?t|freezing up)\b/i,
  },
  {
    type: "fear",
    re: /\b(?:scared|afraid|terrified|what if (?:they|it)|fear of|failing|rejection)\b/i,
  },
  {
    type: "perfectionism",
    re: /\b(?:not good enough|has to be perfect|perfect first|not ready yet|one more tweak)\b/i,
  },
  {
    type: "lack_of_confidence",
    re: /\b(?:imposter|impostor|fraud|not qualified|who am i to|nobody will)\b/i,
  },
  {
    type: "energy_depletion",
    re: /\b(?:exhausted|drained|no energy|burned out|burnt out|can'?t focus|brain fog)\b/i,
  },
  {
    type: "task_too_large",
    re: /\b(?:too big|overwhelming task|massive project|huge undertaking|don'?t know where to start)\b/i,
  },
  {
    type: "complexity",
    re: /\b(?:too complicated|overcomplicated|so many moving parts|all the pieces)\b/i,
  },
];

const PATTERN_RULES: {
  pattern: AdhdThinkingPattern;
  re: RegExp;
  realProblem: string;
  rootCauses: string[];
}[] = [
  {
    pattern: "idea_explosion",
    re: /\b(?:so many ideas|tons of ideas|too many ideas|idea after idea|20 ideas|ideas everywhere|keep having ideas)\b/i,
    realProblem: "prioritization — not lack of ideas",
    rootCauses: ["no filter for what matters now", "fear of choosing wrong"],
  },
  {
    pattern: "planning_addiction",
    re: /\b(?:keep planning|another plan|always planning|planning but not|never start(?:ing)?|stuck planning|planning instead)\b/i,
    realProblem: "execution — not lack of plans",
    rootCauses: ["starting friction", "fear of imperfect action"],
  },
  {
    pattern: "perfectionism_as_preparation",
    re: /\b(?:need more research|one more course|researching instead|learning instead of|preparing forever|not ready to launch|just researching)\b/i,
    realProblem: "fear — not lack of information",
    rootCauses: ["fear of exposure", "fear of judgment"],
  },
  {
    pattern: "overwhelm_from_volume",
    re: /\b(?:50 tasks|so many tasks|everything unfinished|unfinished projects|pile of tasks|never finishing|too much on my plate)\b/i,
    realProblem: "cognitive load — not task management alone",
    rootCauses: ["working memory overload", "no visible priority"],
  },
  {
    pattern: "avoidance_as_productivity",
    re: /\b(?:organizing (?:files|folders)|cleaning (?:my )?desk|rearranging|color.?coding|fixing my website instead|busy work|low.?value tasks)\b/i,
    realProblem: "emotional resistance to the scary task",
    rootCauses: ["avoidance loop", "dopamine from easy wins"],
  },
];

const SURFACE_TO_ROOT: { surface: RegExp; roots: string[] }[] = [
  {
    surface: /\b(?:marketing plan|content calendar|social strategy)\b/i,
    roots: [
      "unclear offer",
      "unclear audience",
      "low confidence",
      "weak positioning",
      "no consistency habit",
      "no time or focus",
    ],
  },
  {
    surface: /\b(?:need (?:a )?website|redesign (?:my )?site|fix my branding)\b/i,
    roots: [
      "unclear positioning",
      "avoiding sales conversations",
      "perfectionism",
      "no offer clarity",
    ],
  },
  {
    surface: /\b(?:pricing|what to charge|raise (?:my )?rates)\b/i,
    roots: [
      "self-worth doubt",
      "unclear value proposition",
      "fear of rejection",
      "comparison to others",
    ],
  },
];

const MOMENTUM_RE =
  /\b(?:just finished|made progress|finally got|knocked out|got it done|moving forward|in the flow|on a roll|momentum|making headway|completed|shipped|published|sent it)\b/i;

const SELF_CRITICISM_RE =
  /\b(?:i always|i never|what'?s wrong with me|i'?m so lazy|i'?m useless|i suck at|why can'?t i|i should have|i failed again|pathetic|stupid)\b/i;

function detectFrictions(text: string): FrictionType[] {
  const found: FrictionType[] = [];
  for (const { type, re } of FRICTION_RULES) {
    if (re.test(text)) found.push(type);
  }
  return found;
}

function detectThinkingPattern(text: string): {
  pattern: AdhdThinkingPattern;
  rootCauses: string[];
  realProblem: string;
} | null {
  for (const rule of PATTERN_RULES) {
    if (rule.re.test(text)) {
      return {
        pattern: rule.pattern,
        rootCauses: rule.rootCauses,
        realProblem: rule.realProblem,
      };
    }
  }
  return null;
}

function detectRootCauses(text: string): string[] {
  for (const { surface, roots } of SURFACE_TO_ROOT) {
    if (surface.test(text)) return roots;
  }
  return [];
}

function inferProtectionMode(
  input: AnalyzeAdhdNativeInput,
  frictions: FrictionType[],
): CognitiveProtectionMode {
  const t = input.text.trim();
  if (
    input.emotionalState === "emotional" ||
    input.obstacle === "shame" ||
    input.obstacle === "grief" ||
    SELF_CRITICISM_RE.test(t)
  ) {
    return "emotional";
  }
  if (
    input.emotionalState === "overwhelmed" ||
    frictions.includes("overwhelm") ||
    /\boverwhelm/i.test(t)
  ) {
    return "overwhelm";
  }
  if (
    input.emotionalState === "focused" ||
    input.emotionalState === "building" ||
    MOMENTUM_RE.test(t)
  ) {
    return "momentum";
  }
  return "neutral";
}

function inferHierarchyLevel(input: {
  frictions: FrictionType[];
  pattern: AdhdThinkingPattern | null;
  rootCauses: string[];
  discoveryPhase: DiscoveryPhase;
  hasEcosystemFeatureMatch: boolean;
}): IntelligenceHierarchyLevel {
  if (input.discoveryPhase === "issue" || input.discoveryPhase === "factors") {
    return 2;
  }
  if (input.pattern || input.rootCauses.length > 0) return 3;
  if (input.hasEcosystemFeatureMatch) return 4;
  if (input.frictions.length > 0) return 3;
  return 1;
}

export function hasEarnedFeatureRouting(
  analysis: AdhdNativeAnalysis,
  shouldDeferTools: boolean,
): boolean {
  if (shouldDeferTools) return false;
  if (analysis.protectionMode === "momentum") return false;
  if (analysis.protectionMode === "emotional" && analysis.hierarchyLevel < 3) {
    return false;
  }
  return analysis.earnedFeatureRouting;
}

export function analyzeAdhdNativeTurn(
  input: AnalyzeAdhdNativeInput,
): AdhdNativeAnalysis {
  const t = input.text.trim();
  const frictions = detectFrictions(t);
  const patternHit = detectThinkingPattern(t);
  const rootCauses = [
    ...detectRootCauses(t),
    ...(patternHit?.rootCauses ?? []),
  ];
  const discoveryPhase = input.discoveryPhase ?? "none";
  const hasEcosystemFeatureMatch = input.hasEcosystemFeatureMatch ?? false;

  const protectionMode = inferProtectionMode(input, frictions);

  const hierarchyLevel = inferHierarchyLevel({
    frictions,
    pattern: patternHit?.pattern ?? null,
    rootCauses,
    discoveryPhase,
    hasEcosystemFeatureMatch,
  });

  const earnedFeatureRouting =
    !input.shouldDeferTools &&
    hasEcosystemFeatureMatch &&
    protectionMode !== "momentum" &&
    discoveryPhase !== "issue" &&
    discoveryPhase !== "factors" &&
    !(protectionMode === "emotional" && discoveryPhase === "advisor");

  const multiTurn =
    input.messages && input.messages.length > 1
      ? analyzeMultiTurnPatterns({ messages: input.messages })
      : null;

  const mergedPattern = mergeMultiTurnIntoSinglePattern(
    patternHit?.pattern ?? null,
    multiTurn,
  );

  const multiTurnBlocksRouting =
    multiTurn?.primary?.routing.stayInConversation &&
    multiTurn.primary.confidence !== "low";

  return {
    frictions,
    primaryFriction: frictions[0] ?? null,
    thinkingPattern: mergedPattern,
    protectionMode,
    statedProblem: t.slice(0, 160),
    possibleRootCauses: [...new Set(rootCauses)].slice(0, 6),
    hierarchyLevel,
    earnedFeatureRouting:
      earnedFeatureRouting && !multiTurnBlocksRouting,
    multiTurn,
  };
}

const PATTERN_GUIDANCE: Record<AdhdThinkingPattern, string> = {
  idea_explosion:
    "Idea explosion: problem is prioritization, not lack of ideas. Help them choose ONE — do not brainstorm more.",
  planning_addiction:
    "Planning addiction: problem is execution, not planning. Name the loop gently; find the smallest start.",
  perfectionism_as_preparation:
    "Perfectionism disguised as preparation: problem is fear, not missing info. Do not suggest more research.",
  overwhelm_from_volume:
    "Overwhelm from volume: problem is cognitive load. Reduce visible pile before optimizing systems.",
  avoidance_as_productivity:
    "Avoidance disguised as productivity: name the scary task they're circling — with zero shame.",
};

const PROTECTION_GUIDANCE: Record<CognitiveProtectionMode, string> = {
  momentum:
    "MOMENTUM PROTECTION: User has movement — protect it. No big planning, no extra questions. Focus on progress, execution, completion.",
  overwhelm:
    "OVERWHELM PROTECTION: Reduce choices, complexity, and information. Increase clarity, simplicity, reassurance, structure. One thing.",
  emotional:
    "EMOTIONAL AWARENESS: Watch for shame, guilt, self-criticism. Never reinforce negative self-talk. No lectures. No judgment.",
  neutral:
    "Assume friction, not laziness or lack of intelligence. Remove friction before adding advice.",
};

/** Injected into companion-chat — silent reasoning + response shaping. */
export function adhdNativeHintForChat(analysis: AdhdNativeAnalysis): string {
  const parts: string[] = [
    "ADHD NATIVE INTELLIGENCE (cognitive OS — mandatory):",
    "Think like someone who has lived ADHD entrepreneurship for decades — real friction, not stereotypes.",
    "Mission: help them think clearly, feel better, stay on track, decide, reduce overwhelm, finish meaningful work.",
    "Respond to FRICTION, not just words. Investigate root cause before advice.",
    PROTECTION_GUIDANCE[analysis.protectionMode],
  ];

  if (analysis.primaryFriction) {
    parts.push(
      `Primary friction: ${analysis.primaryFriction.replace(/_/g, " ")}.`,
    );
  }

  if (analysis.thinkingPattern) {
    parts.push(PATTERN_GUIDANCE[analysis.thinkingPattern]);
  }

  if (analysis.possibleRootCauses.length) {
    parts.push(
      `Surface request may hide: ${analysis.possibleRootCauses.join("; ")}. Investigate with ONE question before solving.`,
    );
  }

  const multiHint = analysis.multiTurn
    ? multiTurnHintForChat(analysis.multiTurn)
    : undefined;
  if (multiHint) parts.push(multiHint);

  parts.push(
    `Intelligence hierarchy level ${analysis.hierarchyLevel}/6 — conversation first, earn routing before features.`,
    analysis.earnedFeatureRouting
      ? "Feature routing earned — permission-first only, then seamless continuation."
      : "Feature routing NOT earned — stay in conversation; clarify or explore first.",
    "FORBIDDEN: laziness framing, intelligence assumptions, clinical labels, hustle pressure.",
    "SUCCESS = clearer, less overwhelmed, decided, started, continued, finished — not questions answered.",
  );

  return parts.join("\n");
}

/** Skip ecosystem auto-offer when conversation must come first. */
export function shouldDeferEcosystemRouting(
  analysis: AdhdNativeAnalysis,
  shouldDeferTools: boolean,
  section?: AppSection,
): boolean {
  if (shouldDeferTools) return true;
  if (!analysis.earnedFeatureRouting) return true;
  if (analysis.multiTurn?.primary) {
    if (section === "brain-dump" && shouldDeferRoutingForMultiTurn(analysis.multiTurn, "brain_dump")) {
      return true;
    }
    if (
      section === "decision-compass" &&
      shouldDeferRoutingForMultiTurn(analysis.multiTurn, "decision_compass")
    ) {
      return true;
    }
    if (
      (section === "plan-my-day" || section === "energy") &&
      shouldDeferRoutingForMultiTurn(analysis.multiTurn, "planning")
    ) {
      return true;
    }
    if (
      section === "content-generator" &&
      shouldDeferRoutingForMultiTurn(analysis.multiTurn, "ideas")
    ) {
      return true;
    }
  }
  return false;
}

/** Lightweight check — ordinary task language is not emotional overwhelm. */
export function isAdhdPracticalFriction(text: string): boolean {
  return isOrdinaryTaskLanguage(text) && !hasClearEmotionalSignal(text);
}
