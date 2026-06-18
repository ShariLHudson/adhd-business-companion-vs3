import { describe, expect, it } from "vitest";
import {
  classifyWorkspaceConversationMode,
  discoveryModeHintForChat,
  isWorkspaceDiscoveryRequest,
  WORKSPACE_DISCOVERY_APPROVAL_PROMPT,
} from "./messageClassification";
import { classifyWorkspaceIntent } from "./workspaceIntent";
import { inferWorkspaceChatFill } from "./workspaceAwareness";
import { resolveProjectCoachTurn, startProjectCoachSession } from "./projectCoachSession";
import type { WorkspaceContext } from "./workspaceAwareness";

const DISCOVERY_EXAMPLES = [
  "What do you think?",
  "Give me examples.",
  "What should I put here?",
  "What does research say?",
  "Help me brainstorm.",
];

describe("workspace discovery mode — Phase 3", () => {
  it.each(DISCOVERY_EXAMPLES)("detects discovery: %s", (text) => {
    expect(isWorkspaceDiscoveryRequest(text)).toBe(true);
    expect(classifyWorkspaceIntent(text).intent).toBe("discovery");
    expect(classifyWorkspaceConversationMode(text)).toBe("discovery");
  });

  it("does not treat discovery questions as field fills", () => {
    const ctx = {
      section: "client-avatars",
      title: "Client Avatars",
      view: "build",
      stage: "who",
      selectedItemName: "Coaches",
    } as WorkspaceContext;
    for (const text of DISCOVERY_EXAMPLES) {
      expect(inferWorkspaceChatFill(ctx, text, "")).toBeNull();
    }
  });

  it("discovery hint requires approval before save", () => {
    const hint = discoveryModeHintForChat({ fieldLabel: "Description" });
    expect(hint).toContain(WORKSPACE_DISCOVERY_APPROVAL_PROMPT);
    expect(hint).toMatch(/never.*field/i);
  });

  it("project coach does not save discovery questions as title", () => {
    const ctx = {
      section: "projects",
      title: "Projects",
      view: "detail",
      selectedItemId: "p1",
      selectedItemName: "Untitled project",
    } as WorkspaceContext;
    const session = startProjectCoachSession("title", ctx);
    const turn = resolveProjectCoachTurn(
      session,
      "What should I put here?",
      ctx,
      "",
    );
    expect(turn).toBeNull();
  });

  it("still allows substantive field content", () => {
    expect(classifyWorkspaceIntent("ADHD Business Momentum Workshop").intent).toBe(
      "fieldContent",
    );
  });

  it("classifies approval separately from discovery", () => {
    expect(classifyWorkspaceConversationMode("Use that.")).toBe("approval");
    expect(classifyWorkspaceConversationMode("next")).toBe("navigation");
  });
});
