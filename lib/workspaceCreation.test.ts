import { describe, expect, it } from "vitest";
import {
  bootstrapSessionForExistingDraft,
  buildCreationWorkspaceOpenMessage,
  formatCreationContextForPrompt,
  toCreationContext,
} from "./workspaceCreation";
import { createWorkspaceSession } from "./workspaceSop";

describe("workspaceCreation", () => {
  it("formats creation context with draft and rules", () => {
    const ctx = toCreationContext("content-generator", {
      itemType: "Marketing Plan",
      title: "Plan about the next 5 days",
      draftContent: "Day 1: ...",
      stage: "editing draft",
      source: "generated",
    });
    const block = formatCreationContextForPrompt(ctx)!;
    expect(block).toContain("Artifact type: Marketing Plan");
    expect(block).toContain("Draft exists: yes");
    expect(block).toContain("Day 1:");
    expect(block).toContain("source of truth");
  });

  it("opens with a collaborative message when draft exists", () => {
    const msg = buildCreationWorkspaceOpenMessage(
      toCreationContext("content-generator", {
        itemType: "Marketing Plan",
        title: "5-day plan",
        draftContent: "content",
      }),
    );
    expect(msg).toContain("draft beside us");
    expect(msg).toContain("Marketing Plan");
  });

  it("bootstraps SOP session to draft step when draft exists", () => {
    const session = createWorkspaceSession(
      "content-generator",
      "marketing plan",
      "medium",
    );
    const next = bootstrapSessionForExistingDraft(session);
    expect(next.currentStepId).toBe("content-draft");
    expect(next.completedStepIds).toContain("content-audience");
    expect(next.currentStepHint).toContain("already has a draft");
  });
});
