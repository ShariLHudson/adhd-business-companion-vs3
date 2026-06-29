import { describe, expect, it } from "vitest";

import {
  createInitialContext,
  processConversationTurn,
} from "./conversationEngine";

describe("Spark Core Conversation Engine v1.0", () => {
  const threadId = "thread-1";

  it("overwhelmed → empathy clarification, supporting path", () => {
    const result = processConversationTurn({
      turnId: "t1",
      memberMessage: "I'm overwhelmed.",
      context: createInitialContext(threadId),
    });

    expect(result.action.type).toBe("clarify");
    expect(result.emotionalState).toBe("overwhelmed");
    expect(result.context.state).toBe("clarifying");
  });

  it("simple question → respond with simple depth", () => {
    const result = processConversationTurn({
      turnId: "t2",
      memberMessage: "What is churn rate?",
      context: createInitialContext(threadId),
    });

    expect(result.action.type).toBe("respond");
    if (result.action.type === "respond") {
      expect(result.action.depth).toBe("simple");
      expect(result.action.intent).toBe("simple_question");
    }
  });

  it("research without depth → one clarifying question", () => {
    const result = processConversationTurn({
      turnId: "t3",
      memberMessage: "Research my competitors in the coaching space.",
      context: createInitialContext(threadId),
    });

    expect(result.action.type).toBe("clarify");
    if (result.action.type === "clarify") {
      expect(result.action.question).toMatch(/quick|deeper/i);
    }
  });

  it("misunderstanding recovery → clarifying question", () => {
    const ctx = createInitialContext(threadId);
    ctx.state = "responding";
    const result = processConversationTurn({
      turnId: "t4",
      memberMessage: "That's not what I meant at all.",
      context: ctx,
    });

    expect(result.intent).toBe("misunderstanding_recovery");
    expect(result.action.type).toBe("clarify");
  });

  it("quality scores good draft highly", () => {
    const result = processConversationTurn(
      {
        turnId: "t5",
        memberMessage: "Help me prepare for a sales meeting tomorrow.",
        context: createInitialContext(threadId),
      },
      {
        draftText:
          "Start with what you want them to decide by the end. Next step: jot three questions you'd love them to answer.",
      },
    );

    expect(result.quality?.pass).toBe(true);
    expect(result.quality?.nextStep).toBeGreaterThan(0.8);
  });

  it("maintains objective lock across turns", () => {
    const r1 = processConversationTurn({
      turnId: "t6",
      memberMessage: "Help me plan my Q3 marketing priorities.",
      context: createInitialContext(threadId),
    });

    expect(r1.context.objective.locked).toBe(true);

    const r2 = processConversationTurn({
      turnId: "t7",
      memberMessage: "Focus on email first.",
      context: r1.context,
      history: [
        { role: "member", content: "Help me plan my Q3 marketing priorities." },
        { role: "spark", content: "Let's start with your top goal for Q3." },
      ],
    });

    expect(r2.action.type).toBe("respond");
    if (r2.action.type === "respond") {
      expect(r2.action.guidance).toMatch(/Continuity/i);
    }
  });
});
