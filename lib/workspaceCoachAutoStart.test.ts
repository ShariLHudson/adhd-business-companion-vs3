import { describe, expect, it } from "vitest";
import {
  buildWorkspaceCoachAutoStart,
  workspaceCoachSeedKey,
} from "./workspaceCoachAutoStart";
import type { WorkspaceContext } from "./workspaceAwareness";

describe("workspaceCoachAutoStart", () => {
  it("delegates project detail coaching", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "projects",
      title: "Projects",
      view: "detail",
      selectedItemName: "Untitled project",
      selectedItemId: "p1",
    } as WorkspaceContext);
    expect(msg?.content).toContain("doesn't have a title");
  });

  it("coaches brain dump capture mode", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "brain-dump",
      title: "Clear My Mind",
      view: "capture",
      stage: "capture session",
    } as WorkspaceContext);
    expect(msg?.content).toContain("first thing on your mind");
  });

  it("coaches brain dump library mode", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "brain-dump",
      title: "Clear My Mind",
      view: "library",
      stage: "library",
    } as WorkspaceContext);
    expect(msg?.content).toContain("saved items");
  });

  it("coaches strategies workspace", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "playbook",
      title: "Strategies",
    } as WorkspaceContext);
    expect(msg?.content).toContain("Strategies");
  });

  it("builds stable seed keys per workspace", () => {
    const ctx = {
      section: "brain-dump",
      title: "Clear My Mind",
      view: "capture",
      stage: "capture session",
    } as WorkspaceContext;
    expect(workspaceCoachSeedKey(ctx)).toBe("brain-dump:capture:capture session");
  });
});
