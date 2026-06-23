/**
 * Sprint 7 — Action Bias™, Momentum Protection™, Anti-Overanalysis System.
 * Companion Intelligence optimizes for forward movement, not analysis.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { EmotionalState } from "./companionEmotions";
import type { AdhdNativeAnalysis } from "./adhdNativeIntelligence";
import type { MultiTurnPatternAnalysis } from "./adhdMultiTurnPatterns";
import { tallyThreadSignals } from "./adhdMultiTurnPatterns";

export type InvestigationPhase =
  | "understand"
  | "decide"
  | "move"
  | "over_investigating";

export type ActionEndTarget =
  | "decision"
  | "next_step"
  | "continue_execution"
  | "one_clarification";

export type ActionBiasAnalysis = {
  assistantQuestionCount: number;
  investigationPhase: InvestigationPhase;
  momentumActive: boolean;
  hyperfocusActive: boolean;
  reasonableConfidenceReached: boolean;
  maxQuestionsReached: boolean;
  overanalysisRisk: boolean;
  decisionAcceleration: boolean;
  recommendedEnd: ActionEndTarget;
};

export type AnalyzeActionBiasInput = {
  messages: ChatTurn[];
  userText: string;
  emotionalState: EmotionalState;
  adhdNative?: AdhdNativeAnalysis | null;
  multiTurn?: MultiTurnPatternAnalysis | null;
  /** Recent assistant turns to scan (default 14). */
  questionWindow?: number;
};

const MAX_QUESTIONS_SOFT = 3;
const MAX_QUESTIONS_HARD = 5;

const DECISION_RE =
  /\b(?:can'?t decide|stuck between|which (?:one|offer)|offer a or|should i choose|help me decide|decision)\b/i;

const EXECUTION_RE =
  /\b(?:just (?:wrote|finished|built|sent)|on a roll|in the flow|making progress|got it done|don'?t interrupt|keep going)\b/i;

const OVERANALYSIS_USER_RE =
  /\b(?:need more research|not sure yet|still thinking|keep analyzing|what if|another angle|more information)\b/i;

export function countAssistantQuestions(
  messages: ChatTurn[],
  window = 14,
): number {
  return messages
    .filter((m) => m.role === "assistant")
    .slice(-window)
    .filter((m) => /\?/.test(m.content.trim())).length;
}

function recentUserSubstance(messages: ChatTurn[], minChars = 38): boolean {
  const users = messages.filter((m) => m.role === "user").slice(-3);
  return users.some((m) => m.content.trim().length >= minChars);
}

function inferInvestigationPhase(input: {
  questionCount: number;
  reasonableConfidence: boolean;
  momentum: boolean;
  overanalysis: boolean;
}): InvestigationPhase {
  if (input.overanalysis || input.questionCount >= MAX_QUESTIONS_HARD) {
    return "over_investigating";
  }
  if (input.momentum || input.reasonableConfidence) return "move";
  if (input.questionCount >= 2) return "decide";
  return "understand";
}

function inferRecommendedEnd(input: {
  momentum: boolean;
  hyperfocus: boolean;
  decisionAcceleration: boolean;
  reasonableConfidence: boolean;
  overanalysis: boolean;
  questionCount: number;
  ideaExplosion: boolean;
  decisionTopic: boolean;
  overwhelmMode: boolean;
  recoveryMode: boolean;
}): ActionEndTarget {
  if (input.hyperfocus || input.momentum) return "continue_execution";
  if (input.decisionAcceleration || input.overanalysis) return "decision";
  if ((input.decisionTopic || input.ideaExplosion) && input.questionCount >= 1) {
    return "decision";
  }
  if (input.overwhelmMode || input.recoveryMode) return "next_step";
  if (input.questionCount >= 1 || input.reasonableConfidence) return "next_step";
  return "one_clarification";
}

export function analyzeActionBias(input: AnalyzeActionBiasInput): ActionBiasAnalysis {
  const window = input.questionWindow ?? 14;
  const questionCount = countAssistantQuestions(input.messages, window);
  const t = input.userText.trim();

  const momentumActive =
    input.adhdNative?.protectionMode === "momentum" ||
    EXECUTION_RE.test(t) ||
    input.emotionalState === "focused";

  const hyperfocusActive =
    momentumActive &&
    (input.emotionalState === "focused" ||
      input.emotionalState === "building" ||
      EXECUTION_RE.test(t));

  const planningLoop =
    input.multiTurn?.primary?.pattern === "planning_addiction" ||
    input.multiTurn?.primary?.pattern === "perfectionism_as_preparation" ||
    (tallyThreadSignals(
      input.messages.filter((m) => m.role === "user").map((m) => m.content),
    ).planning_language ?? 0) >= 2;

  const overanalysisRisk =
    questionCount >= MAX_QUESTIONS_SOFT &&
    (planningLoop ||
      OVERANALYSIS_USER_RE.test(t) ||
      input.multiTurn?.primary?.pattern === "idea_explosion");

  const decisionTopic = DECISION_RE.test(t) || Boolean(input.adhdNative?.frictions.includes("decision_fatigue"));
  const overwhelmMode =
    input.emotionalState === "overwhelmed" ||
    input.multiTurn?.primary?.pattern === "overwhelm_from_volume" ||
    input.adhdNative?.primaryFriction === "overwhelm";
  const recoveryMode =
    input.emotionalState === "emotional" ||
    input.emotionalState === "overwhelmed" ||
    /\b(?:hard to get back|feel bad i stopped|crashed and didn'?t)\b/i.test(t);

  const reasonableConfidenceReached = Boolean(
    questionCount >= 2 &&
      (recentUserSubstance(input.messages) ||
        Boolean(input.adhdNative?.thinkingPattern) ||
        Boolean(input.multiTurn?.primary) ||
        (input.adhdNative?.possibleRootCauses.length ?? 0) > 0),
  );

  const decisionAcceleration =
    decisionTopic && questionCount >= 2 && reasonableConfidenceReached;

  const maxQuestionsReached = questionCount >= MAX_QUESTIONS_HARD;

  const investigationPhase = inferInvestigationPhase({
    questionCount,
    reasonableConfidence: reasonableConfidenceReached,
    momentum: momentumActive,
    overanalysis: overanalysisRisk || maxQuestionsReached,
  });

  return {
    assistantQuestionCount: questionCount,
    investigationPhase,
    momentumActive,
    hyperfocusActive,
    reasonableConfidenceReached,
    maxQuestionsReached,
    overanalysisRisk,
    decisionAcceleration,
    recommendedEnd: inferRecommendedEnd({
      momentum: momentumActive,
      hyperfocus: hyperfocusActive,
      decisionAcceleration,
      reasonableConfidence: reasonableConfidenceReached,
      overanalysis: overanalysisRisk,
      questionCount,
      ideaExplosion:
        input.multiTurn?.primary?.pattern === "idea_explosion" ||
        input.adhdNative?.thinkingPattern === "idea_explosion",
      decisionTopic,
      overwhelmMode,
      recoveryMode,
    }),
  };
}

export function shouldDeferRoutingForActionBias(
  analysis: ActionBiasAnalysis,
): boolean {
  return (
    analysis.hyperfocusActive ||
    analysis.momentumActive ||
    analysis.investigationPhase === "over_investigating"
  );
}

export function shouldSuppressDiscoveryQuestions(
  analysis: ActionBiasAnalysis,
): boolean {
  return (
    analysis.maxQuestionsReached ||
    analysis.overanalysisRisk ||
    analysis.hyperfocusActive ||
    analysis.decisionAcceleration ||
    analysis.recommendedEnd === "decision"
  );
}

/** Injected into companion-chat — progress over analysis. */
export function actionBiasHintForChat(analysis: ActionBiasAnalysis): string {
  const parts: string[] = [
    "ACTION BIAS™ & ANTI-OVERANALYSIS (Sprint 7 — mandatory):",
    "Purpose is PROGRESS — not analysis. Analysis must earn its keep.",
    "Before ANY question ask: Will this help us move forward? If no — do not ask.",
    "Investigate → Decide → Move. NEVER Investigate → Investigate → Investigate.",
    "Maximum clarification: 0–3 questions typical; rarely 4–5; almost never more than 5.",
    "OUTCOME OVER INSIGHT: prefer a meaningful next step over a brilliant insight.",
    "Every meaningful turn should end with: a decision, next step, completed action, feature transition, or plan to continue — NOT more confusion.",
    "ANTI-THERAPY: understand enough, help effectively, move forward — do not endlessly analyze emotions.",
    "After responding, evaluate: Did this help the user move forward? (Not: was the analysis impressive?)",
  ];

  if (analysis.momentumActive) {
    parts.push(
      "MOMENTUM PROTECTION™: Movement detected — protect flow. No long explanations, deep analysis, complex frameworks, extra planning, or unnecessary questions. Reduce friction; support execution.",
    );
  }

  if (analysis.hyperfocusActive) {
    parts.push(
      "HYPERFOCUS PROTECTION™: User is building/creating — do NOT interrupt, redirect, overcoach, or force tool routing. Support what is working.",
    );
  }

  if (analysis.assistantQuestionCount >= MAX_QUESTIONS_SOFT) {
    parts.push(
      `Investigation count this thread: ${analysis.assistantQuestionCount} assistant questions — seek minimum information only.`,
    );
  }

  if (analysis.reasonableConfidenceReached) {
    parts.push(
      "REASONABLE CONFIDENCE THRESHOLD™ reached — stop digging. Move toward clarity, decision, action, or completion.",
      "You likely know enough to help. Stop investigating. Start helping.",
    );
  }

  if (analysis.decisionAcceleration) {
    parts.push(
      "DECISION ACCELERATION™: Enough information exists — help decide now.",
      'You may say: "We have enough to move forward" or "At this point deciding is more valuable than more research."',
    );
  }

  if (analysis.investigationPhase === "over_investigating" || analysis.maxQuestionsReached) {
    parts.push(
      "ADHD OVERANALYSIS PROTECTION™: Investigation is becoming avoidance.",
      "Do NOT ask another exploratory question. Offer ONE concrete next step or decision.",
      "ONE USEFUL QUESTION RULE™ suspended — proceed to action.",
    );
  } else if (analysis.recommendedEnd === "one_clarification") {
    parts.push(
      "ONE USEFUL QUESTION RULE™: If you must ask, ask the single question that most improves ability to move forward — then proceed.",
    );
  }

  switch (analysis.recommendedEnd) {
    case "decision":
      parts.push("End this turn by helping the user DECIDE — not gather more input.");
      break;
    case "next_step":
      parts.push("End this turn with ONE clear next step the user can take now.");
      break;
    case "continue_execution":
      parts.push("End this turn by supporting continued execution — minimal words.");
      break;
    case "one_clarification":
      break;
  }

  parts.push(
    "CONFIDENCE THROUGH PROGRESS™: small wins and completion build confidence — not cheerleading.",
  );

  return parts.join("\n");
}

/** Override discovery-mode hints when investigation should stop. */
export function discoveryOverrideForActionBias(
  analysis: ActionBiasAnalysis,
): string | undefined {
  if (!shouldSuppressDiscoveryQuestions(analysis)) return undefined;
  return [
    "DISCOVERY OVERRIDE (Sprint 7): Discovery questioning is complete or excessive.",
    "Do NOT ask another discovery/clarifying question.",
    "Move to decision, next step, or assisted action.",
  ].join(" ");
}
