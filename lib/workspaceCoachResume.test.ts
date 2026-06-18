import { describe, expect, it } from "vitest";
import {
  shouldResumeWorkspaceCoach,
  workspaceCoachResumeSeedKey,
} from "./workspaceCoachResume";
import { buildWorkspaceContext } from "./workspaceAwareness";

describe("workspaceCoachResume", () => {
  const projectCtx = buildWorkspaceContext("projects", {
    view: "detail",
    selectedItemId: "proj-42",
    selectedItemName: "Newsletter Launch",
  })!;

  it("resumes when an active project is open", () => {
    expect(
      shouldResumeWorkspaceCoach({
        sourceSection: "projects",
        ctx: projectCtx,
        projectCoachActive: false,
        businessStrategyActive: false,
        chatHasProjectContext: false,
        seededKey: null,
      }),
    ).toBe(true);
  });

  it("resumes when project coach session is active", () => {
    expect(
      shouldResumeWorkspaceCoach({
        sourceSection: "projects",
        ctx: null,
        projectCoachActive: true,
        businessStrategyActive: false,
        chatHasProjectContext: false,
        seededKey: null,
      }),
    ).toBe(true);
  });

  it("does not restart when chat already has project context", () => {
    expect(
      shouldResumeWorkspaceCoach({
        sourceSection: "projects",
        ctx: null,
        projectCoachActive: false,
        businessStrategyActive: false,
        chatHasProjectContext: true,
        seededKey: null,
      }),
    ).toBe(true);
  });

  it("starts fresh when no project session exists", () => {
    expect(
      shouldResumeWorkspaceCoach({
        sourceSection: "projects",
        ctx: buildWorkspaceContext("projects", { view: "list" }),
        projectCoachActive: false,
        businessStrategyActive: false,
        chatHasProjectContext: false,
        seededKey: null,
      }),
    ).toBe(false);
  });

  it("resumes when coach was already seeded for this workspace", () => {
    const seed = workspaceCoachResumeSeedKey(projectCtx);
    expect(seed).toBe("project:proj-42:");
    expect(
      shouldResumeWorkspaceCoach({
        sourceSection: "client-avatars",
        ctx: buildWorkspaceContext("client-avatars", {
          view: "detail",
          selectedItemId: "av1",
        }),
        projectCoachActive: false,
        businessStrategyActive: false,
        chatHasProjectContext: false,
        seededKey: "client-avatars:av1",
      }),
    ).toBe(true);
  });

  it("resumes business strategy session on playbook", () => {
    expect(
      shouldResumeWorkspaceCoach({
        sourceSection: "playbook",
        ctx: buildWorkspaceContext("playbook", {}),
        projectCoachActive: false,
        businessStrategyActive: true,
        chatHasProjectContext: false,
        seededKey: null,
      }),
    ).toBe(true);
  });
});
