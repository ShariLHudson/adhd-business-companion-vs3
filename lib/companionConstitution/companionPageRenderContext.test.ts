import { describe, expect, it, vi } from "vitest";
import {
  assertConstitutionalPlaceAuthority,
  buildCompanionPageRenderContext,
  sceneForContext,
  sectionToSceneWorkspaceId,
} from "./companionPageRenderContext";
import { resolveCompanionRenderContext } from "./pipeline";

describe("companionPageRenderContext", () => {
  it("CompanionPageClient can obtain render context from constitutional pipeline", () => {
    const context = buildCompanionPageRenderContext({
      activeSection: "brain-dump",
      workspacePanel: null,
      workspaceBesideChat: false,
      displayEmotion: "overwhelmed",
      messageCount: 0,
    });

    expect(context.globalBackground).toEqual({
      scenePage: "recovery",
      sceneSeed: "brain-dump",
      clearMyMind: true,
      suppress: true,
    });
    expect(context.environment.dataAttributes["data-environment-intelligence"]).toBe(
      "1",
    );
    expect(context.presence.dataAttributes["data-presence-intelligence"]).toBe(
      "1",
    );
  });

  it("resolveCompanionRenderContext returns layers in constitutional order", () => {
    const context = resolveCompanionRenderContext({
      conversation: { activeSection: "focus", messageCount: 2 },
      orchestration: { emotionalState: "stuck", overwhelmed: true },
      scene: { workspaceId: "focus-category", focusCategoryId: "stuck" },
    });

    expect(context.conversation.dataAttributes["data-conversation-intelligence"]).toBe(
      "1",
    );
    expect(context.orchestration.dataAttributes["data-companion-intelligence"]).toBe(
      "1",
    );
    expect(context.environment.placeId).toBe("garden-path");
    expect(context.presence.state).toBeTruthy();
    expect(context.companion).toBeDefined();
  });

  it("sceneForContext preserves legacy section and emotion mapping", () => {
    expect(sceneForContext("overwhelmed", "home")).toBe("recovery");
    expect(sceneForContext("unclear", "focus-timer")).toBe("focus");
    expect(sceneForContext("building", "playbook")).toBe("business");
  });

  it("sectionToSceneWorkspaceId maps workspace panels without inventing place", () => {
    expect(sectionToSceneWorkspaceId("home", "plan-my-day")).toBe("plan-my-day");
    expect(sectionToSceneWorkspaceId("brain-dump")).toBe("clear-my-mind");
    expect(sectionToSceneWorkspaceId("settings")).toBeUndefined();
  });

  it("suppresses legacy wallpaper when Clear My Mind opens beside chat on home", () => {
    const context = buildCompanionPageRenderContext({
      activeSection: "home",
      workspacePanel: "brain-dump",
      workspaceBesideChat: true,
      displayEmotion: "unclear",
      messageCount: 2,
    });

    expect(context.globalBackground).toEqual({
      scenePage: "recovery",
      sceneSeed: "brain-dump",
      clearMyMind: true,
      suppress: true,
    });
  });

  it("suppresses legacy wallpaper when Growth hub is open", () => {
    const context = buildCompanionPageRenderContext({
      activeSection: "home",
      workspacePanel: "growth",
      workspaceBesideChat: true,
      displayEmotion: "unclear",
      messageCount: 1,
    });

    expect(context.globalBackground).toEqual({
      scenePage: "progress",
      sceneSeed: "growth",
      clearMyMind: false,
      suppress: true,
    });
  });

  it("suppresses legacy wallpaper when Growth Journal opens", () => {
    const context = buildCompanionPageRenderContext({
      activeSection: "growth-journal",
      workspacePanel: null,
      workspaceBesideChat: false,
      displayEmotion: "unclear",
      messageCount: 0,
    });

    expect(context.globalBackground).toEqual({
      scenePage: "progress",
      sceneSeed: "growth",
      clearMyMind: false,
      suppress: true,
    });
  });

  it("suppresses legacy wallpaper for Create and Project Homes estate plates", () => {
    expect(
      buildCompanionPageRenderContext({
        activeSection: "create",
        workspacePanel: null,
        workspaceBesideChat: false,
        displayEmotion: "building",
        messageCount: 0,
      }).globalBackground.suppress,
    ).toBe(true);
    expect(
      buildCompanionPageRenderContext({
        activeSection: "project-homes",
        workspacePanel: null,
        workspaceBesideChat: false,
        displayEmotion: "building",
        messageCount: 0,
      }).globalBackground.suppress,
    ).toBe(true);
  });

  it("never returns clearMyMind without suppress (CompanionBackground's Clear My Mind branch is provably dead)", () => {
    // CompanionBackground.tsx no longer branches on clearMyMind when computing
    // photoUrl — it relies on this invariant always holding upstream. If any
    // future branch here ever returns clearMyMind: true with suppress: false,
    // that legacy component would start rendering the wrong (or no) photo.
    const candidateInputs: Array<{
      activeSection: Parameters<typeof buildCompanionPageRenderContext>[0]["activeSection"];
      workspacePanel: Parameters<typeof buildCompanionPageRenderContext>[0]["workspacePanel"];
    }> = [
      { activeSection: "brain-dump", workspacePanel: null },
      { activeSection: "home", workspacePanel: "brain-dump" },
      { activeSection: "home", workspacePanel: null },
      { activeSection: "focus", workspacePanel: null },
      { activeSection: "plan-my-day", workspacePanel: null },
      { activeSection: "focus-audio", workspacePanel: null },
      { activeSection: "create", workspacePanel: null },
      { activeSection: "project-homes", workspacePanel: null },
      { activeSection: "growth-journal", workspacePanel: null },
      { activeSection: "settings", workspacePanel: null },
    ];

    for (const input of candidateInputs) {
      const context = buildCompanionPageRenderContext({
        activeSection: input.activeSection,
        workspacePanel: input.workspacePanel,
        workspaceBesideChat: false,
        displayEmotion: "unclear",
        messageCount: 0,
      });
      if (context.globalBackground.clearMyMind) {
        expect(context.globalBackground.suppress).toBe(true);
      }
    }
  });

  it("flags lower-layer place overrides in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const context = buildCompanionPageRenderContext({
      activeSection: "focus",
      workspacePanel: null,
      workspaceBesideChat: false,
      displayEmotion: "focused",
      messageCount: 1,
    });

    assertConstitutionalPlaceAuthority(context, "planning-table");

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Lower layer attempted place"),
    );
    process.env.NODE_ENV = previousEnv;
    warn.mockRestore();
  });
});
