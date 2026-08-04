import { beforeEach, describe, expect, it, vi } from "vitest";
import { patchOutcomeThread, clearOutcomeThread } from "./companionOutcomeThread";
import { threadAwareAcceptanceFallback } from "./companionOutcomeThread";
import { resolveCompanionAcceptanceTurn } from "./companionIntelligenceRouter";
import {
  detectWorkflowOwnerFromAssistant,
  getActiveWorkflowOwner,
  filteredOutcomeThreadForAcceptance,
  workflowOwnerBlocksStrategyPending,
} from "./workflowOwnershipAuthority";
import { saveFrictionlessPending, loadFrictionlessPending, clearFrictionlessPending } from "./frictionlessActionLayer";

describe("workflowOwnershipAuthority", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    clearOutcomeThread();
    clearFrictionlessPending();
  });

  it("detects learning workflow from learn-more consent", () => {
    const owner = detectWorkflowOwnerFromAssistant(
      "Would you like to learn more about treatment options?",
    );
    expect(owner?.owner).toBe("learning_workflow");
  });

  it("detects reminder workflow from intake question", () => {
    const owner = detectWorkflowOwnerFromAssistant(
      "When would you like me to remind you?",
    );
    expect(owner?.owner).toBe("reminder_workflow");
  });

  it("detects artifact execution workflow from PDF offer", () => {
    const owner = detectWorkflowOwnerFromAssistant(
      "Shall I create the PDF now?",
    );
    expect(owner?.owner).toBe("artifact_execution_workflow");
  });

  it("detects create workflow from opening-line question", () => {
    const owner = detectWorkflowOwnerFromAssistant(
      "Would you like to use this opening line?",
    );
    expect(owner?.owner).toBe("create_workflow");
  });

  it("detects strategy workflow from strategy offer", () => {
    const owner = detectWorkflowOwnerFromAssistant(
      "The **Start Ugly** strategy may help. Would you like to use it?",
    );
    expect(owner?.owner).toBe("strategy_workflow");
  });

  it("yes on learn-more does not resume stale Strategic Direction", () => {
    patchOutcomeThread({
      pendingDecision: "Strategic direction decision",
      currentProblem: "Growth path",
    });
    const thread = filteredOutcomeThreadForAcceptance(
      detectWorkflowOwnerFromAssistant(
        "Would you like to learn more about treatment options?",
      ),
      patchOutcomeThread({ pendingDecision: "Strategic direction decision" }),
    );
    expect(thread?.pendingDecision).toBeUndefined();

    const resolution = resolveCompanionAcceptanceTurn({
      userText: "yes",
      lastAssistantText: "Would you like to learn more about treatment options?",
      currentTurn: 4,
      workflow: null,
      outcomeThread: patchOutcomeThread({
        pendingDecision: "Strategic direction decision",
      }),
      pendingInput: {
        workspacePanel: null,
        record: null,
        pendingAction: null,
        createConsent: null,
      },
    });
    expect(resolution.kind).toBe("workflow");
    if (resolution.kind === "workflow") {
      expect(resolution.continuation.message).toMatch(/keep learning/i);
      expect(resolution.continuation.message).not.toMatch(
        /strategic direction/i,
      );
    }
  });

  it("yes on reminder intake does not resume Strategic Direction", () => {
    const reply = threadAwareAcceptanceFallback(
      patchOutcomeThread({ pendingDecision: "Strategic direction decision" }),
      "When would you like me to remind you?",
    );
    expect(reply).toMatch(/when would you like me to remind you/i);
    expect(reply).not.toMatch(/strategic direction/i);
  });

  it("yes on create question does not resume Strategic Direction", () => {
    const resolution = resolveCompanionAcceptanceTurn({
      userText: "yes",
      lastAssistantText: "Would you like to use this opening line?",
      currentTurn: 3,
      workflow: null,
      outcomeThread: patchOutcomeThread({
        pendingDecision: "Strategic direction decision",
      }),
      pendingInput: {
        workspacePanel: null,
        record: null,
        pendingAction: null,
        createConsent: null,
      },
    });
    expect(resolution.kind).toBe("workflow");
    if (resolution.kind === "workflow") {
      expect(resolution.continuation.message).toMatch(/keep building/i);
      expect(resolution.continuation.message).not.toMatch(
        /strategic direction/i,
      );
    }
  });

  it("blocks stale strategy pending when reminder workflow owns the turn", () => {
    saveFrictionlessPending({
      type: "strategy_offer",
      target: "playbook",
      context: "ugly-first-draft",
      strategyId: "ugly-first-draft",
      strategyTitle: "Start Ugly",
      initialPrompt: "I keep putting off my sales calls.",
      offeredAtTurn: 1,
      offerSummary: "Use Start Ugly",
    });
    expect(loadFrictionlessPending()).not.toBeNull();

    const owner = getActiveWorkflowOwner({
      lastAssistantText: "When would you like me to remind you?",
      reminderIntakeActive: true,
    });
    expect(workflowOwnerBlocksStrategyPending(owner)).toBe(true);
  });

  it("allows strategy continuation when strategy workflow owns the turn", () => {
    const owner = getActiveWorkflowOwner({
      lastAssistantText:
        "The **Start Ugly** strategy may help. Would you like to use it?",
    });
    expect(owner?.owner).toBe("strategy_workflow");
    expect(workflowOwnerBlocksStrategyPending(owner)).toBe(false);
  });
});
