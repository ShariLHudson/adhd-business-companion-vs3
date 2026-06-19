import { describe, expect, it } from "vitest";
import {
  headerForWorkspaceSession,
  HOME_CHAT_SESSION_HEADER,
  workspaceSessionKey,
} from "./workspaceSessionHeader";

describe("workspaceSessionHeader", () => {
  const base = {
    calmHome: false,
    workspacePanel: null,
    companionStandaloneSection: null,
    activeSection: "home" as const,
    activityId: null,
    splitCreateChat: false,
    createBuilderActive: false,
  };

  it("uses stable home header on calm home", () => {
    expect(
      headerForWorkspaceSession({ ...base, calmHome: true }),
    ).toBe(HOME_CHAT_SESSION_HEADER);
  });

  it("sets focus header when focus workspace is open", () => {
    const ctx = {
      ...base,
      workspacePanel: "focus-timer" as const,
    };
    expect(workspaceSessionKey(ctx)).toBe("panel:focus-timer");
    expect(headerForWorkspaceSession(ctx)).toBe(
      "What are you trying to focus on right now?",
    );
  });

  it("sets create header for content generator", () => {
    const ctx = {
      ...base,
      workspacePanel: "content-generator" as const,
    };
    expect(headerForWorkspaceSession(ctx)).toBe("What would you like to create?");
  });

  it("sets projects header", () => {
    const ctx = {
      ...base,
      workspacePanel: "projects" as const,
    };
    expect(headerForWorkspaceSession(ctx)).toBe("What are we working on today?");
  });

  it("sets decision compass header for guided activity", () => {
    const ctx = {
      ...base,
      activeSection: "guided-exercises" as const,
      activityId: "decision-compass",
    };
    expect(workspaceSessionKey(ctx)).toBe("activity:decision-compass");
    expect(headerForWorkspaceSession(ctx)).toBe(
      "What decision are you trying to make?",
    );
  });

  it("does not change key when only chat messages would differ", () => {
    const focus = {
      ...base,
      workspacePanel: "brain-dump" as const,
    };
    expect(workspaceSessionKey(focus)).toBe(workspaceSessionKey(focus));
    expect(headerForWorkspaceSession(focus)).toBe(
      headerForWorkspaceSession(focus),
    );
  });
});
