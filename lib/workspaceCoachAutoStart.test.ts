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
    expect(msg?.content).toContain("loudest thought");
  });

  it("coaches brain dump library mode", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "brain-dump",
      title: "Clear My Mind",
      view: "library",
      stage: "library",
    } as WorkspaceContext);
    expect(msg?.content).toContain("saved thoughts");
  });

  it("coaches strategies workspace with strategy name", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "playbook",
      title: "Strategies",
      selectedItemName: "Body Double",
    } as WorkspaceContext);
    expect(msg?.content).toContain("Body Double");
    expect(msg?.content).toContain("apply");
  });

  it("opens strategies without a selected strategy", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "playbook",
      title: "Strategies",
    } as WorkspaceContext);
    expect(msg?.content).toContain("Strategies");
    expect(msg?.content).toContain("challenge");
  });

  it("opens create with a direct outcome question", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "content-generator",
      title: "Create",
    } as WorkspaceContext);
    expect(msg?.content).toBe("What would you like to create?");
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

  it("does not coach Create when split-screen builder is active", () => {
    expect(
      buildWorkspaceCoachAutoStart(
        { section: "content-generator", title: "Create" } as WorkspaceContext,
        {
          splitScreenCreateActive: true,
          creationContext: {
            section: "content-generator",
            itemType: "Social Post",
            title: "",
            draftContent: "",
            stage: "discovery with Shari",
            artifactTypeLocked: false,
          },
        },
      ),
    ).toBeNull();
  });

  it("does not treat item type as topic for brief coaching", () => {
    const msg = buildWorkspaceCoachAutoStart(
      { section: "content-generator", title: "Create" } as WorkspaceContext,
      {
        creationContext: {
          section: "content-generator",
          itemType: "Social Post",
          title: "Social Post",
          draftContent: "",
          stage: "discovery with Shari",
          artifactTypeLocked: false,
        },
      },
    );
    expect(msg?.content).toContain("who is it for");
  });

  it("never coaches unresolved content placeholder as a type", () => {
    const msg = buildWorkspaceCoachAutoStart(
      { section: "content-generator", title: "Create" } as WorkspaceContext,
      {
        creationContext: {
          section: "content-generator",
          itemType: "content",
          title: "Create with Shari",
          draftContent: "",
          stage: "choosing what to create",
          artifactTypeLocked: false,
        },
      },
    );
    expect(msg?.content).toBe("What would you like to create?");
    expect(msg?.content).not.toContain("creating");
  });
});
