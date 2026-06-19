import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  evaluateCompanionTurn,
  governorAllowsArtifactHandoff,
  governorAllowsPreChatWorkspaceOpen,
  governorAuthorizedChatTurnOpen,
  governorBlocksChatTurnAutoOpen,
  governorSuppressesInterventionSurfaces,
} from "./companionGovernor";
import { resolveIntent } from "./intentStabilizer";
import * as createSessionStore from "./createSessionStore";
import type { WorkspaceOpenSnapshot } from "./workspaceExecution";

const SNAP: WorkspaceOpenSnapshot = {
  panel: null,
  activeSection: "home",
  revealSeq: 0,
};

function gov(text: string, lastAssistant = "") {
  return evaluateCompanionTurn({
    userText: text,
    lastAssistantText: lastAssistant,
    workspacePanel: null,
    workspaceSnap: SNAP,
    resolvedIntent: resolveIntent(text),
  });
}

describe("companionGovernor", () => {
  beforeEach(() => {
    vi.spyOn(createSessionStore, "hasActiveCreateSession").mockReturnValue(false);
  });

  it("1 — Facebook post ideas → chat_only", () => {
    const s = gov("I need ideas for a Facebook post");
    expect(s.outcome).toBe("chat_only");
    expect(s.suppressWorkspaceRouting).toBe(true);
    expect(s.suppressArtifactHandoff).toBe(true);
    expect(governorAllowsPreChatWorkspaceOpen(s, "content-generator")).toBe(false);
  });

  it("2 — I like idea #3 → chat_only", () => {
    const s = gov("I like idea #3");
    expect(s.outcome).toBe("chat_only");
    expect(s.suppressArtifactHandoff).toBe(true);
  });

  it("3 — Now draft it → workspace_open Create", () => {
    const s = gov(
      "Now draft it",
      "Would you like me to draft this for you?",
    );
    expect(s.outcome).toBe("workspace_open");
    expect(s.targetSection).toBe("content-generator");
    expect(governorAllowsArtifactHandoff(s)).toBe(true);
  });

  it("4 — I am stressed → chat_only", () => {
    const s = gov("I am stressed and can't handle this");
    expect(s.outcome).toBe("chat_only");
    expect(s.suppressCards).toBe(true);
    expect(s.lane).toBe("emotional_support");
  });

  it("5 — How do I find games? → companion_first, allows offer cards", () => {
    const s = gov("How do I find the games?");
    expect(s.outcome).toBe("chat_only");
    expect(s.lane).toBe("companion_first");
    expect(s.suppressCards).toBe(false);
    expect(s.promptHints.join(" ")).toMatch(/APP FEATURE KNOWLEDGE|Momentum Games/i);
    expect(s.promptHints.join(" ")).toMatch(/COMPANION FIRST/i);
  });

  it("teach me sales funnel → teaching mode, not article dump", () => {
    const s = gov("Teach me what a sales funnel is and how to use it.");
    expect(s.outcome).toBe("chat_only");
    expect(s.lane).toBe("teaching");
    expect(s.suppressCards).toBe(true);
    expect(s.promptHints.join(" ")).toMatch(/TEACHING MODE/i);
    expect(s.promptHints.join(" ")).toMatch(/Do NOT write a long guide/i);
  });

  it("path pick after teaching menu → teaching continuation", () => {
    const menu =
      "A sales funnel is simply the journey from hearing about you to becoming a customer.\n\nWould you like:\n1. Simple explanation\n2. Real-world example\n3. Apply to my business\n4. Build one together";
    const s = gov("Build one together", menu);
    expect(s.lane).toBe("teaching");
    expect(s.promptHints.join(" ")).toMatch(/one stage at a time/i);
  });

  it("6 — Open Momentum Games → tool_open", () => {
    const s = gov("Open Momentum Games");
    expect(s.outcome).toBe("tool_open");
    expect(s.targetTool).toBe("games");
    expect(governorAuthorizedChatTurnOpen(s)).toBe(true);
    expect(governorBlocksChatTurnAutoOpen(s)).toBe(false);
  });

  it("7 — Help me prioritize my week → chat_only", () => {
    const s = gov("Help me prioritize my week");
    expect(s.outcome).toBe("chat_only");
    expect(s.lane).toBe("prioritize");
  });

  it("8 — I have three things to do → chat_only", () => {
    const s = gov("I have three things to do and don't know where to start");
    expect(s.outcome).toBe("chat_only");
    expect(s.suppressWorkspaceRouting).toBe(true);
  });

  it("9 — Resume my draft → workspace_open only if saved draft exists", () => {
    vi.spyOn(createSessionStore, "hasActiveCreateSession").mockReturnValue(true);
    const yes = gov("Resume my draft");
    expect(yes.outcome).toBe("workspace_open");
    expect(yes.targetSection).toBe("content-generator");
    expect(yes.suppressRestore).toBe(false);

    vi.spyOn(createSessionStore, "hasActiveCreateSession").mockReturnValue(false);
    const no = gov("Resume my draft");
    expect(no.outcome).toBe("chat_only");
    expect(no.suppressRestore).toBe(true);
  });

  it("10 — Delete draft → no restore", () => {
    vi.spyOn(createSessionStore, "hasActiveCreateSession").mockReturnValue(true);
    const s = gov("Delete my draft");
    expect(s.outcome).toBe("chat_only");
    expect(s.suppressRestore).toBe(true);
    expect(governorAllowsPreChatWorkspaceOpen(s, "content-generator")).toBe(false);
  });

  it("11 — I am overwhelmed → distress master gate", () => {
    const s = gov("I am overwhelmed.");
    expect(s.outcome).toBe("chat_only");
    expect(s.suppressCards).toBe(true);
    expect(s.lane).toBe("emotional_support");
    expect(s.suppressWorkspaceRouting).toBe(true);
    expect(s.suppressArtifactHandoff).toBe(true);
    expect(
      governorSuppressesInterventionSurfaces({
        userText: "I am overwhelmed",
        lastAssistantText: "That sounds heavy.",
        workspacePanel: null,
        workspaceSnap: SNAP,
        resolvedIntent: resolveIntent("I am overwhelmed"),
      }),
    ).toBe(true);
  });

  it("concept question during create builder → active_workflow, not teaching", () => {
    const s = evaluateCompanionTurn({
      userText: "What is a positioning statement?",
      lastAssistantText: "**Who is the target audience?**",
      workspacePanel: "content-generator",
      workspaceSnap: { ...SNAP, panel: "content-generator", revealSeq: 1 },
      resolvedIntent: resolveIntent("What is a positioning statement?"),
      createBuilderActive: true,
      workflowContext: {
        createBuilderSession: {
          typeLabel: "Business Strategy",
          workflow: {
            step: "discovery",
            discoveryAnswers: {},
            itemType: "Business Strategy",
            categoryId: "strategy",
            readinessConfirmed: false,
            buildApproved: false,
            draftStatus: "idle",
            questionMode: "split_screen",
          },
          phase: "discovery",
        },
      },
    });
    expect(s.outcome).toBe("active_workflow");
    expect(s.lane).toBe("active_workflow");
    expect(s.lane).not.toBe("teaching");
    expect(s.promptHints.join(" ")).toMatch(/ACTIVE WORKFLOW CONTEXT LOCK/i);
    expect(s.promptHints.join(" ")).not.toMatch(/TEACHING MODE \(mandatory/);
  });
});
