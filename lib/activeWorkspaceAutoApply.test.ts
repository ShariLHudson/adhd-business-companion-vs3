import { describe, expect, it } from "vitest";

import {
  activeWorkspaceAutoApplyHint,
  AUTO_APPLY_WORKSPACE_SECTIONS,
  isActiveWorkspaceAutoApplyMode,
  isAutoApplyWorkspaceSection,
  shouldBlockAutoApplyFromChat,
} from "./activeWorkspaceAutoApply";
import { shouldBlockDraftPanelFromChat } from "./draftPermissionGate";
import { inferWorkspaceChatFill } from "./workspaceAwareness";
import { buildWorkspaceContext } from "./workspaceAwareness";

describe("activeWorkspaceAutoApply", () => {
  it("covers the primary co-work workspaces", () => {
    expect(AUTO_APPLY_WORKSPACE_SECTIONS).toEqual(
      expect.arrayContaining([
        "client-avatars",
        "projects",
        "playbook",
        "content-generator",
      ]),
    );
  });

  it("blocks brainstorming from auto-apply", () => {
    const brainstorm =
      "I need some ideas to create a FB social media post but I don't have any ideas.";
    expect(shouldBlockAutoApplyFromChat(brainstorm)).toBe(true);
    expect(
      isActiveWorkspaceAutoApplyMode("client-avatars", brainstorm),
    ).toBe(false);
  });

  it("conversation-only mode blocks auto-apply even with substantive content", () => {
    const msg =
      "My ideal client is a 35-year-old entrepreneur with ADHD who runs a service business.";
    expect(isActiveWorkspaceAutoApplyMode("client-avatars", msg)).toBe(false);
    expect(
      shouldBlockDraftPanelFromChat(msg, "", {
        activeWorkspaceSection: "client-avatars",
      }),
    ).toBe(false);
  });

  it("hint tells model chat is conversation only when workspace is open", () => {
    expect(activeWorkspaceAutoApplyHint("client-avatars")).toMatch(
      /conversation only/i,
    );
    expect(activeWorkspaceAutoApplyHint("content-generator")).toMatch(
      /conversation only/i,
    );
  });

  it("does not silently infer client avatar fills without approval", () => {
    const ctx = buildWorkspaceContext("client-avatars", null)!;
    const fill = inferWorkspaceChatFill(
      ctx,
      "Women 40-55 who feel stuck marketing their coaching business.",
      "Tell me about the person you help most often.",
    );
    expect(fill).toBeNull();
  });

  it("does not treat how-to as auto-apply workspace", () => {
    expect(isAutoApplyWorkspaceSection("how-do-i")).toBe(false);
  });
});
