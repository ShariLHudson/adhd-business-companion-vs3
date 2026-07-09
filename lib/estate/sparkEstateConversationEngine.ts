/**
 * Spark Estate™ — conversation engine and Shari voice (Phase 17).
 * One consistent companion across every room, card, workflow, and creation experience.
 *
 * @see docs/protocols/SPARK_ESTATE_CONVERSATION_ENGINE_AND_SHARI_VOICE_SPECIFICATION_PHASE17.md
 */

import { detectShariBannedPhrases } from "@/lib/conversation/shariCompanionEnginePrompt";
import {
  buildSparkEstatePersonalizationContext,
  getSparkEstateMemberProfile,
  type SparkEstatePersonalizationContext,
} from "./sparkEstateMemberProfileEngine";
import { SPARK_ESTATE_CREATION_STEPS } from "@/lib/universalCreation/sparkEstateCreationJourney";

export const SPARK_ESTATE_CONVERSATION_SUCCESS_TEST =
  "I am understood. I know what to do next. I can keep going.";

export const SPARK_ESTATE_CONVERSATION_PRINCIPLE =
  "A helpful person walking beside me — not a software assistant.";

export const SPARK_ESTATE_SHARI_TRAITS = [
  "warm",
  "encouraging",
  "practical",
  "patient",
  "helpful",
  "step-by-step",
] as const;

export const SPARK_ESTATE_CONVERSATION_AVOID = [
  "software assistant",
  "business consultant giving orders",
  "form to complete",
  "robotic chatbot",
  "corporate jargon",
  "criticizing unfinished work",
] as const;

export const SPARK_ESTATE_CONVERSATION_FLOW = [
  "connect",
  "clarify",
  "guide",
  "create",
  "review",
  "continue",
] as const;

export const SPARK_ESTATE_QUESTION_RULES = [
  "Ask one question at a time.",
  "Ask the most useful question first.",
  "Ask questions that reduce confusion.",
  "Do not run long questionnaires.",
  "Do not ask what the system should already know.",
] as const;

export const SPARK_ESTATE_CREATION_RESPONSE_PATTERN =
  SPARK_ESTATE_CREATION_STEPS.map((step) => step.id);

export type SparkEstateConversationPhase =
  (typeof SPARK_ESTATE_CONVERSATION_FLOW)[number];

export type SparkEstateConversationState =
  | "overwhelmed"
  | "stuck"
  | "ready-to-create"
  | "unclear"
  | "reviewing"
  | "continuing";

export type SparkEstateConversationTurn = {
  phase: SparkEstateConversationPhase;
  state: SparkEstateConversationState;
  askBeforeCreate: boolean;
  memberLine: string;
  nextQuestion: string | null;
  encouragement: string | null;
  memoryLine: string | null;
  roomExpertise: string | null;
};

const OVERWHELMED_RE =
  /\b(?:overwhelm(?:ed)?|too much|a lot (?:going|happening)|can'?t keep up|everything at once|my head is spinning)\b/i;

const STUCK_RE =
  /\b(?:stuck|don'?t know (?:what to do|where to start)|can'?t (?:start|move forward)|not moving forward)\b/i;

const CLEAR_CREATE_RE =
  /\b(?:help me (?:write|create|build|draft)|create a|build a|write an?|draft a|make a)\b/i;

const REVIEW_RE =
  /\b(?:does this (?:feel|look) right|what would you change|review this|improve this)\b/i;

const CONTINUE_RE =
  /\b(?:what(?:'s| is) next|what would help next|keep going|continue)\b/i;

const ROOM_EXPERTISE: Record<string, string> = {
  "content-generator": "Help create content.",
  "momentum-builder": "Help create progress.",
  "chamber-of-momentum": "Help create progress.",
  "momentum-institute": "Help you learn with patience.",
  "decision-compass": "Help you decide with clarity.",
  marketing: "Help create campaigns.",
};

const ESTATE_BANNED_OPENERS = [
  /^let's break it down\b/i,
  /^here's a simple outline\b/i,
  /^would you like assistance\b/i,
  /^great!\b/i,
  /^how does that sound\?\s*$/i,
  /^as an ai\b/i,
  /^certainly[!,]?\b/i,
];

export function detectSparkEstateConversationState(
  text: string,
): SparkEstateConversationState {
  const trimmed = text.trim();
  if (!trimmed) return "unclear";
  if (REVIEW_RE.test(trimmed)) return "reviewing";
  if (CONTINUE_RE.test(trimmed)) return "continuing";
  if (OVERWHELMED_RE.test(trimmed)) return "overwhelmed";
  if (STUCK_RE.test(trimmed)) return "stuck";
  if (CLEAR_CREATE_RE.test(trimmed)) return "ready-to-create";
  return "unclear";
}

export function shouldAskBeforeCreate(input: {
  text: string;
  hasKnownGoal?: boolean;
  hasAudience?: boolean;
}): boolean {
  const state = detectSparkEstateConversationState(input.text);
  if (state === "ready-to-create") return false;
  if (state === "overwhelmed" || state === "stuck") return true;
  if (input.hasKnownGoal && input.hasAudience) return false;
  if (/\b(?:not sure|unclear|don'?t know what|which direction)\b/i.test(input.text)) {
    return true;
  }
  return state === "unclear";
}

export function buildSparkEstateOverwhelmResponse(): string {
  return "You have a lot moving at once. Let's choose the one thing that would make today easier.";
}

export function buildSparkEstateStuckResponse(): string {
  return "What is making this difficult right now? We can clarify, break it down, learn something, encourage, or decide — one step at a time.";
}

export function buildSparkEstateConnectQuestion(
  context?: SparkEstatePersonalizationContext,
): string {
  if (context?.continuityLine) return context.continuityLine;
  return "What are you working on right now?";
}

export function buildSparkEstateReviewPrompt(): string {
  return "Does this feel right? What would you like to change?";
}

export function buildSparkEstateContinuePrompt(): string {
  return "What would help you most next?";
}

export function formatSparkEstateMemoryReference(
  context: SparkEstatePersonalizationContext = buildSparkEstatePersonalizationContext(),
): string | null {
  if (context.stepByStep) {
    return "Last time you preferred breaking this into smaller steps.";
  }
  if (context.useExamples) {
    return "You often move forward best when you see an example first.";
  }
  const profile = getSparkEstateMemberProfile();
  if (profile.progressHistory.length > 0) {
    return "You have done something like this before — we can build on that.";
  }
  return null;
}

export function sanitizeSparkEstateShariCopy(text: string): string {
  let result = text.trim();
  for (const pattern of ESTATE_BANNED_OPENERS) {
    if (pattern.test(result)) {
      result = result.replace(
        pattern,
        "Let's take this one step at a time.",
      );
    }
  }
  if (detectShariBannedPhrases(result).length > 0) {
    result = result
      .replace(/\blet'?s break (?:this |it )?down\b/gi, "Let's take this one step at a time")
      .replace(/\bhow can i assist\b/gi, "What would help you most right now?")
      .replace(/\bi'?m here to help\b/gi, "I'm with you — we'll figure this out together.");
  }
  return result.trim();
}

function phaseForState(state: SparkEstateConversationState): SparkEstateConversationPhase {
  switch (state) {
    case "overwhelmed":
    case "stuck":
    case "unclear":
      return "connect";
    case "ready-to-create":
      return "create";
    case "reviewing":
      return "review";
    case "continuing":
      return "continue";
    default:
      return "clarify";
  }
}

function encouragementForState(state: SparkEstateConversationState): string | null {
  switch (state) {
    case "overwhelmed":
      return "You already made progress by getting this out of your head.";
    case "stuck":
      return "Feeling stuck does not mean you failed — it usually means something needs to be smaller or clearer.";
    case "ready-to-create":
      return "We can shape this together — one step at a time.";
    case "reviewing":
      return "Review is how good work becomes work you trust.";
    default:
      return null;
  }
}

function nextQuestionForState(
  state: SparkEstateConversationState,
  context: SparkEstatePersonalizationContext,
): string | null {
  switch (state) {
    case "overwhelmed":
      return "What feels hardest right now?";
    case "stuck":
      return "What is making this difficult right now?";
    case "unclear":
      return buildSparkEstateConnectQuestion(context);
    case "reviewing":
      return buildSparkEstateReviewPrompt();
    case "continuing":
      return buildSparkEstateContinuePrompt();
    default:
      return null;
  }
}

function memberLineForState(state: SparkEstateConversationState): string {
  switch (state) {
    case "overwhelmed":
      return buildSparkEstateOverwhelmResponse();
    case "stuck":
      return buildSparkEstateStuckResponse();
    case "ready-to-create":
      return "I can help with that. Let's understand what matters most first.";
    case "reviewing":
      return buildSparkEstateReviewPrompt();
    case "continuing":
      return buildSparkEstateContinuePrompt();
    default:
      return "I can see why this feels like a lot. Let's figure out the easiest place to start.";
  }
}

export function resolveSparkEstateConversationTurn(input?: {
  text?: string;
  section?: string;
  hasKnownGoal?: boolean;
  hasAudience?: boolean;
}): SparkEstateConversationTurn {
  const text = input?.text?.trim() ?? "";
  const context = buildSparkEstatePersonalizationContext({ text });
  const state = detectSparkEstateConversationState(text);
  const phase = phaseForState(state);
  const askBeforeCreate = shouldAskBeforeCreate({
    text,
    hasKnownGoal: input?.hasKnownGoal,
    hasAudience: input?.hasAudience,
  });

  return {
    phase,
    state,
    askBeforeCreate,
    memberLine: sanitizeSparkEstateShariCopy(memberLineForState(state)),
    nextQuestion: nextQuestionForState(state, context),
    encouragement: encouragementForState(state),
    memoryLine: formatSparkEstateMemoryReference(context),
    roomExpertise: input?.section
      ? ROOM_EXPERTISE[input.section] ?? null
      : null,
  };
}

export function formatSparkEstateConversationReply(
  turn: SparkEstateConversationTurn,
): string {
  const parts: string[] = [];
  if (turn.encouragement) parts.push(turn.encouragement);
  parts.push(turn.memberLine);
  if (turn.memoryLine) parts.push(turn.memoryLine);
  if (turn.nextQuestion && !turn.memberLine.includes(turn.nextQuestion)) {
    parts.push(turn.nextQuestion);
  }
  return sanitizeSparkEstateShariCopy(parts.join("\n\n"));
}

export function sparkEstateConversationHint(
  input?: Parameters<typeof resolveSparkEstateConversationTurn>[0],
): string {
  const turn = resolveSparkEstateConversationTurn(input);
  const lines = [
    "SPARK ESTATE CONVERSATION ENGINE:",
    SPARK_ESTATE_CONVERSATION_PRINCIPLE,
    `Flow: ${SPARK_ESTATE_CONVERSATION_FLOW.join(" → ")}`,
    `Phase ${turn.phase} · State ${turn.state}`,
    `Ask before create: ${turn.askBeforeCreate ? "yes" : "no"}`,
    ...SPARK_ESTATE_QUESTION_RULES.slice(0, 3).map((rule) => `- ${rule}`),
  ];
  if (turn.roomExpertise) {
    lines.push(`Room expertise: ${turn.roomExpertise} Same Shari voice.`);
  }
  if (turn.memoryLine) {
    lines.push(`Memory (quiet): ${turn.memoryLine}`);
  }
  if (turn.state === "overwhelmed") {
    lines.push("Overwhelm pattern: acknowledge → simplify → one next step.");
  }
  if (turn.state === "stuck") {
    lines.push("Stuck pattern: clarify, break down, teach, encourage, or decide.");
  }
  return lines.join("\n");
}

export function verifySparkEstateConversationEngine(): {
  traits: readonly string[];
  flowSteps: readonly string[];
  voiceConsistent: boolean;
  patternsReady: boolean;
} {
  const overwhelm = resolveSparkEstateConversationTurn({
    text: "I am overwhelmed with everything",
  });
  const stuck = resolveSparkEstateConversationTurn({ text: "I'm stuck" });
  const create = resolveSparkEstateConversationTurn({
    text: "Help me write an email",
    hasKnownGoal: true,
    hasAudience: true,
  });
  const sanitized = sanitizeSparkEstateShariCopy("Let's break it down for you.");

  return {
    traits: SPARK_ESTATE_SHARI_TRAITS,
    flowSteps: SPARK_ESTATE_CONVERSATION_FLOW,
    voiceConsistent:
      SPARK_ESTATE_SHARI_TRAITS.length === 6 &&
      !sanitized.toLowerCase().includes("break it down") &&
      overwhelm.state === "overwhelmed" &&
      stuck.nextQuestion?.includes("difficult"),
    patternsReady:
      create.askBeforeCreate === false &&
      create.phase === "create" &&
      formatSparkEstateConversationReply(overwhelm).length > 0,
  };
}
