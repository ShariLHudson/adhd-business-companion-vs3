import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  assertPipelineOwner,
  assertPipelineTurnContinuable,
  commitPipelineTurnOwner,
  DEFAULT_TURN_OWNER,
  finalizePipelineTurn,
  getPipelineTraceLog,
  isPipelineTurnSealed,
  ownerExecutionComplete,
  ownerExecutionStart,
  ownerExecutionFail,
  pipelineStageEnter,
  pipelineStageExit,
  resetPipelineTraceLog,
  resetTransientPipelineState,
  sealPipelineTurn,
  startPipelineTurn,
} from "./conversationPipelineTrace";

describe("conversationPipelineTrace", () => {
  beforeEach(() => {
    resetPipelineTraceLog();
  });

  afterEach(() => {
    finalizePipelineTurn();
  });

  it("defaults missing owner to relationship_chat", () => {
    expect(assertPipelineOwner(null)).toBe(DEFAULT_TURN_OWNER);
    expect(assertPipelineOwner("")).toBe(DEFAULT_TURN_OWNER);
    expect(assertPipelineOwner("frictionless:universal_creation")).toBe(
      "frictionless:universal_creation",
    );
  });

  it("records stage enter/exit and owner start/complete", () => {
    startPipelineTurn({
      turn: 1,
      rawMessage: "Help me create a marketing plan.",
      owner: "frictionless:universal_creation",
      intent: "TASK_REQUEST",
    });
    commitPipelineTurnOwner("frictionless:universal_creation", "create_fast_path");

    pipelineStageEnter("create_fast_path");
    ownerExecutionStart("frictionless:universal_creation", "create_fast_path");
    pipelineStageExit("create_fast_path");
    ownerExecutionComplete("frictionless:universal_creation");
    finalizePipelineTurn();

    const trace = getPipelineTraceLog().at(-1);
    expect(trace?.owner).toBe("frictionless:universal_creation");
    expect(trace?.ownerComplete).toBe(true);
    expect(trace?.stages[0]?.stage).toBe("create_fast_path");
    expect(trace?.stages[0]?.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(trace?.ownerExecutions[0]?.completedAt).toBeTruthy();
  });

  it("flags blocked owner when complete never runs", () => {
    startPipelineTurn({
      turn: 2,
      rawMessage: "I hope you're having a good day.",
      owner: DEFAULT_TURN_OWNER,
      intent: "RELATIONSHIP_CHAT",
    });
    ownerExecutionStart(DEFAULT_TURN_OWNER, "companion_api");
    finalizePipelineTurn();

    const trace = getPipelineTraceLog().at(-1);
    expect(trace?.ownerComplete).toBe(false);
    expect(trace?.blockedOwner).toBe(DEFAULT_TURN_OWNER);
  });

  it("logs owner reassignment", () => {
    startPipelineTurn({
      turn: 3,
      rawMessage: "1",
      owner: "pending_choice",
      intent: "DIRECT_COMMAND",
      pendingChoice: true,
    });
    commitPipelineTurnOwner("direct_navigation", "estate_kernel", "topic change");
    finalizePipelineTurn();

    const trace = getPipelineTraceLog().at(-1);
    expect(trace?.ownerReassignments?.[0]?.from).toBe("pending_choice");
    expect(trace?.ownerReassignments?.[0]?.to).toBe("direct_navigation");
  });

  it("seals relationship_chat and blocks downstream handlers", () => {
    startPipelineTurn({
      turn: 4,
      rawMessage: "I hope you're having a good day.",
      owner: "relationship_chat",
      intent: "RELATIONSHIP_CHAT",
    });
    ownerExecutionStart("relationship_chat", "relationship_local");
    ownerExecutionComplete("relationship_chat");
    expect(isPipelineTurnSealed()).toBe(true);
    expect(assertPipelineTurnContinuable("companion_api")).toBe(false);
    expect(assertPipelineTurnContinuable("estate_kernel")).toBe(false);
    finalizePipelineTurn();
    expect(isPipelineTurnSealed()).toBe(true);
    expect(assertPipelineTurnContinuable("create_fast_path")).toBe(false);
  });

  it("allows create on fresh turn after previous seal cleared", () => {
    startPipelineTurn({
      turn: 5,
      rawMessage: "help me create an sop",
      owner: "relationship_chat",
      intent: "TASK_REQUEST",
    });
    sealPipelineTurn("stale_seal");
    finalizePipelineTurn();
    resetTransientPipelineState("incoming_message");

    startPipelineTurn({
      turn: 6,
      rawMessage: "help me create an sop",
      owner: "frictionless:universal_creation",
      intent: "CREATE",
    });
    commitPipelineTurnOwner(
      "frictionless:universal_creation",
      "create_terminal",
    );
    expect(assertPipelineTurnContinuable("create_terminal")).toBe(true);
    expect(assertPipelineTurnContinuable("companion_api")).toBe(true);
  });

  it("resetTransientPipelineState clears seal for next turn", () => {
    startPipelineTurn({
      turn: 10,
      rawMessage: "hello",
      owner: "relationship_chat",
      intent: "RELATIONSHIP_CHAT",
    });
    sealPipelineTurn("test");
    resetTransientPipelineState("incoming_message");
    expect(isPipelineTurnSealed()).toBe(false);
    expect(assertPipelineTurnContinuable("companion_api")).toBe(true);
  });
});
