/**
 * Spark Response Intelligence Engine — orchestration.
 * Highest-priority pre-send pipeline (scaffold).
 * @see spark-intelligence-foundation/12-spark-response-intelligence-engine.md
 */

import { classifyInteraction } from "./classifyInteraction";
import { selectDisciplines } from "./disciplineRouting";
import type {
  ObjectiveLock,
  PreComposeAnalysis,
  ResponseDraft,
  SelfEvaluationResult,
  SendDecision,
  SparkResponseIntelligenceInput,
  SparkResponseIntelligenceResult,
} from "./types";
import {
  SPARK_CONSTITUTION_VERSION,
  SPARK_RESPONSE_INTELLIGENCE_VERSION,
} from "./types";

function createObjectiveLock(
  input: SparkResponseIntelligenceInput,
  desiredOutcome: string,
): ObjectiveLock {
  const existing = input.objectiveLock;
  if (existing && existing.status === "active") {
    return existing;
  }
  return {
    lockId: `lock-${input.threadId}-${input.turnId}`,
    threadId: input.threadId,
    primaryObjective: input.memberMessage.slice(0, 200),
    desiredOutcome,
    status: "active",
    lockedAt: new Date().toISOString(),
  };
}

function inferDesiredOutcome(message: string, interactionClass: string): string {
  const trimmed = message.trim();
  if (trimmed.length < 120) {
    return `Help the member succeed with: ${trimmed}`;
  }
  return `Help the member accomplish their goal related to: ${trimmed.slice(0, 100)}…`;
}

function needsClarification(
  message: string,
  interactionClass: string,
): { needed: boolean; question?: string; reason?: string } {
  const lower = message.toLowerCase();

  if (interactionClass === "emotional_support") {
    return {
      needed: true,
      question:
        "Is this more about venting, figuring out what to drop, or calling it a day without guilt?",
      reason: "Emotional objective ambiguous — Constitution Article I",
    };
  }

  if (
    /\b(marketing campaign|campaign)\b/.test(lower) &&
    !/\b(sell|audience|promot|offer|launch)\b/.test(lower)
  ) {
    return {
      needed: true,
      question:
        "What are you promoting, and what would make this campaign a win?",
      reason: "Campaign scope missing — Objective Engine Example B",
    };
  }

  if (message.trim().length < 8) {
    return {
      needed: true,
      question: "Tell me a bit more about what you're hoping to get done.",
      reason: "Insufficient context",
    };
  }

  return { needed: false };
}

function suggestEstate(
  interactionClass: string,
): PreComposeAnalysis["estateSuggestion"] {
  switch (interactionClass) {
    case "creative_work":
      return "creative-studio";
    case "business_strategy":
    case "decision_making":
    case "planning":
      return "strategy-room";
    case "research":
      return "research-lab";
    case "reflection":
      return "white-gazebo";
    default:
      return undefined;
  }
}

/**
 * Pre-compose analysis — answers 7 primary responsibility questions before drafting.
 */
export function analyzeBeforeCompose(
  input: SparkResponseIntelligenceInput,
): PreComposeAnalysis {
  const literalAsk = input.memberMessage.trim();
  const { interactionClass, memberNeed, responseDepth } =
    classifyInteraction(literalAsk);
  const desiredOutcome = inferDesiredOutcome(literalAsk, interactionClass);
  const objectiveLock = createObjectiveLock(input, desiredOutcome);
  const disciplines = selectDisciplines(interactionClass, literalAsk);
  const estateSuggestion = suggestEstate(interactionClass);
  const clarification = needsClarification(literalAsk, interactionClass);

  const readyToCompose = !clarification.needed;

  return {
    turnId: input.turnId,
    literalAsk,
    desiredOutcome,
    interactionClass,
    disciplines,
    estateSuggestion,
    memberNeed,
    readyToCompose,
    clarificationQuestion: clarification.question,
    clarificationReason: clarification.reason,
    responseDepth,
    objectiveLock,
    engineVersion: SPARK_RESPONSE_INTELLIGENCE_VERSION,
  };
}

const SOFTWARE_VOICE =
  /\b(error|failed|invalid|required|you must|processing|please wait)\b/i;

/**
 * Self-evaluation before send — internal QA gate.
 */
export function evaluateBeforeSend(
  draft: ResponseDraft,
  analysis: PreComposeAnalysis,
): SelfEvaluationResult {
  const text = draft.text.trim();
  const revisionHints: string[] = [];

  const answeredRealQuestion =
    text.length > 0 &&
    !text.toLowerCase().includes("as an ai") &&
    !SOFTWARE_VOICE.test(text);

  if (!answeredRealQuestion) {
    revisionHints.push("Remove software or generic AI voice");
  }

  const stayedOnObjective =
    analysis.interactionClass === "emotional_support"
      ? !/\b(marketing plan|financial analysis|campaign strategy)\b/i.test(text)
      : true;

  if (!stayedOnObjective) {
    revisionHints.push("Remove off-objective business advice during support mode");
  }

  const helpful = text.length >= 20;
  if (!helpful) {
    revisionHints.push("Response too thin to be useful");
  }

  const clear = !/\b(maybe|perhaps|it depends)\b/i.test(text) || text.length < 200;
  if (!clear && text.length > 400) {
    revisionHints.push("Simplify — reduce hedging or length");
  }

  const reducedOverwhelm =
    (text.match(/\n-/g) ?? []).length <= 5 && (text.match(/\?/g) ?? []).length <= 1;

  if (!reducedOverwhelm) {
    revisionHints.push("Reduce lists or multiple questions");
  }

  const soundedLikeSpark = !SOFTWARE_VOICE.test(text) && !/\boptimize your productivity\b/i.test(text);

  if (!soundedLikeSpark) {
    revisionHints.push("Rewrite to sound like Spark, not software");
  }

  const canImprove = revisionHints.length > 0;

  const pass =
    answeredRealQuestion &&
    stayedOnObjective &&
    helpful &&
    reducedOverwhelm &&
    soundedLikeSpark;

  return {
    answeredRealQuestion,
    stayedOnObjective,
    helpful,
    clear,
    reducedOverwhelm,
    soundedLikeSpark,
    canImprove,
    pass,
    revisionHints,
  };
}

/**
 * Evaluate draft and return send decision. Does not call LLM for revision in v1 scaffold.
 */
export function decideSend(
  draft: ResponseDraft,
  analysis: PreComposeAnalysis,
  revisionRound = 0,
): SendDecision {
  const evaluation = evaluateBeforeSend(draft, analysis);
  return {
    approved: evaluation.pass,
    evaluation,
    finalText: draft.text,
    revisionRound,
  };
}

/**
 * Full ingress: analyze → clarification path OR ready-to-compose path.
 * Pass draft for evaluated result.
 */
export function runSparkResponseIntelligence(
  input: SparkResponseIntelligenceInput,
  draft?: ResponseDraft,
): SparkResponseIntelligenceResult {
  void SPARK_CONSTITUTION_VERSION;

  const analysis = analyzeBeforeCompose(input);

  if (!analysis.readyToCompose && analysis.clarificationQuestion) {
    return {
      kind: "clarification",
      analysis,
      clarificationQuestion: analysis.clarificationQuestion,
    };
  }

  if (!draft) {
    return { kind: "ready_to_compose", analysis };
  }

  return {
    kind: "evaluated",
    analysis,
    send: decideSend(draft, analysis),
  };
}
