import { describe, expect, it } from "vitest";

import {
  runExecutiveFunction,
} from "./executiveFunctionEngine";
import { processConversationTurn } from "../conversationEngine/conversationEngine";
import { createInitialContext } from "../conversationEngine/types";

describe("Spark Executive Function Engine v1.0", () => {
  const base = {
    turnId: "t1",
    threadId: "thread-1",
    userId: "user-1",
    memberMessage: "",
  };

  it("overwhelm → empathy first, one small next step", () => {
    const result = runExecutiveFunction({
      ...base,
      memberMessage: "I'm overwhelmed.",
      emotionalState: "overwhelmed",
    });

    expect(result.state.primary).toBe("overwhelm");
    expect(result.state.needsEmpathyFirst).toBe(true);
    expect(result.guidance.pattern).toBe("empathy_then_one_step");
    expect(result.guidance.memberFacingLead).toMatch(/lot to carry/i);
    expect(result.guidance.nextStep.action).toBeTruthy();
    expect(result.cognitiveLoad.reduceBeforeAsking).toBe(true);
  });

  it("large project → phased breakdown with tiny first action", () => {
    const result = runExecutiveFunction({
      ...base,
      memberMessage: "Help me plan a full product launch from scratch.",
    });

    expect(result.guidance.taskBreakdown).toBeTruthy();
    expect(result.guidance.taskBreakdown!.phases.length).toBeGreaterThanOrEqual(3);
    expect(result.guidance.pattern).toBe("phased_project");
    expect(result.guidance.nextStep.effort?.gentle).toBe(true);
  });

  it("stuck → starting point not lecture", () => {
    const result = runExecutiveFunction({
      ...base,
      memberMessage: "I'm stuck and don't know where to start.",
    });

    expect(result.state.primary).toBe("task_paralysis");
    expect(result.guidance.pattern).toBe("starting_point");
    expect(result.guidance.memberFacingLead).toMatch(/not a lecture/i);
  });

  it("return after absence → welcome back without guilt", () => {
    const result = runExecutiveFunction({
      ...base,
      memberMessage: "Hi, I'm back.",
      daysSinceLastActivity: 5,
      lastObjectiveSummary: "pricing page draft",
    });

    expect(result.state.primary).toBe("returning_after_absence");
    expect(result.guidance.restartRecovery?.welcomeCopy).toMatch(/welcome back/i);
    expect(result.guidance.restartRecovery?.guiltFree).toBe(true);
    expect(result.guidance.restartRecovery?.whereWeLeftOff).toContain("pricing");
  });

  it("decision fatigue → single recommendation", () => {
    const result = runExecutiveFunction({
      ...base,
      memberMessage: "I have too many options — which platform should I use?",
    });

    expect(result.state.singleRecommendationOnly).toBe(true);
    expect(result.guidance.decisionReduction).toBeTruthy();
    expect(result.guidance.pattern).toBe("single_recommendation");
  });

  it("avoids shame and streak language in guidance", () => {
    const result = runExecutiveFunction({
      ...base,
      memberMessage: "I'm overwhelmed and behind on everything.",
    });

    for (const banned of result.guidance.avoid) {
      expect(result.guidance.composeGuidance.toLowerCase()).not.toContain(banned);
    }
  });

  it("recalls open loops from input", () => {
    const loops = [
      { id: "l1", label: "finish newsletter draft", source: "task" as const },
      { id: "l2", label: "reply to client email", source: "task" as const },
    ];
    const result = runExecutiveFunction({
      ...base,
      memberMessage: "What should I do next?",
      openLoops: loops,
    });

    expect(result.openLoopsRecalled).toHaveLength(2);
    expect(result.cognitiveLoad.drivers.some((d) => /open loop/i.test(d))).toBe(true);
  });

  it("integrates quietly with conversation engine", () => {
    const convo = processConversationTurn({
      turnId: "t1",
      memberMessage: "I'm overwhelmed.",
      context: createInitialContext("thread-1"),
    });

    expect(convo.executiveFunction?.state.primary).toBe("overwhelm");
    expect(convo.executiveFunction?.nextStep.action).toBeTruthy();
    if (convo.action.type === "respond") {
      expect(convo.action.guidance).toContain("Executive Function:");
    }
  });
});
