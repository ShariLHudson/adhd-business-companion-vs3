import { beforeEach, describe, expect, it } from "vitest";

import {
  clearActiveTaskLockState,
  createActiveTaskLockState,
  detectTaskRequest,
  isUserCorrectionOverride,
  openActiveTask,
  shouldSuppressRoomRouting,
  type ActiveTask,
} from "./activeTaskLock";
import { evaluateEstateOrchestration } from "./estateOrchestration";
import {
  buildOrchestrationContext,
  clearOrchestrationShadowLog,
  evaluateEstateOrchestrationShadow,
  getLastOrchestrationShadowLogEntry,
  getOrchestrationShadowLog,
} from "./estateOrchestrationShadow";

const WONDERDOG_RESEARCH_TOPIC = "AI tools for Wonderdog";
const SPARK_RESEARCH_PROMISE =
  "I'll look into that — give me a moment.";

function wonderdogResearchTask(turn = 1): ActiveTask {
  return openActiveTask({
    kind: "research",
    topic: WONDERDOG_RESEARCH_TOPIC,
    sourceUserText: "Can you research AI tools for Wonderdog?",
    conversationTurn: turn,
    status: "working",
  });
}

function orchestrate(input: {
  userText: string;
  lastAssistantText?: string | null;
  priorUserText?: string | null;
  conversationTurn?: number;
  task?: ActiveTask | null;
  routingSuppressedUntilTurn?: number;
}) {
  const taskLockState = createActiveTaskLockState();
  if (input.task) {
    taskLockState.activeTask = input.task;
  }
  if (input.routingSuppressedUntilTurn) {
    taskLockState.routingSuppressedUntilTurn = input.routingSuppressedUntilTurn;
  }

  return evaluateEstateOrchestration(
    buildOrchestrationContext({
      userText: input.userText,
      lastAssistantText: input.lastAssistantText,
      priorUserText: input.priorUserText,
      conversationTurn: input.conversationTurn ?? 1,
      taskLockState,
    }),
  );
}

describe("activeTaskLock — detection", () => {
  beforeEach(() => {
    clearActiveTaskLockState();
  });

  it("detects research task requests with topic", () => {
    const detected = detectTaskRequest(
      "Can you research AI tools for Wonderdog?",
    );
    expect(detected?.kind).toBe("research");
    expect(detected?.topic).toMatch(/ai tools for wonderdog/i);
  });

  it("suppresses room routing while task is in progress", () => {
    const state = createActiveTaskLockState();
    state.activeTask = wonderdogResearchTask();
    expect(shouldSuppressRoomRouting(state, 5)).toBe(true);
  });
});

describe("Wonderdog / AI research — R1–R8 regression fixtures", () => {
  beforeEach(() => {
    clearActiveTaskLockState();
    clearOrchestrationShadowLog();
  });

  it("R1 — research request opens begin_task", () => {
    const result = orchestrate({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });

    expect(result.decision.kind).toBe("begin_task");
    if (result.decision.kind !== "begin_task") return;
    expect(result.decision.task.kind).toBe("research");
    expect(result.decision.task.topic).toMatch(/wonderdog/i);
    expect(result.suppressRoomRouting).toBe(true);
  });

  it('R2 — "yes" after Spark research promise continues task, not estate offer', () => {
    const priorTask = wonderdogResearchTask(1);
    const result = orchestrate({
      userText: "Yes",
      lastAssistantText: SPARK_RESEARCH_PROMISE,
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 3,
      task: priorTask,
    });

    expect(result.decision.kind).toBe("continue_task");
    expect(result.decision.kind === "execute_pending").toBe(false);
    expect(result.suppressRoomRouting).toBe(true);
  });

  it('R3 — "What did you find?" continues task without observatory routing', () => {
    const result = orchestrate({
      userText: "What did you find?",
      conversationTurn: 4,
      task: wonderdogResearchTask(1),
    });

    expect(result.decision.kind).toBe("continue_task");
    expect(result.suppressRoomRouting).toBe(true);

    const shadow = evaluateEstateOrchestrationShadow(
      buildOrchestrationContext({
        userText: "Show me the research on AI tools",
        conversationTurn: 4,
        taskLockState: {
          ...createActiveTaskLockState(),
          activeTask: wonderdogResearchTask(1),
        },
      }),
    );
    expect(shadow.legacyMatcherTop?.entryId).toBe("observatory");
    expect(shadow.hijackRisk).toBe(true);
    expect(shadow.orchestration.decision.kind).toBe("continue_task");
  });

  it('R4 — "Show me the research" continues task', () => {
    const result = orchestrate({
      userText: "Show me the research",
      conversationTurn: 4,
      task: wonderdogResearchTask(1),
    });

    expect(result.decision.kind).toBe("continue_task");
    expect(result.suppressRoomRouting).toBe(true);
  });

  it('R5 — "I don\'t want a room" triggers correction override', () => {
    const result = orchestrate({
      userText: "I don't want a room",
      conversationTurn: 6,
      task: wonderdogResearchTask(1),
    });

    expect(result.decision.kind).toBe("stay_conversation");
    if (result.decision.kind !== "stay_conversation") return;
    expect(result.decision.suppressRouting).toBe(true);
    expect(isUserCorrectionOverride("I don't want a room")).toBe(true);
  });

  it('R6 — "That\'s not what I asked" suppresses routing', () => {
    const result = orchestrate({
      userText: "That's not what I asked",
      conversationTurn: 6,
      task: wonderdogResearchTask(1),
    });

    expect(result.decision.kind).toBe("stay_conversation");
    if (result.decision.kind !== "stay_conversation") return;
    expect(result.decision.suppressRouting).toBe(true);
    expect(result.nextTaskLockState.routingSuppressedUntilTurn).toBeGreaterThanOrEqual(
      6,
    );
  });

  it('R7 — "Where is what you found?" continues task retrieval', () => {
    const result = orchestrate({
      userText: "Where is what you found?",
      conversationTurn: 8,
      task: wonderdogResearchTask(1),
    });

    expect(result.decision.kind).toBe("continue_task");
    expect(result.suppressRoomRouting).toBe(true);
  });

  it("R8 — explicit Journal Gazebo nav beats active research task", () => {
    const result = orchestrate({
      userText: "Take me to the Journal Gazebo",
      conversationTurn: 9,
      task: wonderdogResearchTask(1),
    });

    expect(result.decision.kind).toBe("navigate");
    if (result.decision.kind !== "navigate") return;
    expect(result.decision.placeId).toBe("journal");
  });
});

describe("estateOrchestrationShadow — observe/log", () => {
  beforeEach(() => {
    clearOrchestrationShadowLog();
  });

  it("logs shadow comparison with hijack risk flag", () => {
    evaluateEstateOrchestrationShadow(
      buildOrchestrationContext({
        userText: "Show me the research on AI tools",
        conversationTurn: 4,
        taskLockState: {
          ...createActiveTaskLockState(),
          activeTask: wonderdogResearchTask(1),
        },
      }),
      "vitest",
    );

    const log = getOrchestrationShadowLog();
    expect(log.length).toBe(1);
    expect(log[0]?.shadowDecision).toBe("continue_task");
    expect(log[0]?.legacyMatcherEntryId).toBe("observatory");
    expect(log[0]?.hijackRisk).toBe(true);
    expect(log[0]?.runtimeLabel).toBe("vitest");

    const last = getLastOrchestrationShadowLogEntry();
    expect(last?.suppressRoomRouting).toBe(true);
  });
});
