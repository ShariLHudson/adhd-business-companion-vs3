import { describe, expect, it } from "vitest";
import { mapTextToWorkspace } from "./workspaceMapper";

describe("workspaceMapper", () => {
  it("maps SOP to Create with scaffold", () => {
    const mapped = mapTextToWorkspace({ text: "Create an SOP for onboarding" });
    expect(mapped.actionType).toBe("open-create");
    expect(mapped.workspace.section).toBe("content-generator");
    expect(mapped.workspace.itemType).toBe("SOP");
    expect(mapped.prefill.draftScaffold).toContain("Purpose");
  });

  it("maps client avatar to Client Avatar builder", () => {
    const mapped = mapTextToWorkspace({ text: "Build a client avatar" });
    expect(mapped.workspace.section).toBe("client-avatars");
    expect(mapped.prefill.itemType).toBe("Client Avatar");
  });

  it("maps focus recommendation to Focus Audio", () => {
    const mapped = mapTextToWorkspace({
      text: "Block focus time for the funnel",
      projectTitle: "Launch Funnel",
      durationMinutes: 45,
    });
    expect(mapped.actionType).toBe("start-focus-session");
    expect(mapped.workspace.section).toBe("focus-audio");
  });

  it("maps time block scheduling to Time Block", () => {
    const mapped = mapTextToWorkspace({
      text: "Schedule time block for funnel work",
      projectTitle: "ADHD Ecosystem",
      durationMinutes: 60,
    });
    expect(mapped.actionType).toBe("open-time-block");
    expect(mapped.workspace.section).toBe("time-block");
  });

  it("maps project review to Projects", () => {
    const mapped = mapTextToWorkspace({
      text: "Review project progress on ADHD Ecosystem",
      projectTitle: "ADHD Ecosystem",
    });
    expect(mapped.workspace.section).toBe("projects");
    expect(mapped.prefill.projectTitle).toBe("ADHD Ecosystem");
  });
});
