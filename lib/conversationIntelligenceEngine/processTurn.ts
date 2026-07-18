/**
 * CIE end-to-end turn pipeline (packages 195–199).
 *
 * Stages: intake → literal/priority → state → mode → topic → phase →
 * gold retrieval → plan → generate → validate → repair → persist → deliver.
 *
 * Experience-specific drafting stays outside (callback / draftText).
 * CIE never imports Talk It Out / Create panels.
 */

import {
  enforceHumanConversationGate,
  recordHcvTelemetry,
} from "@/lib/humanConversationValidator";
import type { ThinkingMap } from "@/lib/reflectiveConversationIntelligence";
import { buildConversationPlan } from "./planning";
import { repairConversationResponse } from "./repair";
import {
  retrieveGoldStandardExamples,
  toRetrievedExampleReferences,
} from "./retrieval";
import {
  emptyConversationRuntimeState,
  inferPhase,
  runtimeStateFromThinkingMap,
  updateRuntimeStateForUserTurn,
  validateRuntimeState,
} from "./state";
import { appendQualityHistory, recordCieTelemetry } from "./telemetry";
import { validateConversationResponse } from "./validation";
import type {
  CieFailureCode,
  CieTurnInput,
  CieTurnResult,
  ConversationPlan,
  ConversationRuntimeState,
} from "./types";

export type CieGenerateContext = {
  plan: ConversationPlan;
  state: ConversationRuntimeState;
};

export type ProcessConversationTurnInput = CieTurnInput & {
  /** Experience draft builder — called once unless regeneration uses repair. */
  generateDraft?: (ctx: CieGenerateContext) => string;
  thinkingMap?: ThinkingMap | null;
  /**
   * `permanent_bans_only` — regenerate only for known failure phrases / topic stop-words
   * (used for completion, help offer, and mode-boundary transitions).
   */
  validationMode?: "full" | "permanent_bans_only";
};

/**
 * Failures that must block delivery and force regeneration (package 198/206).
 * Soft-pass-only logging is not enough — bad drafts must be replaced.
 */
const BLOCKING_FAILURES: ReadonlySet<CieFailureCode> = new Set([
  "TOPIC_DRIFT",
  "STOP_WORD_AS_TOPIC",
  "REPAIR_LOST_TOPIC",
  "USER_CORRECTION_IGNORED",
  "REJECTED_INTERPRETATION_REUSED",
  "FAILED_CLARIFICATION_REPAIR",
  "GENERIC_POST_CORRECTION_FALLBACK",
  "UNSUPPORTED_HIDDEN_MEANING",
  "INSUFFICIENT_INTERPRETATION_EVIDENCE",
  "VERBATIM_GOLD_COPY",
  "UNGROUNDED_FALLBACK",
  "TOPIC_ANCHOR_MISSING",
  "GENERIC_ACKNOWLEDGEMENT",
  "EMPTY_EMPATHY",
  "VAGUE_PRONOUN",
  "MISSING_TOPIC_REFERENCE",
  "STACKED_QUESTIONS",
  "SCRIPTED_LANGUAGE",
  "ROBOTIC_TRANSITION",
  "UNRELATED_NEXT_QUESTION",
  "ABSTRACT_QUESTION_WITH_GROUNDED_CONTEXT",
]);

/** Narrow set for permission offers / summaries that are already authored. */
const PERMANENT_BAN_FAILURES: ReadonlySet<CieFailureCode> = new Set([
  "UNSUPPORTED_HIDDEN_MEANING",
  "UNGROUNDED_FALLBACK",
  "STOP_WORD_AS_TOPIC",
  "GENERIC_ACKNOWLEDGEMENT",
  "GENERIC_POST_CORRECTION_FALLBACK",
  "VERBATIM_GOLD_COPY",
  "SCRIPTED_LANGUAGE",
]);

function blockingFailures(
  failures: readonly CieFailureCode[],
  mode: "full" | "permanent_bans_only" = "full",
): CieFailureCode[] {
  const set = mode === "permanent_bans_only" ? PERMANENT_BAN_FAILURES : BLOCKING_FAILURES;
  return failures.filter((f) => set.has(f));
}

/** Map HCV codes into CIE quality history (telemetry keeps full HCV codes). */
function mapHcvToCieFailures(
  codes: readonly string[],
): CieFailureCode[] {
  const out: CieFailureCode[] = [];
  for (const c of codes) {
    if (c.includes("TOPIC") || c.includes("BACKGROUND")) out.push("TOPIC_DRIFT");
    else if (c.includes("HIDDEN") || c.includes("INTERPRETATION"))
      out.push("UNSUPPORTED_HIDDEN_MEANING");
    else if (c.includes("TEMPLATE") || c.includes("AI_LIKE") || c.includes("SCRIPTED"))
      out.push("SCRIPTED_LANGUAGE");
    else if (c.includes("CORRECTION")) out.push("USER_CORRECTION_IGNORED");
    else if (c.includes("MALFORMED")) out.push("STOP_WORD_AS_TOPIC");
    else if (c.includes("GENERIC") || c.includes("EMPTY"))
      out.push("GENERIC_ACKNOWLEDGEMENT");
  }
  return [...new Set(out)];
}

export function processConversationTurn(
  input: ProcessConversationTurnInput,
): CieTurnResult {
  const turnId = `cie-${Date.now()}-${input.conversationId.slice(0, 8)}`;

  // Stages 1–4 — load / migrate / validate state
  let state =
    input.priorState ??
    emptyConversationRuntimeState(input.conversationId, input.experienceId);

  if (input.thinkingMap) {
    state = runtimeStateFromThinkingMap({
      conversationId: input.conversationId,
      experienceId: input.experienceId,
      thinkingMap: input.thinkingMap,
      prior: state,
    });
  }

  state = updateRuntimeStateForUserTurn({
    state,
    userText: input.userText,
    messages: input.messages,
    turnId,
  });

  const stateCheck = validateRuntimeState(state);
  if (!stateCheck.ok && state.topicAnchor) {
    // Drop illegal topic labels rather than invent a new topic
    if (stateCheck.issues.includes("illegal_topic_label")) {
      state = { ...state, topicAnchor: null };
    }
  }

  // Stages 5–11 — plan (includes mode, move, gold retrieval)
  const plan = buildConversationPlan({ turn: input, state });
  state = {
    ...state,
    primaryMode: plan.primaryMode,
    conversationPhase: inferPhase(state, plan.priorityEvent),
  };

  const gold = retrieveGoldStandardExamples({
    userText: input.userText,
    state,
    phase: state.conversationPhase,
    clarificationOrRepair:
      plan.priorityEvent === "clarification_request" ||
      plan.priorityEvent === "direct_correction" ||
      Boolean(input.repairActive),
  });
  state = {
    ...state,
    retrievedExamples: toRetrievedExampleReferences(gold),
    previousAssistantMove: plan.conversationalMove,
    nextRecommendedMoves: gold.suggestedMove ? [gold.suggestedMove] : [],
  };

  // Stage 12 — generate
  let draft =
    input.draftText?.trim() ||
    input.generateDraft?.({ plan, state })?.trim() ||
    plan.safeFallback;

  const repairActive =
    Boolean(input.repairActive) ||
    plan.priorityEvent === "clarification_request" ||
    plan.priorityEvent === "direct_correction";

  // Stages 13–14 — validate / regenerate (max 2 attempts) / fallback
  let validation = validateConversationResponse({
    responseText: draft,
    userText: input.userText,
    plan,
    state,
    messages: input.messages,
    thinkingMap: input.thinkingMap,
    repairActive,
  });

  const validationMode = input.validationMode ?? "full";
  let regenerated = false;
  let usedFallback = false;
  let failureCodes = [...validation.failures];
  let hard = blockingFailures(validation.failures, validationMode);

  if (hard.length > 0) {
    regenerated = true;
    draft = repairConversationResponse({
      plan,
      state,
      userText: input.userText,
      failureCodes: hard,
      attempt: 1,
    });
    validation = validateConversationResponse({
      responseText: draft,
      userText: input.userText,
      plan,
      state,
      messages: input.messages,
      thinkingMap: input.thinkingMap,
      repairActive: true,
    });
    failureCodes = [...failureCodes, ...validation.failures];
    hard = blockingFailures(validation.failures, validationMode);

    if (hard.length > 0) {
      usedFallback = true;
      draft = plan.safeFallback;
      validation = validateConversationResponse({
        responseText: draft,
        userText: input.userText,
        plan,
        state,
        messages: input.messages,
        thinkingMap: input.thinkingMap,
        repairActive: true,
      });
      failureCodes = [...failureCodes, ...validation.failures];
      // Never block delivery after grounded fallback
      validation = { passed: true, failures: [] };
    }
  } else if (!validation.passed) {
    // Soft failures — log only when not in the active blocking set
    validation = { passed: true, failures: validation.failures };
  }

  // Package 209 — Human Conversation Validator (required gate before delivery)
  // Skip full HCV only for authored permission/summary lines (permanent_bans_only).
  if (validationMode === "full") {
    const hcv = enforceHumanConversationGate({
      draftText: draft,
      userText: input.userText,
      messages: input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      topicAnchor: state.topicAnchor?.primaryTopic,
      currentFocus: state.currentFocus?.label,
      conversationMode: plan.primaryMode,
      conversationPhase: state.conversationPhase,
      userCorrections: state.userCorrections.map((c) => c.correctedItem),
      rejectedInterpretations: state.rejectedInterpretations.map(
        (r) => r.interpretation,
      ),
      conversationalMove: plan.conversationalMove,
      repairActive,
      experienceId: input.experienceId,
    });
    draft = hcv.text;
    if (hcv.regenerated) regenerated = true;
    if (hcv.usedFallback) usedFallback = true;
    failureCodes = [...failureCodes, ...mapHcvToCieFailures(hcv.result.failureCodes)];
    recordHcvTelemetry({
      experienceId: input.experienceId,
      turnId,
      passed: hcv.result.passed && !hcv.usedFallback,
      overallScore: hcv.result.overallScore,
      criticalFailure: hcv.result.criticalFailure,
      regenerated: hcv.regenerated,
      usedFallback: hcv.usedFallback,
      failureCodes: hcv.result.failureCodes,
      at: new Date().toISOString(),
    });
  } else {
    // Still scrub critical HCV templates on authored offers
    const hcv = enforceHumanConversationGate({
      draftText: draft,
      userText: input.userText,
      messages: input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      topicAnchor: state.topicAnchor?.primaryTopic,
      currentFocus: state.currentFocus?.label,
      repairActive: true,
      experienceId: input.experienceId,
    });
    if (
      hcv.result.failureCodes.some((c) =>
        [
          "HCV_TEMPLATE_SHELL_DETECTED",
          "HCV_MALFORMED_TOPIC_PHRASE",
          "HCV_HIDDEN_MEANING_INVENTED",
          "HCV_AI_LIKE_LANGUAGE",
        ].includes(c),
      )
    ) {
      draft = hcv.text;
      if (hcv.regenerated) regenerated = true;
      if (hcv.usedFallback) usedFallback = true;
      failureCodes = [
        ...failureCodes,
        ...mapHcvToCieFailures(hcv.result.failureCodes),
      ];
    }
    recordHcvTelemetry({
      experienceId: input.experienceId,
      turnId,
      passed: true,
      overallScore: hcv.result.overallScore,
      criticalFailure: false,
      regenerated: hcv.regenerated,
      usedFallback: hcv.usedFallback,
      failureCodes: hcv.result.failureCodes,
      at: new Date().toISOString(),
    });
  }

  const status = usedFallback
    ? "fallback"
    : regenerated
      ? "regenerated"
      : "passed";

  state = {
    ...state,
    qualityHistory: appendQualityHistory(state.qualityHistory, {
      turnId,
      status,
      failureCodes: [...new Set(failureCodes)],
    }),
    clarificationState: repairActive
      ? {
          requested: false,
          repairRequired: false,
          confusingPhrase: state.clarificationState?.confusingPhrase,
        }
      : state.clarificationState,
  };

  recordCieTelemetry({
    conversationId: input.conversationId,
    experienceId: input.experienceId,
    turnId,
    status,
    failureCodes: [...new Set(failureCodes)],
    regenerated,
    usedFallback,
    primaryMode: plan.primaryMode,
    conversationalMove: plan.conversationalMove,
    at: new Date().toISOString(),
  });

  return {
    assistantText: draft.trim(),
    state,
    plan,
    validation,
    regenerated,
    usedFallback,
    failureCodes: [...new Set(failureCodes)],
  };
}
