import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearShariConversationThread,
  storeShariConversationThread,
  buildShariConversationThread,
} from "./conversationContinuity";
import { runShariCognitivePipeline } from "./cognitivePipeline";
import { isUnnecessaryContextQuestion } from "./contextResolver";
import { validateConversationExcellence } from "./conversationExcellence";
import { decideShariResponse } from "./decideShariResponse";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => {
        memory.set(k, v);
      },
      removeItem: (k: string) => {
        memory.delete(k);
      },
    },
  });
  clearShariConversationThread();
});

describe("Shari cognitive pipeline", () => {
  it("teaches Loom how-to with teacher role and answer-before-question", () => {
    const turn = runShariCognitivePipeline("How do I create a Loom video?");
    expect(turn.decision.directAnswerRequired).toBe(true);
    expect(turn.primaryProfessionalRole).toBe("teacher");
    expect(turn.questionPolicy.answerBeforeQuestionRequired).toBe(true);
    expect(turn.promptHints).toMatch(/ANSWER-FIRST|CORE CONVERSATION/i);
    expect(turn.promptHints).toMatch(/PROFESSIONAL POSTURE/i);
  });

  it("advises on paid booth with advisor role", () => {
    const turn = runShariCognitivePipeline(
      "Should I pay $600 for a craft fair booth this weekend?",
    );
    expect(turn.decision.primaryHelpMode).toBe("advice");
    expect(turn.primaryProfessionalRole).toBe("advisor");
    expect(turn.reasoningPlan.whatMustBeIncluded.join(" ")).toMatch(
      /judgment|recommendation/i,
    );
  });

  it("coaches overwhelm without teaching dump", () => {
    const turn = runShariCognitivePipeline(
      "I feel overwhelmed and do not know where to start.",
    );
    expect(turn.primaryProfessionalRole).toBe("coach");
    expect(turn.decision.primaryHelpMode).toBe("reflective_thinking");
  });

  it("binds booth follow-ups and keeps consultant/teacher posture", () => {
    const first = runShariCognitivePipeline(
      "How do I best set up my vendor booth for a craft fair?",
    );
    storeShariConversationThread(
      buildShariConversationThread({
        decision: first.decision,
        answer: "Booth setup with layout and packing list.",
        primaryProfessionalRole: first.primaryProfessionalRole,
        supportingProfessionalRoles: first.supportingProfessionalRoles,
      }),
    );
    const follow = runShariCognitivePipeline("What should go on the table?");
    expect(follow.isFollowUp).toBe(true);
    expect(follow.promptHints).toMatch(/CONTINUITY/i);
  });

  it("fails excellence when reply asks for known products", () => {
    const decision = decideShariResponse(
      "How do I set up my craft booth?",
    );
    const turn = runShariCognitivePipeline(decision.rawRequest);
    // Simulate known products in context
    const context = {
      ...turn.context,
      knownContextAvailable: true,
      knownProducts: ["journals", "mugs", "beaded pens"],
      relevantContextKeys: ["legacy.sells"],
      contextConfidence: 0.9,
    };
    expect(
      isUnnecessaryContextQuestion(
        "What type of products do you sell?",
        context,
      ),
    ).toBe(true);

    const weak = validateConversationExcellence({
      request: decision.rawRequest,
      answer:
        "Great question! What type of products do you sell? Which area would you like to explore?",
      decision,
      context,
      questionPolicy: turn.questionPolicy,
      primaryRole: "consultant",
    });
    expect(weak.excellent).toBe(false);
    expect(weak.baseline.shariIsWeaker || !weak.questionPolicyOk).toBe(true);
  });

  it("passes excellence for substantive how-to", () => {
    const turn = runShariCognitivePipeline("How do I create a Loom video?");
    const strong = validateConversationExcellence({
      request: turn.decision.rawRequest,
      answer: [
        "Here’s a simple way to make a Loom that people actually watch.",
        "",
        "1. Open Loom and pick screen + camera.",
        "2. Write a one-sentence promise for the viewer.",
        "3. Record in one take: open, show the path, close with one ask.",
        "4. Trim the first two seconds and add a title.",
        "",
        "If you’d like, I can outline a 60-second script next.",
      ].join("\n"),
      decision: turn.decision,
      context: turn.context,
      questionPolicy: turn.questionPolicy,
      primaryRole: turn.primaryProfessionalRole,
    });
    expect(strong.valid).toBe(true);
    expect(strong.beatsOrMatchesGeneralAi).toBe(true);
    expect(strong.score).toBeGreaterThanOrEqual(7);
  });
});
