/**
 * CREATE terminal owner — architectural gate tests.
 *
 * Proves: Decision Engine CREATE + high → Universal Creation → RETURN
 * Nothing downstream (kernel, API, relationship) may execute.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { evaluateSparkDecisionEngine } from "@/lib/sparkCompanion";
import {
  classifyPrimaryConversationTurnWithEngine,
} from "@/lib/conversation/primaryTurnClassifier";
import {
  CREATE_TERMINAL_HANDLER,
  CREATE_TERMINAL_OWNER,
  isCreateTerminalDecision,
  startUniversalCreation,
} from "@/lib/conversation/createTerminalOwner";
import {
  getCreateTerminalTraceLog,
  resetCreateTerminalTraceLog,
} from "@/lib/conversation/createTerminalTrace";
import {
  assertPipelineTurnContinuable,
  commitPipelineTurnOwner,
  finalizePipelineTurn,
  getPipelineTraceLog,
  ownerExecutionComplete,
  ownerExecutionStart,
  resetPipelineTraceLog,
  startPipelineTurn,
} from "@/lib/conversation/conversationPipelineTrace";

const CREATE_TEXT = "Help me create a marketing plan.";

describe("CREATE terminal owner", () => {
  beforeEach(() => {
    resetPipelineTraceLog();
    resetCreateTerminalTraceLog();
  });

  it("Decision Engine selects CREATE with high confidence", () => {
    const engine = evaluateSparkDecisionEngine({ userText: CREATE_TEXT });
    expect(engine.intent).toBe("CREATE");
    expect(engine.intentConfidence).toBe("high");
    expect(isCreateTerminalDecision(engine)).toBe(true);
  });

  it("primary owner is frictionless:universal_creation after reconcile", () => {
    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: CREATE_TEXT,
    });
    expect(engine.intent).toBe("CREATE");
    expect(primary.owner).toBe(CREATE_TERMINAL_OWNER);
    expect(primary.confidence).toBe("high");
  });

  it("startUniversalCreation emits full trace sequence and blocks downstream", () => {
    const { primary, engine } = classifyPrimaryConversationTurnWithEngine({
      userText: CREATE_TEXT,
    });

    startPipelineTurn({
      turn: 1,
      rawMessage: CREATE_TEXT,
      owner: CREATE_TERMINAL_OWNER,
      intent: "CREATE",
    });
    commitPipelineTurnOwner(CREATE_TERMINAL_OWNER, CREATE_TERMINAL_HANDLER);
    ownerExecutionStart(CREATE_TERMINAL_OWNER, CREATE_TERMINAL_HANDLER);

    const { action } = startUniversalCreation({
      turn: 1,
      userText: CREATE_TEXT,
      lastAssistantText: "",
      primaryTurn: primary,
      engineDecision: engine,
    });

    expect(action.localReply).toBeTruthy();
    expect(action.category).toBe("universal_creation");

    ownerExecutionComplete();
    finalizePipelineTurn();

    const trace = getCreateTerminalTraceLog();
    expect(trace.map((e) => e.stage)).toEqual([
      "decision_engine_create",
      "universal_creation_entered",
      "universal_creation_first_response",
      "create_terminal_return",
    ]);

    const pipeline = getPipelineTraceLog().at(-1)!;
    expect(pipeline.owner).toBe(CREATE_TERMINAL_OWNER);
    expect(pipeline.sealed).toBe(true);
    expect(pipeline.sealedReason).toBe("create_terminal_owner_complete");
    expect(assertPipelineTurnContinuable("companion_api")).toBe(false);
    expect(assertPipelineTurnContinuable("estate_kernel")).toBe(false);
    expect(assertPipelineTurnContinuable("relationship_local")).toBe(false);
  });
});
