/**
 * Spark Cognitive Orchestration Engine — 8-step thinking pipeline.
 */

import { selectDisciplines } from "@/lib/sparkResponseIntelligence/disciplineRouting";
import type { ObjectiveLock } from "@/lib/sparkResponseIntelligence";
import { evaluateBeforeSend } from "@/lib/sparkResponseIntelligence/evaluateSparkResponseIntelligence";
import type { PreComposeAnalysis, ResponseDraft } from "@/lib/sparkResponseIntelligence/types";

import type {
  BusinessContext,
  CognitiveOrchestrationInput,
  CognitiveOrchestrationPlan,
  CognitiveOrchestrationResult,
  CognitiveSelfReview,
  ConfidenceLevel,
  EmotionalState,
  ResponseStructure,
  ThinkingMode,
} from "./types";
import { SPARK_COGNITIVE_ORCHESTRATION_VERSION } from "./types";

function inferRealObjective(message: string): { objective: string; outcome: string } {
  const trimmed = message.trim();
  const objective = trimmed.length > 160 ? `${trimmed.slice(0, 160)}…` : trimmed;
  return {
    objective,
    outcome: `Help the member accomplish: ${objective}`,
  };
}

function detectEmotionalState(message: string): EmotionalState {
  const lower = message.toLowerCase();
  if (/\b(overwhelmed|too much|can't handle)\b/.test(lower)) return "overwhelmed";
  if (/\b(urgent|asap|today|deadline|now)\b/.test(lower)) return "urgent";
  if (/\b(frustrated|annoyed|stuck|blocked)\b/.test(lower)) return "frustrated";
  if (/\b(confused|don't understand|unclear)\b/.test(lower)) return "confused";
  if (/\b(excited|can't wait|amazing)\b/.test(lower)) return "excited";
  if (/\b(curious|wondering|what if)\b/.test(lower)) return "curious";
  if (/\b(create|design|write|brainstorm)\b/.test(lower)) return "creative";
  if (/\b(strategy|position|long.?term|vision)\b/.test(lower)) return "strategic";
  if (/\b(reflect|journal|process|thinking about)\b/.test(lower)) return "reflective";
  return "calm";
}

function detectBusinessContext(message: string): BusinessContext[] {
  const lower = message.toLowerCase();
  const contexts: BusinessContext[] = [];

  const add = (c: BusinessContext) => {
    if (!contexts.includes(c)) contexts.push(c);
  };

  if (/\b(start|starting|new business|launch my business)\b/.test(lower))
    add("starting_business");
  if (/\b(grow|scaling|scale)\b/.test(lower)) add("growing_business");
  if (/\b(launch|product launch|go live)\b/.test(lower)) add("launching_product");
  if (/\b(marketing|campaign|audience|traffic)\b/.test(lower)) add("marketing");
  if (/\b(sales|sell|close|pipeline|client)\b/.test(lower)) add("sales");
  if (/\b(lead|team|hire|delegate|culture)\b/.test(lower)) add("leadership");
  if (/\b(price|pricing|prices|finance|cash|margin|profit)\b/.test(lower)) add("finance");
  if (/\b(research|competitor|market|verify)\b/.test(lower)) add("research");
  if (/\b(learn|teach|explain|how to)\b/.test(lower)) add("learning");
  if (/\b(focus|productive|procrastinat)\b/.test(lower)) add("personal_productivity");
  if (/\b(plan|roadmap|priorit)\b/.test(lower)) add("planning");
  if (/\b(do|finish|implement|execute|send)\b/.test(lower)) add("execution");

  if (contexts.length === 0) add("unknown");
  return contexts;
}

function selectThinkingMode(
  message: string,
  emotional: EmotionalState,
): ThinkingMode {
  const lower = message.toLowerCase();

  if (emotional === "overwhelmed") return "coaching";
  if (/\b(research|look up|find out|competitor)\b/.test(lower)) return "research";
  if (/\b(simulate|what if|scenario)\b/.test(lower)) return "simulation";
  if (/\b(board|executive|high.?stakes)\b/.test(lower)) return "executive_board";
  if (/\b(teach|explain|learn|how does)\b/.test(lower)) return "teaching";
  if (/\b(decide|should i|which option|thinking about raising|raising my price)\b/.test(lower))
    return "decision_support";
  if (/\b(plan|roadmap|quarter)\b/.test(lower)) return "planning";
  if (/\b(create|write|design|draft)\b/.test(lower)) return "creative_thinking";
  if (/\b(strategy|position|grow)\b/.test(lower)) return "strategic_thinking";
  if (emotional === "reflective") return "reflection";
  if (message.trim().length < 50 && !lower.includes("?")) return "quick_answer";
  return "coaching";
}

function evaluateConfidence(
  message: string,
  contexts: BusinessContext[],
): { level: ConfidenceLevel; note?: string } {
  if (message.trim().length < 12) {
    return { level: "low", note: "Insufficient member context" };
  }
  if (contexts.includes("unknown") && message.length < 80) {
    return {
      level: "medium",
      note: "Business context unclear — state assumptions",
    };
  }
  if (/\b(maybe|not sure|i think)\b/i.test(message)) {
    return { level: "medium", note: "Member expressed uncertainty" };
  }
  return { level: "high" };
}

function selectResponseStructure(
  thinkingMode: ThinkingMode,
  confidence: ConfidenceLevel,
): ResponseStructure {
  if (confidence === "low") return "clarification_question";

  switch (thinkingMode) {
    case "quick_answer":
      return "simple_answer";
    case "teaching":
      return "learning_lesson";
    case "strategic_thinking":
      return "strategic_framework";
    case "creative_thinking":
      return "creative_collaboration";
    case "research":
      return "research_summary";
    case "planning":
      return "action_plan";
    case "decision_support":
      return "executive_recommendation";
    case "simulation":
      return "simulation";
    case "reflection":
      return "reflection_exercise";
    case "executive_board":
      return "executive_recommendation";
    case "coaching":
      return "step_by_step_guide";
    default:
      return "simple_answer";
  }
}

function createLock(
  input: CognitiveOrchestrationInput,
  outcome: string,
): ObjectiveLock {
  if (input.objectiveLock?.status === "active") return input.objectiveLock;
  return {
    lockId: `lock-${input.threadId}-${input.turnId}`,
    threadId: input.threadId,
    primaryObjective: input.memberMessage.slice(0, 200),
    desiredOutcome: outcome,
    status: "active",
    lockedAt: new Date().toISOString(),
  };
}

function clarificationForPlan(
  message: string,
  emotional: EmotionalState,
  confidence: ConfidenceLevel,
): string | undefined {
  if (confidence === "low" && message.trim().length < 12) {
    return "What are you hoping to get done — in a sentence or two?";
  }
  if (emotional === "overwhelmed") {
    return "Is this more about venting, figuring out what to drop, or calling it a day without guilt?";
  }
  if (
    /\b(marketing campaign|campaign)\b/i.test(message) &&
    !/\b(offer|audience|promot|sell)\b/i.test(message)
  ) {
    return "What are you promoting, and what would make this campaign a win?";
  }
  return undefined;
}

/**
 * Run Steps 1–8 (authorize only). No text generation.
 */
export function orchestrateCognition(
  input: CognitiveOrchestrationInput,
): CognitiveOrchestrationPlan {
  const message = input.memberMessage.trim();
  const { objective, outcome } = inferRealObjective(message);
  const emotionalState = detectEmotionalState(message);
  const businessContext = detectBusinessContext(message);
  const thinkingMode = selectThinkingMode(message, emotionalState);
  const disciplines = selectDisciplines(
    mapThinkingToInteraction(thinkingMode, emotionalState),
    message,
  );
  const { level: confidence, note: confidenceNote } = evaluateConfidence(
    message,
    businessContext,
  );
  const responseStructure = selectResponseStructure(thinkingMode, confidence);
  const clarificationQuestion = clarificationForPlan(
    message,
    emotionalState,
    confidence,
  );

  const readyToGenerate =
    responseStructure !== "clarification_question" && !clarificationQuestion;

  return {
    turnId: input.turnId,
    threadId: input.threadId,
    step1_realObjective: objective,
    step1_desiredOutcome: outcome,
    step2_emotionalState: emotionalState,
    step3_businessContext: businessContext,
    step4_thinkingMode: thinkingMode,
    step5_disciplines: disciplines,
    step6_confidence: confidence,
    step6_confidenceNote: confidenceNote,
    step7_responseStructure: clarificationQuestion
      ? "clarification_question"
      : responseStructure,
    step8_readyToGenerate: readyToGenerate,
    clarificationQuestion,
    objectiveLock: createLock(input, outcome),
    engineVersion: SPARK_COGNITIVE_ORCHESTRATION_VERSION,
  };
}

function mapThinkingToInteraction(
  mode: ThinkingMode,
  emotional: EmotionalState,
): PreComposeAnalysis["interactionClass"] {
  if (emotional === "overwhelmed") return "emotional_support";
  switch (mode) {
    case "research":
      return "research";
    case "creative_thinking":
      return "creative_work";
    case "teaching":
      return "learning";
    case "planning":
      return "planning";
    case "decision_support":
    case "strategic_thinking":
    case "executive_board":
      return "decision_making";
    case "reflection":
      return "reflection";
    case "quick_answer":
      return "execution";
    default:
      return "business_strategy";
  }
}

export function selfReviewCognition(
  draft: ResponseDraft,
  plan: CognitiveOrchestrationPlan,
): CognitiveSelfReview {
  const analysis: PreComposeAnalysis = {
    turnId: plan.turnId,
    literalAsk: plan.step1_realObjective,
    desiredOutcome: plan.step1_desiredOutcome,
    interactionClass: mapThinkingToInteraction(
      plan.step4_thinkingMode,
      plan.step2_emotionalState,
    ),
    disciplines: plan.step5_disciplines,
    memberNeed: "coaching",
    readyToCompose: plan.step8_readyToGenerate,
    responseDepth: "moderate",
    objectiveLock: plan.objectiveLock,
    engineVersion: "1.0",
  };

  const base = evaluateBeforeSend(draft, analysis);
  const revisionHints = [...base.revisionHints];

  const wouldTrustAdvice =
    plan.step6_confidence !== "low" || /\b(not sure|verify|check with)\b/i.test(draft.text);

  if (!wouldTrustAdvice) {
    revisionHints.push("Low confidence — state uncertainty or recommend verification");
  }

  const canBeSimpler = draft.text.length > 600;
  if (canBeSimpler) {
    revisionHints.push("Can be simpler — reduce length");
  }

  const canBeBetter = revisionHints.length > 0;

  const pass =
    base.pass &&
    wouldTrustAdvice &&
    !canBeSimpler &&
    plan.step7_responseStructure !== "clarification_question";

  return {
    answeredRealQuestion: base.answeredRealQuestion,
    reducedOverwhelm: base.reducedOverwhelm,
    stayedFocused: base.stayedOnObjective,
    rightDisciplines: true,
    wouldTrustAdvice,
    canBeSimpler,
    canBeBetter,
    pass,
    revisionHints,
  };
}

export function runCognitiveOrchestration(
  input: CognitiveOrchestrationInput,
  draft?: ResponseDraft,
): CognitiveOrchestrationResult {
  const plan = orchestrateCognition(input);

  if (!plan.step8_readyToGenerate && plan.clarificationQuestion) {
    return {
      kind: "clarification",
      plan,
      question: plan.clarificationQuestion,
    };
  }

  if (!draft) {
    return { kind: "ready", plan };
  }

  const review = selfReviewCognition(draft, plan);
  return {
    kind: "reviewed",
    plan,
    approved: review.pass,
    finalText: draft.text,
    review,
  };
}
