/**
 * CB-022 addendum — intent-first / WorkflowResumeDecision / Strategy Library modes.
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { ConversationOwner } from "@/lib/conversationContinuity/types";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import {
  classifyRequestedArtifactType,
  detectStrategyEntryMode,
  processIntentWorkflowOnUserTurn,
  resolveStrategyClassification,
} from "./intentClassificationGate";
import {
  resetIntentWorkflowStoreForTests,
  getIntentWorkflow,
} from "./intentWorkflowStore";
import { resolveWorkflowResumeDecision } from "./workflowResumeDecision";

const UC_OWNER: ConversationOwner = {
  kind: "guided_workflow",
  workflowId: "uc-1",
  workflowType: "document",
  currentStepId: "discovery",
  awaitingAnswer: true,
};

const UC_SESSION = {
  documentType: "document" as const,
  phase: "guided_creation" as const,
  answers: {},
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  resetIntentWorkflowStoreForTests();
});

describe("intent workflow — clear custom strategy", () => {
  it("recognizes strategy create, skips ADHD/Business ask, keeps VA context", () => {
    const text =
      "i need to create a new strategy for better communications with my VA";
    expect(classifyRequestedArtifactType(text)).toBe("strategy");
    expect(detectStrategyEntryMode(text)).toBe("create");
    expect(isSimpleCreateRequest(text)).toBe(false);

    const result = processIntentWorkflowOnUserTurn({
      userText: text,
      turn: 1,
      activeOwner: UC_OWNER,
      ucSession: UC_SESSION as never,
    });

    expect(result.strategyAction?.mode).toBe("create");
    expect(result.strategyAction?.needsClassificationAsk).toBe(false);
    expect(result.strategyAction?.startBusinessBuilder).toBe(true);
    expect(result.blockCreateFastPath).toBe(true);
    expect(result.invalidateStaleDocumentWorkflow).toBe(true);
    expect(result.resumeDecision.shouldResume).toBe(false);
    expect(result.resumeDecision.reason).toBe("new_intent");
    expect(result.state?.context.peopleInvolved?.join(" ")).toMatch(/va/i);
    expect(result.state?.context.topic).toMatch(/communication/i);
    expect(result.responseOwner).toBe("shari");
    expect(result.strategyAction?.reply.toLowerCase()).not.toContain(
      "reply with **adhd**",
    );
  });
});

describe("intent workflow — ADHD-aware business strategy", () => {
  it("infers combined intent without classification restart", () => {
    const text =
      "a business strategy for better communication that works for me and my adhd";
    const first = processIntentWorkflowOnUserTurn({
      userText: text,
      turn: 1,
      activeOwner: { kind: "general_chat" },
    });
    expect(first.strategyAction?.needsClassificationAsk).toBe(false);
    expect(first.state?.classificationStatus).toBe("adhd_aware_business");
    expect(first.state?.context.adhdAdaptation).toBe(true);

    const second = processIntentWorkflowOnUserTurn({
      userText: text,
      turn: 2,
      activeOwner: { kind: "general_chat" },
    });
    expect(second.strategyAction?.needsClassificationAsk).toBe(false);
    expect(second.state?.classificationStatus).toBe("adhd_aware_business");
    expect(
      resolveStrategyClassification({
        userText: text,
        prior: getIntentWorkflow(),
      }).askUser,
    ).toBe(false);
  });
});

describe("intent workflow — stale document rejection", () => {
  it("invalidates document workflow and keeps strategy intent", () => {
    processIntentWorkflowOnUserTurn({
      userText:
        "i need to create a new strategy for better communications with my VA",
      turn: 1,
      activeOwner: UC_OWNER,
      ucSession: UC_SESSION as never,
    });

    const reject = processIntentWorkflowOnUserTurn({
      userText: "i am not creating a document",
      turn: 2,
      activeOwner: UC_OWNER,
      ucSession: UC_SESSION as never,
    });

    expect(reject.invalidateStaleDocumentWorkflow).toBe(true);
    expect(reject.resumeDecision.shouldResume).toBe(false);
    expect(reject.state?.artifactType).toBe("strategy");
    expect(reject.state?.status).toBe("active");

    const next = processIntentWorkflowOnUserTurn({
      userText: "okay",
      turn: 3,
      activeOwner: UC_OWNER,
      ucSession: UC_SESSION as never,
    });
    // Without explicit document continue, strategy state remains; UC must not win via strategy resume.
    expect(next.resumeDecision.shouldResume).toBe(false);
  });
});

describe("intent workflow — browse / apply / resume", () => {
  it("browse mode for procrastination strategies", () => {
    const result = processIntentWorkflowOnUserTurn({
      userText: "show me strategies for procrastination",
      turn: 1,
      activeOwner: { kind: "general_chat" },
    });
    expect(result.strategyAction?.mode).toBe("browse");
    expect(result.strategyAction?.openLibrary).toBe(true);
    expect(result.strategyAction?.openView).toBe("adhd");
    expect(result.strategyAction?.startBusinessBuilder).toBe(false);
    expect(result.blockCreateFastPath).toBe(true);
  });

  it("apply mode for getting started", () => {
    const result = processIntentWorkflowOnUserTurn({
      userText: "help me use a strategy for getting started",
      turn: 1,
      activeOwner: { kind: "general_chat" },
    });
    expect(result.strategyAction?.mode).toBe("apply");
    expect(result.strategyAction?.startApplyCoach).toBe(true);
    expect(result.strategyAction?.startBusinessBuilder).toBe(false);
  });

  it("resume mode prefers strategy over document", () => {
    processIntentWorkflowOnUserTurn({
      userText: "create a communication strategy for my team",
      turn: 1,
      activeOwner: { kind: "general_chat" },
    });
    const result = processIntentWorkflowOnUserTurn({
      userText: "continue the strategy we were building",
      turn: 2,
      activeOwner: UC_OWNER,
      ucSession: UC_SESSION as never,
      hasActiveStrategySession: true,
    });
    expect(result.strategyAction?.mode).toBe("resume");
    expect(result.resumeDecision.shouldResume).toBe(false);
    expect(result.resumeDecision.reason).toBe("new_intent");
    expect(result.blockCreateFastPath).toBe(true);
  });
});

describe("intent workflow — explicit document and topic change", () => {
  it("allows explicit letter/document creation", () => {
    const text = "create a letter to my client";
    expect(classifyRequestedArtifactType(text)).toBe("document");
    expect(detectStrategyEntryMode(text)).toBeNull();
    expect(isSimpleCreateRequest(text)).toBe(true);

    const result = processIntentWorkflowOnUserTurn({
      userText: text,
      turn: 1,
      activeOwner: { kind: "general_chat" },
    });
    expect(result.strategyAction).toBeNull();
    expect(result.allowDocumentCreate).toBe(true);
    expect(result.blockCreateFastPath).toBe(false);
  });

  it("pauses strategy when topic changes to reminder", () => {
    processIntentWorkflowOnUserTurn({
      userText: "create a new strategy for better communications with my VA",
      turn: 1,
      activeOwner: { kind: "general_chat" },
    });
    const result = processIntentWorkflowOnUserTurn({
      userText: "actually help me create a reminder",
      turn: 2,
      activeOwner: { kind: "general_chat" },
    });
    expect(result.artifactType).toBe("reminder");
    expect(result.state?.status).toBe("paused");
    expect(result.state?.pausedGoal).toBeTruthy();
    expect(result.strategyAction).toBeNull();
    expect(result.invalidateStaleDocumentWorkflow).toBe(true);
  });
});

describe("WorkflowResumeDecision", () => {
  it("blocks UC resume on strategy intent", () => {
    const decision = resolveWorkflowResumeDecision({
      userText: "i need to create a new strategy for better communications with my VA",
      activeOwner: UC_OWNER,
      ucSession: UC_SESSION as never,
      currentArtifactType: "strategy",
    });
    expect(decision.shouldResume).toBe(false);
    expect(decision.reason).toBe("new_intent");
  });

  it("allows explicit document continue", () => {
    const decision = resolveWorkflowResumeDecision({
      userText: "go back to the document",
      activeOwner: UC_OWNER,
      ucSession: UC_SESSION as never,
      currentArtifactType: "unknown",
    });
    expect(decision.shouldResume).toBe(true);
    expect(decision.reason).toBe("explicit_continue");
  });
});

describe("Get Advice → Strategy Library navigation", () => {
  it("registers Strategy Library under Get Advice", () => {
    const getAdvice = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "get-advice");
    expect(getAdvice?.destinations.map((d) => d.id)).toEqual([
      "chamber-of-momentum",
      "boardroom",
      "strategy-library",
    ]);
    expect(getAdvice?.destinations.map((d) => d.label)).toContain(
      "Strategy Library",
    );
  });
});

describe("one visible response owner", () => {
  it("always reports shari as response owner", () => {
    const result = processIntentWorkflowOnUserTurn({
      userText: "show me strategies for procrastination",
      turn: 1,
      activeOwner: { kind: "general_chat" },
    });
    expect(result.responseOwner).toBe("shari");
    expect(result.state?.responseOwner).toBe("shari");
  });
});
