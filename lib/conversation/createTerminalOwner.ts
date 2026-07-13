/**
 * CREATE terminal owner — Decision Engine CREATE + high enters Universal Creation
 * and seals the pipeline so kernel / companion API / relationship cannot reinterpret.
 */

import type { FrictionlessActionDecision } from "@/lib/frictionlessActionLayer";
import type { PrimaryTurnDecision } from "@/lib/conversation/primaryTurnClassifier";
import type { SparkDecisionEngineDecision } from "@/lib/sparkCompanion/sparkDecisionEngine/types";
import {
  createFastPathRecoveryLine,
  formatUniversalCreationQuestion,
  formatUniversalCreationTurnReply,
  isSimpleCreateRequest,
  resolveUniversalCreationTurn,
  saveUniversalCreationSession,
  startUniversalCreationTurn,
  universalCreationHint,
} from "@/lib/universalCreation";
import { isDevelopmentWorkFrustration } from "@/lib/universalCreation/createFastPath";
import { sealPipelineTurn } from "@/lib/conversation/conversationPipelineTrace";
import { logCreateTerminalStage } from "@/lib/conversation/createTerminalTrace";

export const CREATE_TERMINAL_OWNER = "frictionless:universal_creation" as const;
export const CREATE_TERMINAL_HANDLER = "universal_creation" as const;

export type StartUniversalCreationInput = {
  turn: number;
  userText: string;
  lastAssistantText?: string | null;
  primaryTurn: PrimaryTurnDecision;
  engineDecision: SparkDecisionEngineDecision;
  workspace?: string | null;
};

export function isCreateTerminalDecision(
  engine: SparkDecisionEngineDecision,
  opts?: {
    userText?: string;
    lastAssistantText?: string | null;
    primaryTurn?: PrimaryTurnDecision | null;
  },
): boolean {
  const text = opts?.userText?.trim() ?? "";
  if (text && isDevelopmentWorkFrustration(text)) return false;

  if (engine.intent === "CREATE" && engine.intentConfidence === "high") {
    return true;
  }

  const primary = opts?.primaryTurn;
  if (primary?.owner === CREATE_TERMINAL_OWNER) return true;
  if (
    primary?.type === "TASK_REQUEST" &&
    text &&
    (isSimpleCreateRequest(text) || /(?:sop|newsletter|email|proposal)\b/i.test(text))
  ) {
    return true;
  }

  const last = opts?.lastAssistantText?.trim() ?? "";
  if (
    last &&
    text &&
    /how do we get started|let'?s (?:start|begin|continue)/i.test(text) &&
    (last.includes(createFastPathRecoveryLine(text).slice(0, 24)) ||
      /first piece you want to figure out|keep going right here/i.test(last))
  ) {
    return true;
  }

  return false;
}

function turnToAction(
  turn: NonNullable<ReturnType<typeof resolveUniversalCreationTurn>>,
): FrictionlessActionDecision {
  saveUniversalCreationSession(turn.session);
  const base = {
    category: "universal_creation" as const,
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: universalCreationHint(turn.session, turn),
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: null,
    universalCreationSession: turn.session,
  };

  if (turn.kind === "question") {
    return {
      ...base,
      localReply: formatUniversalCreationQuestion(turn),
    };
  }
  if (turn.kind === "uncertainty" || turn.kind === "message") {
    return { ...base, localReply: turn.message };
  }
  return {
    ...base,
    localReply: formatUniversalCreationTurnReply(turn),
  };
}

/**
 * Enter Universal Creation as the terminal CREATE owner for this turn.
 */
export function startUniversalCreation(
  input: StartUniversalCreationInput,
): { action: FrictionlessActionDecision } {
  const userText = input.userText.trim();
  const engine = input.engineDecision;

  logCreateTerminalStage({
    turn: input.turn,
    stage: "decision_engine_create",
    userText,
    engineIntent: engine.intent,
    engineConfidence: engine.intentConfidence,
    owner: CREATE_TERMINAL_OWNER,
    handler: CREATE_TERMINAL_HANDLER,
  });

  logCreateTerminalStage({
    turn: input.turn,
    stage: "universal_creation_entered",
    userText,
    engineIntent: engine.intent,
    engineConfidence: engine.intentConfidence,
    owner: CREATE_TERMINAL_OWNER,
    handler: CREATE_TERMINAL_HANDLER,
  });

  let turn =
    resolveUniversalCreationTurn(
      userText,
      input.turn,
      input.lastAssistantText ?? undefined,
    ) ?? startUniversalCreationTurn(userText, input.turn);

  if (!turn) {
    const failSafe = buildCreateFlowFailSafeReply(userText, input.turn);
    const action: FrictionlessActionDecision = {
      category: "universal_creation",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint: "CREATE_TERMINAL_FAILSAFE",
      localReply: failSafe,
      pendingAction: null,
      toolSuggestion: null,
      workspaceOffer: null,
      intentRouting: null,
    };
    logCreateTerminalStage({
      turn: input.turn,
      stage: "universal_creation_first_response",
      userText,
      engineIntent: engine.intent,
      engineConfidence: engine.intentConfidence,
      owner: CREATE_TERMINAL_OWNER,
      handler: CREATE_TERMINAL_HANDLER,
      detail: "failsafe",
    });
    logCreateTerminalStage({
      turn: input.turn,
      stage: "create_terminal_return",
      userText,
      engineIntent: engine.intent,
      engineConfidence: engine.intentConfidence,
      owner: CREATE_TERMINAL_OWNER,
      handler: CREATE_TERMINAL_HANDLER,
    });
    sealPipelineTurn("create_terminal_owner_complete");
    return { action };
  }

  const action = turnToAction(turn);

  logCreateTerminalStage({
    turn: input.turn,
    stage: "universal_creation_first_response",
    userText,
    engineIntent: engine.intent,
    engineConfidence: engine.intentConfidence,
    owner: CREATE_TERMINAL_OWNER,
    handler: CREATE_TERMINAL_HANDLER,
  });

  logCreateTerminalStage({
    turn: input.turn,
    stage: "create_terminal_return",
    userText,
    engineIntent: engine.intent,
    engineConfidence: engine.intentConfidence,
    owner: CREATE_TERMINAL_OWNER,
    handler: CREATE_TERMINAL_HANDLER,
  });

  sealPipelineTurn("create_terminal_owner_complete");
  void input.workspace;
  void input.primaryTurn;
  return { action };
}

export function buildCreateFlowFailSafeReply(
  userText: string,
  turn: number,
): string {
  try {
    const started = startUniversalCreationTurn(userText, turn);
    if (started) {
      saveUniversalCreationSession(started.session);
      if (started.kind === "question") {
        return formatUniversalCreationQuestion(started);
      }
      return formatUniversalCreationTurnReply(started);
    }
  } catch {
    // fall through
  }
  // Prefer a discovery-shaped line over the generic recovery copy.
  const started = startUniversalCreationTurn(
    /sop/i.test(userText) ? "help me create an sop" : userText,
    turn,
  );
  if (started?.kind === "question") {
    saveUniversalCreationSession(started.session);
    return formatUniversalCreationQuestion(started);
  }
  return "What process are we documenting first?";
}
