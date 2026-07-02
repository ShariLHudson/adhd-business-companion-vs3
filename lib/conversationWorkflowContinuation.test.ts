import { describe, expect, it } from "vitest";
import {
  assistantOfferedConsent,
  continuationForWorkflow,
  createConversationWorkflow,
  inferConversationWorkflowFromAssistant,
  resolveConversationWorkflowAcceptance,
  resolveWorkflowFromLastAssistant,
} from "./conversationWorkflowContinuation";

describe("conversationWorkflowContinuation", () => {
  it("detects project list consent question", () => {
    const q =
      "Would you like to list those projects so we can start sorting through them together?";
    expect(assistantOfferedConsent(q)).toBe(true);
    expect(inferConversationWorkflowFromAssistant(q)?.kind).toBe("project_list");
  });

  it("continues project discernment after sure", () => {
    const assistant =
      "Would you like to list those projects so we can start sorting through them together?";
    const workflow = createConversationWorkflow(assistant, 2)!;
    const result = resolveConversationWorkflowAcceptance({
      userText: "Sure",
      lastAssistantText: assistant,
      workflow,
      currentTurn: 3,
    });
    expect(result?.action).toBe("reply");
    if (result?.action === "reply") {
      expect(result.message).toMatch(/projects you're considering/i);
    }
  });

  it("resolves workflow from last assistant without stored state", () => {
    const assistant =
      "Would you like to list those projects so we can start sorting through them together?";
    const result = resolveWorkflowFromLastAssistant("sure", assistant, 3);
    expect(result?.action).toBe("reply");
  });

  it("opens clear my mind beside chat after acceptance", () => {
    const assistant = "Want me to open Clear My Mind beside us?";
    const workflow = createConversationWorkflow(assistant, 1);
    expect(workflow?.kind).toBe("open_clear_my_mind");
    const result = resolveConversationWorkflowAcceptance({
      userText: "yes",
      lastAssistantText: assistant,
      workflow: workflow!,
      currentTurn: 2,
    });
    expect(result?.action).toBe("open_section");
    if (result?.action === "open_section") {
      expect(result.section).toBe("brain-dump");
      expect(result.message).toMatch(/sort through|on your mind|still here/i);
    }
  });

  it("opens My Thoughts beside chat after yes to task invitation", () => {
    const assistant =
      "Would you like to choose one small task from My Thoughts?";
    const workflow = createConversationWorkflow(assistant, 4);
    expect(workflow?.kind).toBe("open_my_thoughts");
    const result = resolveConversationWorkflowAcceptance({
      userText: "yes",
      lastAssistantText: assistant,
      workflow: workflow!,
      currentTurn: 5,
    });
    expect(result?.action).toBe("open_section");
    if (result?.action === "open_section") {
      expect(result.section).toBe("brain-dump");
      expect(result.clearMyMindView).toBe("my-thoughts");
      expect(result.message).toMatch(/doable|smallest honest start/i);
      expect(result.message).not.toMatch(/Picking up/i);
    }
  });

  it("continues focus task invitation without echoing prior user message", () => {
    const assistant = "Would you like to choose one small task to focus on right now?";
    const workflow = createConversationWorkflow(assistant, 2);
    expect(workflow?.kind).toBe("choose_focus_task");
    const result = resolveConversationWorkflowAcceptance({
      userText: "yes",
      lastAssistantText: assistant,
      workflow: workflow!,
      currentTurn: 3,
      outcomeThread: {
        currentProblem: "Picking up its only 9:30 am",
        updatedAt: new Date().toISOString(),
      },
    });
    expect(result?.action).toBe("reply");
    if (result?.action === "reply") {
      expect(result.message).toMatch(/one thing/i);
      expect(result.message).not.toMatch(/9:30/i);
      expect(result.message).not.toMatch(/Picking up/i);
    }
  });

  it("opens plan my day beside chat from invitation", () => {
    const assistant = "Would you like to open Plan My Day beside us?";
    const workflow = createConversationWorkflow(assistant, 1);
    expect(workflow?.kind).toBe("open_plan_my_day");
    const result = continuationForWorkflow(workflow!);
    expect(result.action).toBe("open_section");
    if (result.action === "open_section") {
      expect(result.section).toBe("plan-my-day");
      expect(result.message).toMatch(/today|lighter|still here/i);
    }
  });

  it("opens decision compass after acceptance", () => {
    const assistant = "Want me to open Decision Compass beside us?";
    const workflow = createConversationWorkflow(assistant, 1)!;
    const result = continuationForWorkflow(workflow);
    expect(result.action).toBe("open_section");
    if (result.action === "open_section") {
      expect(result.section).toBe("decision-compass");
    }
  });

  it("opens decision compass with pending decision context — no reset", () => {
    const assistant =
      "Would you like to walk through it in **Decision Compass** — comparing keep both, replace, or phasing in the group offer?";
    const result = resolveWorkflowFromLastAssistant("yes", assistant, 6, {
      pendingDecision: "keep current, replace, or offer both",
      updatedAt: new Date().toISOString(),
    });
    expect(result?.action).toBe("open_section");
    if (result?.action === "open_section") {
      expect(result.section).toBe("decision-compass");
      expect(result.message).toMatch(/keep current, replace, or offer both/i);
      expect(result.message).not.toMatch(/what(?:'s| is) the decision in front of you/i);
    }
  });

  it("opens workspace from companion-first offer line", () => {
    const assistant =
      "Want me to open **Snippets** beside us so we can do it together?";
    const workflow = createConversationWorkflow(assistant, 1);
    expect(workflow?.kind).toBe("open_workspace");
    const result = resolveWorkflowFromLastAssistant("sure", assistant, 2);
    expect(result?.action).toBe("open_section");
    if (result?.action === "open_section") {
      expect(result.section).toBe("snippets");
    }
  });

  it("opens focus audio after yes to open offer", () => {
    const assistant =
      "I can open Focus Audio for background audio. Want me to open it?";
    const workflow = createConversationWorkflow(assistant, 3);
    expect(workflow?.kind).toBe("open_focus_audio");
    const result = resolveWorkflowFromLastAssistant("yes", assistant, 4);
    expect(result?.action).toBe("open_tool");
    if (result?.action === "open_tool") {
      expect(result.tool).toBe("focus-audio");
      expect(result.message).toMatch(/Opening.*Focus Audio/i);
    }
  });

  it("does not treat unrelated yes as workflow acceptance", () => {
    const result = resolveWorkflowFromLastAssistant(
      "sure",
      "Here are three ideas for your newsletter.",
      2,
    );
    expect(result).toBeNull();
  });
});
