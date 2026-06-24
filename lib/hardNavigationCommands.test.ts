import { describe, expect, it } from "vitest";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";
import {
  hardNavigationActiveWorkspace,
  isHardNavigationCommand,
  resolveHardNavigationCommand,
} from "./hardNavigationCommands";

describe("hardNavigationCommands", () => {
  it("open create → content-generator", () => {
    expect(hardNavigationActiveWorkspace("open create")).toBe("content-generator");
    expect(resolveHardNavigationCommand("open create")?.localReply).toBe(
      "Opening Create.",
    );
  });

  it("go to create → content-generator", () => {
    expect(hardNavigationActiveWorkspace("go to create")).toBe(
      "content-generator",
    );
  });

  it("take me to create and create mode variants", () => {
    expect(hardNavigationActiveWorkspace("take me to create")).toBe(
      "content-generator",
    );
    expect(hardNavigationActiveWorkspace("create mode")).toBe(
      "content-generator",
    );
    expect(hardNavigationActiveWorkspace("open create mode")).toBe(
      "content-generator",
    );
  });

  it("open decision compass → decision-compass", () => {
    expect(hardNavigationActiveWorkspace("open decision compass")).toBe(
      "decision-compass",
    );
  });

  it("open clear my mind → brain-dump", () => {
    expect(hardNavigationActiveWorkspace("open clear my mind")).toBe(
      "brain-dump",
    );
  });

  it("open focus audio → focus-audio", () => {
    expect(hardNavigationActiveWorkspace("open focus audio")).toBe(
      "focus-audio",
    );
  });

  it("open plan my day and adapt my day", () => {
    expect(hardNavigationActiveWorkspace("open plan my day")).toBe(
      "plan-my-day",
    );
    expect(hardNavigationActiveWorkspace("open adapt my day")).toBe("energy");
  });

  it("open strategies and saved", () => {
    expect(hardNavigationActiveWorkspace("open strategies")).toBe("playbook");
    expect(hardNavigationActiveWorkspace("open saved")).toBe("saved-work");
  });

  it("allows trailing punctuation", () => {
    expect(isHardNavigationCommand("open create.")).toBe(true);
    expect(isHardNavigationCommand("go to create!")).toBe(true);
  });

  it("does not match embedded navigation phrases", () => {
    expect(isHardNavigationCommand("can you open create for me")).toBe(false);
    expect(isHardNavigationCommand("I want to open create later")).toBe(false);
  });

  it("no relationship response for navigation commands", () => {
    const cmd = resolveHardNavigationCommand("open create");
    expect(cmd?.suppressRelationship).toBe(true);
    expect(
      buildRelationshipLeadParagraph("open create", new Date(), {
        suppressForRouting: false,
      }),
    ).not.toBeNull();
    expect(
      buildRelationshipLeadParagraph("open create", new Date(), {
        suppressForRouting: true,
      }),
    ).toBeNull();
  });

  it("no API call for navigation commands", () => {
    const samples = [
      "open create",
      "open decision compass",
      "open clear my mind",
      "open focus audio",
    ];
    for (const text of samples) {
      const cmd = resolveHardNavigationCommand(text);
      expect(cmd?.callsApi).toBe(false);
      expect(cmd?.suppressObservation).toBe(true);
    }
  });
});
