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

  it("downgrades workspace_open to chat_only with full suppressions", () => {
    const next = enforceConversationOnlyTurnSurface(BASE_SURFACE);
    expect(next.outcome).toBe("chat_only");
    expect(next.targetSection).toBeUndefined();
    expect(next.suppressWorkspaceRouting).toBe(true);
    expect(next.suppressArtifactHandoff).toBe(true);
    expect(next.promptHints.join(" ")).toContain("CHAT ROLE RESET");
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
