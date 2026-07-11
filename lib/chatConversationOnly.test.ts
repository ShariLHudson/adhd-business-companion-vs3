import { describe, expect, it } from "vitest";
import {
  CHAT_ACTION_DECLINE_LINE,
  CHAT_ROLE_RESET_HINT,
  enforceConversationOnlyTurnSurface,
  isChatConversationOnlyMode,
} from "./chatConversationOnly";
import type { TurnSurface } from "./companionGovernor";

const BASE_SURFACE: TurnSurface = {
  outcome: "workspace_open",
  targetSection: "content-generator",
  suppressWorkspaceRouting: false,
  suppressCards: true,
  suppressArtifactHandoff: false,
  suppressRestore: true,
  promptHints: [],
  lane: "explicit_open",
  arbitration: {
    decision: "route",
    activeWorkflow: "none",
    workspacePanel: null,
    workspaceLocked: false,
    workspaceBesideChat: false,
    blockAutoOpenDocument: false,
    blockAutoRouteAsset: false,
    blockIntentMake: false,
    blockIntentStabilize: false,
    blockIntentEditDraft: false,
  },
};

describe("chatConversationOnly", () => {
  it("is enabled by default", () => {
    expect(isChatConversationOnlyMode()).toBe(true);
  });

  it("preserves explicit workspace_open (#183 Universal Access)", () => {
    const next = enforceConversationOnlyTurnSurface(BASE_SURFACE);
    expect(next.outcome).toBe("workspace_open");
    expect(next.targetSection).toBe("content-generator");
    expect(next.suppressWorkspaceRouting).toBe(false);
    expect(next.promptHints.join(" ")).toContain("CHAT ROLE RESET");
  });

  it("preserves explicit tool_open", () => {
    const next = enforceConversationOnlyTurnSurface({
      ...BASE_SURFACE,
      outcome: "tool_open",
      targetTool: "games",
      targetSection: undefined,
    });
    expect(next.outcome).toBe("tool_open");
    expect(next.targetTool).toBe("games");
  });

  it("downgrades non-explicit outcomes to chat_only with suppressions", () => {
    const next = enforceConversationOnlyTurnSurface({
      ...BASE_SURFACE,
      outcome: "pending_offer",
      pendingOfferSection: "content-generator",
    });
    expect(next.outcome).toBe("chat_only");
    expect(next.targetSection).toBeUndefined();
    expect(next.suppressWorkspaceRouting).toBe(true);
    expect(next.suppressArtifactHandoff).toBe(true);
  });

  it("keeps active_workflow but blocks handoff", () => {
    const next = enforceConversationOnlyTurnSurface({
      ...BASE_SURFACE,
      outcome: "active_workflow",
    });
    expect(next.outcome).toBe("active_workflow");
    expect(next.suppressArtifactHandoff).toBe(true);
  });

  it("exposes the decline line for action requests", () => {
    expect(CHAT_ACTION_DECLINE_LINE).toMatch(/button in the workspace/i);
    expect(CHAT_ROLE_RESET_HINT).toMatch(/CONVERSATION ONLY/i);
  });
});
