/**
 * Sprint 3 — Multi-turn ADHD pattern detection.
 * Sits above single-turn analysis; notices friction emerging across conversation.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { AdhdThinkingPattern } from "./adhdNativeIntelligence";

export type MultiTurnAdhdPattern =
  | AdhdThinkingPattern
  | "confidence_collapse";

export type PatternConfidence = "high" | "medium" | "low";

export type ThreadSignalType =
  | "planning_language"
  | "research_language"
  | "uncertainty"
  | "self_criticism"
  | "overwhelm"
  | "idea_switching"
  | "avoidance_shift"
  | "more_options_request"
  | "restart_language"
  | "tool_seeking"
  | "not_ready"
  | "execution_signal";

export type MultiTurnResponseMode = "reflect" | "clarify" | "silent";

export type MultiTurnRoutingAdvice = {
  deferPlanningTools: boolean;
  blockMoreIdeas: boolean;
  deferBrainDump: boolean;
  deferDecisionCompass: boolean;
  stayInConversation: boolean;
};

export type MultiTurnPatternHit = {
  pattern: MultiTurnAdhdPattern;
  confidence: PatternConfidence;
  responseMode: MultiTurnResponseMode;
  signalCount: number;
  turnSpan: number;
  realProblem: string;
  companionMove: string;
  reflectionLine: string;
  routing: MultiTurnRoutingAdvice;
};

export type MultiTurnPatternAnalysis = {
  hits: MultiTurnPatternHit[];
  primary: MultiTurnPatternHit | null;
  signals: Partial<Record<ThreadSignalType, number>>;
  userTurnCount: number;
};

export type AnalyzeMultiTurnInput = {
  messages: ChatTurn[];
  /** Max recent user turns to scan (default 8). */
  maxUserTurns?: number;
};

const DEFAULT_MAX_USER_TURNS = 8;

const SIGNAL_RULES: { signal: ThreadSignalType; re: RegExp; weight?: number }[] = [
  {
    signal: "planning_language",
    re: /\b(?:plan (?:this|it) better|outline(?:\s+it)?(?:\s+better)?(?:\s+first)?|organize (?:it|more)|need a (?:better )?system|make a checklist|map (?:this )?out|structure (?:this|it) first|need to plan|should outline|organize more)\b/i,
  },
  {
    signal: "research_language",
    re: /\b(?:research more|one more example|look into|read more|find more info|another course|need more research|should research|gather more)\b/i,
  },
  {
    signal: "not_ready",
    re: /\b(?:not ready|isn'?t ready|don'?t think it'?s ready|not good enough yet|one more tweak|rewrite it|redo the outline|sound wrong)\b/i,
  },
  {
    signal: "uncertainty",
    re: /\b(?:not sure|don'?t know if|maybe i should|probably should|i guess|what if|might need to)\b/i,
  },
  {
    signal: "self_criticism",
    re: /\b(?:i always mess|i'?m not good at|i suck at|nobody will|this is stupid|why did i think|why i thought|thought i could|i always fail|what'?s wrong with me|i'?m useless)\b/i,
  },
  {
    signal: "overwhelm",
    re: /\b(?:too much|so much|everything|scattered|full head|can'?t keep up|pile of|all over the place|so many things)\b/i,
  },
  {
    signal: "idea_switching",
    re: /\b(?:what about|or maybe|another idea|different idea|switch to|instead i could|new offer|new product|also thought about)\b/i,
  },
  {
    signal: "avoidance_shift",
    re: /\b(?:organize (?:my )?files|clean(?:ing)? (?:my )?desk|rearrang|color.?cod|fix(?:ing)? (?:my )?website|update branding|sort folders|busy work)\b/i,
  },
  {
    signal: "more_options_request",
    re: /\b(?:more options|other ideas|what else could|give me more|any other ways|other approaches|more possibilities)\b/i,
  },
  {
    signal: "restart_language",
    re: /\b(?:start over|begin again|from scratch|redo everything|scrap (?:this|it)|throw (?:this|it) out)\b/i,
  },
  {
    signal: "tool_seeking",
    re: /\b(?:another tool|different tool|is there an app|need a better tool|which tool|what tool should)\b/i,
  },
  {
    signal: "execution_signal",
    re: /\b(?:just (?:did|finished|sent|posted|published|shipped)|got it done|made progress|on a roll|moving forward)\b/i,
    weight: -2,
  },
];

type PatternSpec = {
  pattern: MultiTurnAdhdPattern;
  requiredSignals: ThreadSignalType[];
  optionalSignals?: ThreadSignalType[];
  minSignalHits: number;
  minTurnSpan: number;
  realProblem: string;
  companionMove: string;
  reflectionLine: string;
  routing: MultiTurnRoutingAdvice;
};

const PATTERN_SPECS: PatternSpec[] = [
  {
    pattern: "planning_addiction",
    requiredSignals: ["planning_language"],
    optionalSignals: ["uncertainty", "tool_seeking", "not_ready"],
    minSignalHits: 2,
    minTurnSpan: 2,
    realProblem: "execution friction — not lack of plans",
    companionMove:
      "Do not create another plan. Help start the smallest meaningful action.",
    reflectionLine:
      "I may be wrong, but it looks like we keep circling around planning this instead of starting it. That usually means the next step feels too big or too risky. Let's make the first step almost ridiculously small.",
    routing: {
      deferPlanningTools: true,
      blockMoreIdeas: false,
      deferBrainDump: false,
      deferDecisionCompass: false,
      stayInConversation: true,
    },
  },
  {
    pattern: "perfectionism_as_preparation",
    requiredSignals: ["research_language", "not_ready"],
    optionalSignals: ["uncertainty", "restart_language"],
    minSignalHits: 2,
    minTurnSpan: 2,
    realProblem: "fear or confidence — not missing information",
    companionMove:
      'Gently name the pattern. Ask what "good enough to move forward" would look like. No more research.',
    reflectionLine:
      "I'm noticing we keep finding reasons it isn't ready yet — that often means the scary part is putting it out there, not that you need more prep. What would good enough to move forward look like?",
    routing: {
      deferPlanningTools: true,
      blockMoreIdeas: false,
      deferBrainDump: false,
      deferDecisionCompass: true,
      stayInConversation: true,
    },
  },
  {
    pattern: "idea_explosion",
    requiredSignals: ["idea_switching"],
    optionalSignals: ["more_options_request", "uncertainty"],
    minSignalHits: 2,
    minTurnSpan: 2,
    realProblem: "prioritization — not lack of ideas",
    companionMove: "Stop generating ideas. Help choose ONE.",
    reflectionLine:
      "We've surfaced a lot of directions — that usually means the hard part is choosing, not imagining. If you had to pick just one to move forward today, which pulls you most?",
    routing: {
      deferPlanningTools: false,
      blockMoreIdeas: true,
      deferBrainDump: false,
      deferDecisionCompass: true,
      stayInConversation: true,
    },
  },
  {
    pattern: "avoidance_as_productivity",
    requiredSignals: ["avoidance_shift"],
    optionalSignals: ["planning_language", "tool_seeking"],
    minSignalHits: 2,
    minTurnSpan: 2,
    realProblem: "emotional resistance to the exposed task",
    companionMove:
      "Name the pattern gently. Ask what part feels hardest or most exposed.",
    reflectionLine:
      "It looks like we might be doing safer tasks around the important one — that's really common when something feels exposed. What part of the main task feels hardest to touch?",
    routing: {
      deferPlanningTools: true,
      blockMoreIdeas: false,
      deferBrainDump: true,
      deferDecisionCompass: true,
      stayInConversation: true,
    },
  },
  {
    pattern: "overwhelm_from_volume",
    requiredSignals: ["overwhelm"],
    optionalSignals: ["uncertainty", "more_options_request", "idea_switching"],
    minSignalHits: 2,
    minTurnSpan: 2,
    realProblem: "cognitive load — not task management alone",
    companionMove:
      "Reduce choices. Do not add information. Clear My Mind only after confirming volume is the problem.",
    reflectionLine:
      "It sounds like the volume itself is the weight — not that you don't know what to do. Let's make the pile visible before we try to solve all of it.",
    routing: {
      deferPlanningTools: false,
      blockMoreIdeas: true,
      deferBrainDump: true,
      deferDecisionCompass: true,
      stayInConversation: true,
    },
  },
  {
    pattern: "confidence_collapse",
    requiredSignals: ["self_criticism"],
    optionalSignals: ["uncertainty", "not_ready"],
    minSignalHits: 2,
    minTurnSpan: 2,
    realProblem: "shame and self-trust breakdown",
    companionMove:
      "Do not argue or fake cheerlead. Ground in evidence, one stabilizing step, zero judgment.",
    reflectionLine:
      "That's a heavy voice — and it doesn't mean you're actually failing. What's one small piece of evidence that you're more capable than that voice says right now?",
    routing: {
      deferPlanningTools: true,
      blockMoreIdeas: true,
      deferBrainDump: true,
      deferDecisionCompass: true,
      stayInConversation: true,
    },
  },
];

function recentUserTurns(
  messages: ChatTurn[],
  max: number,
): { content: string; index: number }[] {
  const users = messages
    .map((m, index) => ({ ...m, index }))
    .filter((m) => m.role === "user");
  return users.slice(-max).map((m) => ({ content: m.content, index: m.index }));
}

export function tallyThreadSignals(
  userTexts: string[],
): Partial<Record<ThreadSignalType, number>> {
  const tally: Partial<Record<ThreadSignalType, number>> = {};
  for (const text of userTexts) {
    for (const { signal, re, weight } of SIGNAL_RULES) {
      if (!re.test(text)) continue;
      const w = weight ?? 1;
      if (w < 0) {
        tally[signal] = (tally[signal] ?? 0) + w;
        continue;
      }
      tally[signal] = (tally[signal] ?? 0) + 1;
    }
  }
  return tally;
}

function countSignalHits(
  tally: Partial<Record<ThreadSignalType, number>>,
  signals: ThreadSignalType[],
): number {
  return signals.reduce((sum, s) => sum + Math.max(0, tally[s] ?? 0), 0);
}

function turnsWithSignals(
  userTurns: { content: string; index: number }[],
  signals: ThreadSignalType[],
): number {
  let count = 0;
  for (const turn of userTurns) {
    for (const s of signals) {
      const rule = SIGNAL_RULES.find((r) => r.signal === s);
      if (rule?.re.test(turn.content)) {
        count++;
        break;
      }
    }
  }
  return count;
}

function scoreConfidence(input: {
  signalHits: number;
  turnSpan: number;
  minSignalHits: number;
  minTurnSpan: number;
  hasExecution: boolean;
}): PatternConfidence {
  if (input.hasExecution && input.signalHits < 4) return "low";
  if (
    input.signalHits >= input.minSignalHits + 1 &&
    input.turnSpan >= input.minTurnSpan
  ) {
    return "high";
  }
  if (
    input.signalHits >= input.minSignalHits &&
    input.turnSpan >= input.minTurnSpan
  ) {
    return "medium";
  }
  if (input.signalHits >= 1) return "low";
  return "low";
}

function responseModeForConfidence(
  confidence: PatternConfidence,
): MultiTurnResponseMode {
  if (confidence === "high") return "reflect";
  if (confidence === "medium") return "clarify";
  return "silent";
}

function evaluatePattern(
  spec: PatternSpec,
  tally: Partial<Record<ThreadSignalType, number>>,
  userTurns: { content: string; index: number }[],
): MultiTurnPatternHit | null {
  const allSignals = [
    ...spec.requiredSignals,
    ...(spec.optionalSignals ?? []),
  ];
  const requiredHits = countSignalHits(tally, spec.requiredSignals);
  if (requiredHits < 1) return null;

  const totalHits = countSignalHits(tally, allSignals);
  const turnSpan = turnsWithSignals(userTurns, allSignals);
  const executionPenalty = (tally.execution_signal ?? 0) < 0;

  if (totalHits < spec.minSignalHits || turnSpan < spec.minTurnSpan) {
    return null;
  }

  const confidence = scoreConfidence({
    signalHits: totalHits,
    turnSpan,
    minSignalHits: spec.minSignalHits,
    minTurnSpan: spec.minTurnSpan,
    hasExecution: executionPenalty,
  });

  if (confidence === "low") return null;

  return {
    pattern: spec.pattern,
    confidence,
    responseMode: responseModeForConfidence(confidence),
    signalCount: totalHits,
    turnSpan,
    realProblem: spec.realProblem,
    companionMove: spec.companionMove,
    reflectionLine: spec.reflectionLine,
    routing: spec.routing,
  };
}

/** Analyze recent conversation for emerging ADHD friction patterns. */
export function analyzeMultiTurnPatterns(
  input: AnalyzeMultiTurnInput,
): MultiTurnPatternAnalysis {
  const max = input.maxUserTurns ?? DEFAULT_MAX_USER_TURNS;
  const userTurns = recentUserTurns(input.messages, max);
  const userTexts = userTurns.map((t) => t.content);
  const signals = tallyThreadSignals(userTexts);

  const hits: MultiTurnPatternHit[] = [];
  for (const spec of PATTERN_SPECS) {
    const hit = evaluatePattern(spec, signals, userTurns);
    if (hit) hits.push(hit);
  }

  hits.sort((a, b) => {
    const confScore = { high: 3, medium: 2, low: 1 };
    const c = confScore[b.confidence] - confScore[a.confidence];
    if (c !== 0) return c;
    return b.signalCount - a.signalCount;
  });

  return {
    hits,
    primary: hits[0] ?? null,
    signals,
    userTurnCount: userTurns.length,
  };
}

export function multiTurnHintForChat(
  analysis: MultiTurnPatternAnalysis,
): string | undefined {
  const primary = analysis.primary;
  if (!primary) return undefined;

  const parts = [
    "MULTI-TURN PATTERN (Sprint 3 — mandatory when active):",
    `Emerging pattern: ${primary.pattern.replace(/_/g, " ")} (${primary.confidence} confidence across ${primary.turnSpan} turns).`,
    `Real problem: ${primary.realProblem}.`,
    primary.companionMove,
  ];

  if (primary.responseMode === "reflect") {
    parts.push(
      `You may reflect the pattern simply — e.g. "${primary.reflectionLine}"`,
      "Do not sound clinical. Do not diagnose. Do not shame. One concrete next move.",
    );
  } else if (primary.responseMode === "clarify") {
    parts.push(
      "Medium confidence — ask ONE gentle clarifying question before naming the pattern.",
    );
  }

  const r = primary.routing;
  const routingNotes: string[] = [];
  if (r.deferPlanningTools) {
    routingNotes.push("Do NOT route to planning tools — stay in conversation and help execute.");
  }
  if (r.blockMoreIdeas) {
    routingNotes.push("Do NOT brainstorm more ideas — help prioritize or choose one.");
  }
  if (r.deferBrainDump) {
    routingNotes.push("Clear My Mind only after confirming volume/overwhelm is the problem.");
  }
  if (r.deferDecisionCompass) {
    routingNotes.push("Decision Compass only after options are clear — not yet.");
  }
  if (r.stayInConversation) {
    routingNotes.push("Stay in conversation — routing is premature.");
  }
  if (routingNotes.length) parts.push(routingNotes.join(" "));

  return parts.join("\n");
}

/** Merge multi-turn routing advice into ecosystem deferral decisions. */
export function shouldDeferRoutingForMultiTurn(
  multiTurn: MultiTurnPatternAnalysis | null | undefined,
  target: "brain_dump" | "decision_compass" | "planning" | "ideas",
): boolean {
  const primary = multiTurn?.primary;
  if (!primary || primary.confidence === "low") return false;
  const r = primary.routing;
  switch (target) {
    case "brain_dump":
      return r.deferBrainDump;
    case "decision_compass":
      return r.deferDecisionCompass;
    case "planning":
      return r.deferPlanningTools;
    case "ideas":
      return r.blockMoreIdeas;
    default:
      return false;
  }
}

export function mergeMultiTurnIntoSinglePattern(
  singlePattern: AdhdThinkingPattern | null,
  multiTurn: MultiTurnPatternAnalysis | null | undefined,
): AdhdThinkingPattern | null {
  if (
    multiTurn?.primary &&
    multiTurn.primary.confidence !== "low" &&
    multiTurn.primary.pattern !== "confidence_collapse"
  ) {
    return multiTurn.primary.pattern as AdhdThinkingPattern;
  }
  return singlePattern;
}
