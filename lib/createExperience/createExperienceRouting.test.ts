import { describe, expect, it } from "vitest";
import {
  isMomentumForwardIntent,
  resolveImmediateCreateAction,
  resolveImmediateCreateProjectAction,
  resolveImmediateMomentumAction,
} from "./createExperienceRouting";

describe("createExperienceRouting", () => {
  it("resolves SOP create intent with immediate copy", () => {
    const action = resolveImmediateCreateAction("help me create an SOP");
    expect(action?.artifact.itemType).toMatch(/sop/i);
    expect(action?.followUpLine).toMatch(/Create/i);
    expect(action?.followUpLine).toMatch(/SOP/i);
    expect(action?.followUpLine).not.toMatch(/take us there/i);
  });

  it("resolves email write intent", () => {
    const action = resolveImmediateCreateAction("help me write an email");
    expect(action?.artifact.itemType).toMatch(/email/i);
    expect(action?.followUpLine).toMatch(/email/i);
  });

  it("routes new project to Create experience", () => {
    expect(isMomentumForwardIntent("create a new project")).toBe(false);
    expect(resolveImmediateCreateAction("create a new project")).toBeNull();
    const project = resolveImmediateCreateProjectAction("create a new project");
    expect(project?.experienceId).toBe("create");
    expect(project?.estatePlaceId).toBe("creative-studio");
  });
});
