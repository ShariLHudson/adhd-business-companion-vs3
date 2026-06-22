import { describe, expect, it } from "vitest";
import {
  resolveWorkspaceOwnershipState,
  scrubFalseContentClaims,
  scrubAssistantWorkspaceMessages,
  workspaceOwnershipHintForChat,
} from "./workspaceOwnership";

describe("workspaceOwnership", () => {
  const baseSnap = {
    panel: "content-generator" as const,
    activeSection: "home" as const,
    revealSeq: 1,
  };

  it("describes chat, workspace, and unsaved draft locations", () => {
    const state = resolveWorkspaceOwnershipState({
      snap: baseSnap,
      creationContext: {
        itemType: "Blog Post",
        title: "My post",
        draftContent: "Hello world",
        stage: "draft",
        brief: "",
        linkedProjectName: null,
        artifactTypeLocked: false,
      },
    });
    const hint = workspaceOwnershipHintForChat(state);
    expect(hint).toMatch(/CHAT/);
    expect(hint).toMatch(/Unsaved draft/);
    expect(hint).toMatch(/NEVER claim content was added/);
  });

  it("scrubs false save claims in chat-only mode", () => {
    const state = resolveWorkspaceOwnershipState({ snap: baseSnap });
    const msg = "Great — I've saved that to your draft and updated the title.";
    const scrubbed = scrubFalseContentClaims(msg, state);
    expect(scrubbed).not.toMatch(/I've saved/i);
    expect(scrubbed).toMatch(/copy what you want/i);
  });

  it("allows claims when auto-transfer is verified for the turn", () => {
    const state = resolveWorkspaceOwnershipState({
      snap: baseSnap,
      allowAutoTransferThisTurn: true,
    });
    const msg = "Done — I added that to your audience field.";
    expect(scrubFalseContentClaims(msg, state, { allowClaimsThisTurn: true })).toBe(
      msg,
    );
  });

  it("combines workspace visibility and content claim scrubbing", () => {
    const closedSnap = {
      panel: null,
      activeSection: "home" as const,
      revealSeq: 0,
    };
    const state = resolveWorkspaceOwnershipState({ snap: closedSnap });
    const msg =
      "**Create** is open beside us. I've saved your outline to the draft.";
    const scrubbed = scrubAssistantWorkspaceMessages(msg, closedSnap, state);
    expect(scrubbed).not.toMatch(/Create\*\* is open/i);
    expect(scrubbed).not.toMatch(/I've saved/i);
  });
});
