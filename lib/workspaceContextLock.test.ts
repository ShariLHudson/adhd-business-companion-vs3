import { describe, expect, it } from "vitest";
import {
  buildActiveWorkspacePriorityHint,
  isExplicitWorkspaceSwitchRequest,
  resolveWorkspaceAdvisorRole,
  shouldSuppressCrossWorkspaceNavigation,
  tryStrategyWorkspaceLocalReply,
} from "./workspaceContextLock";
import type { WorkspaceContext } from "./workspaceAwareness";

const snap = {
  panel: "playbook" as const,
  activeSection: "home" as const,
  revealSeq: 1,
};

describe("workspaceContextLock", () => {
  it("suppresses cross-workspace navigation when locked", () => {
    expect(
      shouldSuppressCrossWorkspaceNavigation(
        "playbook",
        "content-generator",
        "What would help with procrastination?",
        snap,
      ),
    ).toBe(true);
    expect(
      shouldSuppressCrossWorkspaceNavigation(
        "playbook",
        "content-generator",
        "Open Create and write a sales page",
        snap,
      ),
    ).toBe(false);
  });

  it("detects explicit switch requests", () => {
    expect(isExplicitWorkspaceSwitchRequest("open create")).toBe(true);
    expect(isExplicitWorkspaceSwitchRequest("help with procrastination")).toBe(
      false,
    );
  });

  it("builds priority hint for open strategies", () => {
    const ctx = {
      section: "playbook",
      title: "Strategies",
      selectedItemName: "Body Double",
    } as WorkspaceContext;
    const hint = buildActiveWorkspacePriorityHint(
      ctx,
      "procrastination",
      snap,
    );
    expect(hint).toContain("LOCKED WORKSPACE");
    expect(hint).toContain("STRATEGIES MODE");
    expect(hint).toContain("Body Double");
  });

  it("routes advisor by message and workspace", () => {
    expect(resolveWorkspaceAdvisorRole("I need to market my business")).toBe(
      "marketing",
    );
    expect(resolveWorkspaceAdvisorRole("I keep procrastinating")).toBe(
      "mindset",
    );
    expect(resolveWorkspaceAdvisorRole("hello", "projects")).toBe("planning");
  });

  it("replies locally for procrastination in strategies", () => {
    const ctx = { section: "playbook", title: "Strategies" } as WorkspaceContext;
    const reply = tryStrategyWorkspaceLocalReply(
      ctx,
      "What would help with procrastination?",
    );
    expect(reply).toContain("Strategies");
    expect(reply).toContain("procrastination");
  });
});
