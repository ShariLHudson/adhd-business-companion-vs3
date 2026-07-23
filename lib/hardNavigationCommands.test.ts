import { describe, expect, it } from "vitest";
import { buildRelationshipLeadParagraph } from "./relationshipResponseContract";
import {
  hardNavigationActiveWorkspace,
  isHardNavigationCommand,
  resolveHardNavigationCommand,
} from "./hardNavigationCommands";

describe("hardNavigationCommands", () => {
  it("open create → estate create section", () => {
    expect(hardNavigationActiveWorkspace("open create")).toBe("create");
    expect(resolveHardNavigationCommand("open create")?.localReply).toBe(
      "Opening Create.",
    );
  });

  it("go to create → estate create section", () => {
    expect(hardNavigationActiveWorkspace("go to create")).toBe("create");
  });

  it("take me to create and create mode variants", () => {
    expect(hardNavigationActiveWorkspace("take me to create")).toBe("create");
    expect(hardNavigationActiveWorkspace("create mode")).toBe("create");
    expect(hardNavigationActiveWorkspace("open create mode")).toBe("create");
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

  it("open focus audio / peaceful moments → focus-audio", () => {
    expect(hardNavigationActiveWorkspace("open focus audio")).toBe(
      "focus-audio",
    );
    expect(hardNavigationActiveWorkspace("take me to peaceful moments")).toBe(
      "focus-audio",
    );
    expect(hardNavigationActiveWorkspace("take me to Peaceful Places")).toBe(
      "focus-audio",
    );
  });

  it("open soundscapes / calm audio / music for focus → focus-audio", () => {
    expect(hardNavigationActiveWorkspace("open soundscapes")).toBe(
      "focus-audio",
    );
    expect(hardNavigationActiveWorkspace("open soundscape")).toBe(
      "focus-audio",
    );
    expect(hardNavigationActiveWorkspace("open calm audio")).toBe(
      "focus-audio",
    );
    expect(hardNavigationActiveWorkspace("open calming audio")).toBe(
      "focus-audio",
    );
    expect(hardNavigationActiveWorkspace("open music for focus")).toBe(
      "focus-audio",
    );
  });

  it("music room is not hard-nav aliased to Peaceful Moments", () => {
    expect(resolveHardNavigationCommand("go to music room")).toBeNull();
    expect(resolveHardNavigationCommand("go to the music room")).toBeNull();
    expect(hardNavigationActiveWorkspace("go to music room")).toBeNull();
  });

  it("take me to talk it out → talk-it-out", () => {
    expect(hardNavigationActiveWorkspace("take me to talk it out")).toBe(
      "talk-it-out",
    );
    expect(hardNavigationActiveWorkspace("open Talk It Out")).toBe(
      "talk-it-out",
    );
  });

  it("take me to spark estate guide → guide (hard nav, no workspace section)", () => {
    expect(
      resolveHardNavigationCommand("take me to spark estate guide")?.target
        .kind,
    ).toBe("spark-estate-guide");
    expect(hardNavigationActiveWorkspace("take me to the Estate Guide")).toBe(
      null,
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
